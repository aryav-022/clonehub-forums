"use server";

import {
	COMMENTS_PER_POST,
	MEMBERS_PER_PAGE,
	NOTIFICATIONS_PER_PAGE,
	POSTS_PER_PAGE,
	SEARCH_RESULTS_LIMIT,
	SUGGESTIONS_PER_REQUEST,
} from "@/config";
import { getAuthSession } from "@/lib/auth";
import { uploadFile } from "@/lib/cloudinary";
import { ActionResponse } from "@/lib/utils";
import type { VoteType } from "@prisma/client";
import { ZodError } from "zod";
import { db } from "./db";
import { CommentCreationRequest } from "./validators/comment";
import { CommunityValidator } from "./validators/community";
import { PostCreationRequest } from "./validators/post";

export async function createCommunity(formData: FormData): Promise<ActionResponse> {
	try {
		const data = Object.fromEntries(formData);

		const { communityName, description, image, banner } = CommunityValidator.parse(data);

		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to create a community.");
		}

		// check if community with the same name already exists
		const community = await db.community.findFirst({
			where: {
				name: {
					equals: communityName,
					mode: "insensitive",
				},
			},
		});

		if (community) {
			return ActionResponse(409, "A community with that name already exists.");
		}

		// upload image and banner to cloudinary
		let imageUrl = null,
			bannerUrl = null;
		if (image?.size > 0) {
			const formData = new FormData();
			formData.append("file", image);

			const { url: _imageUrl, status: imageStatus } = await uploadFile(formData);

			if (imageStatus === 0) {
				return ActionResponse(500, "An error occurred while uploading the image.");
			}

			imageUrl = _imageUrl;
		}

		if (banner?.size > 0) {
			const formData = new FormData();
			formData.append("file", banner);

			const { url: _bannerUrl, status: bannerStatus } = await uploadFile(formData);

			if (bannerStatus === 0) {
				return ActionResponse(500, "An error occurred while uploading the banner.");
			}

			bannerUrl = _bannerUrl;
		}

		await db.community.create({
			data: {
				name: communityName,
				description: description || null,
				banner: bannerUrl,
				image: imageUrl,
				creatorId: session.user.id,
				members: {
					connect: [{ id: session.user.id }],
				},
			},
		});

		return ActionResponse(200, "Community created successfully.");
	} catch (error) {
		if (error instanceof ZodError) {
			return ActionResponse(400, error.errors[0].message);
		}

		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function createPost(payload: PostCreationRequest): Promise<ActionResponse> {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to create a post.");
		}

		const community = await db.community.findFirst({
			where: {
				name: {
					equals: payload.slug,
					mode: "insensitive",
				},
				NOT: {
					banned: {
						some: {
							id: session.user.id,
						},
					},
				},
			},
		});

		if (!community) {
			return ActionResponse(404, "Community not found.");
		}

		const post = await db.post.create({
			data: {
				title: payload.title,
				content: payload.content,
				communityId: community.id,
				authorId: session.user.id,
			},
		});

		return ActionResponse(200, "Post created successfully.", { cuid: post.id });
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

interface LoadPostsParams {
	where?: Object;
	page?: number;
}

export async function loadPosts({ where, page = 0 }: LoadPostsParams) {
	return await db.post.findMany({
		...(where !== undefined && { where }),
		include: {
			author: true,
			community: true,
			votes: true,
			_count: {
				select: { comments: true },
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		skip: page * POSTS_PER_PAGE,
		take: POSTS_PER_PAGE,
	});
}

function detectMentions(content: string): string[] {
	const mentions = content.split(" ").filter((word) => word.startsWith("@"));
	return mentions.map((mention) => mention.slice(1));
}

export async function createComment(payload: CommentCreationRequest): Promise<ActionResponse> {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to comment.");
		}

		const comment = await db.comment.create({
			data: {
				...(payload.variant === "Post" && { postId: payload.postId }),
				...(payload.variant === "Comment" && { replyToId: payload.replyToId }),
				authorId: session.user.id,
				content: payload.content,
			},
			include: {
				author: true,
				_count: {
					select: {
						commentVotes: true,
					},
				},
			},
		});

		const mentions = detectMentions(payload.content);

		mentions.forEach(async (mention) => {
			const user = await db.user.findFirst({
				where: { username: mention },
			});

			if (user) {
				await db.notification.create({
					data: {
						postId: payload.postId,
						userTriggeredId: session.user.id,
						userId: user.id,
						type: "MENTIONED",
						commentId: comment.id,
					},
				});
			}
		});

		return ActionResponse(200, "Comment created successfully.", comment);
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

interface LoadCommentsParams {
	id: string;
	variant: "Post" | "Comment";
	page?: number;
}

export async function loadComments({ id, variant, page = 0 }: LoadCommentsParams) {
	return await db.comment.findMany({
		where: {
			...(variant === "Post" && { postId: id }),
			...(variant === "Comment" && { replyToId: id }),
		},
		include: {
			author: true,
			commentVotes: true,
		},
		orderBy: { createdAt: "desc" },
		skip: page * COMMENTS_PER_POST,
		take: COMMENTS_PER_POST,
	});
}

export async function searchCommunities(query: string) {
	const session = await getAuthSession();

	return await db.community.findMany({
		where: {
			name: {
				contains: query,
				mode: "insensitive",
			},
			...(session && {
				NOT: {
					banned: {
						some: {
							id: session.user.id,
						},
					},
				},
			}),
		},
		orderBy: [
			{
				members: {
					_count: "desc",
				},
			},
			{
				posts: {
					_count: "desc",
				},
			},
			{
				createdAt: "desc",
			},
		],
		take: SEARCH_RESULTS_LIMIT,
	});
}

export async function votePost(id: string, type?: VoteType) {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to vote.");
		}

		const post = await db.post.findUnique({
			where: { id },
		});

		if (!post) {
			return ActionResponse(404, "Post not found.");
		}

		const existingVote = await db.vote.findUnique({
			where: {
				userId_postId: {
					userId: session.user.id,
					postId: post.id,
				},
			},
		});

		if (existingVote) {
			await db.vote.delete({
				where: {
					userId_postId: {
						userId: session.user.id,
						postId: post.id,
					},
				},
			});
		}

		if (type) {
			await db.vote.create({
				data: {
					userId: session.user.id,
					postId: post.id,
					type,
				},
			});
		}

		return ActionResponse(200, "Vote recorded successfully.");
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function voteComment(id: string, type?: VoteType) {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to vote.");
		}

		const comment = await db.comment.findUnique({
			where: { id },
		});

		if (!comment) {
			return ActionResponse(404, "Comment not found.");
		}

		const existingVote = await db.commentVote.findUnique({
			where: {
				userId_commentId: {
					userId: session.user.id,
					commentId: comment.id,
				},
			},
		});

		if (existingVote) {
			await db.commentVote.delete({
				where: {
					userId_commentId: {
						userId: session.user.id,
						commentId: comment.id,
					},
				},
			});
		}

		if (type) {
			await db.commentVote.create({
				data: {
					userId: session.user.id,
					commentId: comment.id,
					type,
				},
			});
		}

		return ActionResponse(200, "Vote recorded successfully.");
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function joinCommunity(id: string) {
	try {
		const session = await getAuthSession();

		// Check if user is logged in
		if (!session) {
			return ActionResponse(401, "You must be logged in to join a community.");
		}

		// check if user is banned
		const isBanned = await db.community.findFirst({
			where: {
				id,
				banned: { some: { id: session.user.id } },
			},
		});

		if (isBanned) {
			return ActionResponse(403, "You are banned from this community.");
		}

		// Check if user is already a member
		const isMember = await db.community.findFirst({
			where: {
				id,
				members: { some: { id: session.user.id } },
			},
		});

		if (isMember) {
			return ActionResponse(400, "You are already a member of this community.");
		}

		// Add user to community
		await db.community.update({
			where: { id },
			data: {
				members: {
					connect: { id: session.user.id },
				},
			},
		});

		return ActionResponse(200, "You have successfully joined the community.");
	} catch (error) {
		return ActionResponse(500, "An error occurred while joining the community.");
	}
}

export async function leaveCommunity(id: string) {
	try {
		const session = await getAuthSession();

		// Check if user is logged in
		if (!session) {
			return ActionResponse(401, "You must be logged in to leave a community.");
		}

		// Get community
		const community = await db.community.findFirst({
			where: {
				id,
				members: {
					some: {
						id: session.user.id,
					},
				},
			},
		});

		// Check if community exists
		if (!community) {
			return ActionResponse(404, "Community not found, or you are not a member.");
		}

		// check if user is the creator
		if (session.user.id === community.creatorId) {
			return ActionResponse(403, "You cannot leave the community as the creator.");
		}

		// Remove user from community
		await db.community.update({
			where: { id: community.id },
			data: {
				members: {
					disconnect: { id: session.user.id },
				},
			},
		});

		return ActionResponse(200, "You have successfully left the community.");
	} catch (error) {
		return ActionResponse(500, "An error occurred while leaving the community.");
	}
}

export async function updateProfilePicture(formData: FormData) {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to update your profile picture.");
		}

		const ALLOWED_IMAGE_TYPES = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/jgp",
			"image/svg",
			"image/gif",
			"image/svg+xml",
		];

		const image = formData.get("file") as File;

		if (image.size <= 0 || !ALLOWED_IMAGE_TYPES.includes(image.type)) {
			return ActionResponse(400, "Invalid image type or size.");
		}

		const { url, status } = await uploadFile(formData);

		if (status === 0) {
			return ActionResponse(500, "An error occurred while uploading the image.");
		}

		await db.user.update({
			where: { id: session.user.id },
			data: {
				image: url,
			},
		});

		return ActionResponse(200, "Profile picture updated successfully.", { url });
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function updateUsername(formData: FormData) {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to update your username.");
		}

		const username = formData.get("username") as string;

		if (session.user.username === username) {
			return ActionResponse(400, "Username is the same as the current one.");
		}

		const existingUser = await db.user.findFirst({
			where: { username },
		});

		if (existingUser) {
			return ActionResponse(409, "Username is already taken.");
		}

		await db.user.update({
			where: { id: session.user.id },
			data: { username },
		});

		return ActionResponse(200, "Username updated successfully.");
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function deleteAccount() {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to delete your account.");
		}

		await db.user.delete({
			where: {
				id: session.user.id,
			},
		});

		return ActionResponse(200, "Account deleted. We regret to see you go");
	} catch (error) {
		console.log(error);

		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function loadNotifications(userId: string, page = 0) {
	return await db.notification.findMany({
		where: { userId },
		include: {
			userTriggered: true,
			post: {
				include: {
					community: true,
				},
			},
			comment: true,
		},
		orderBy: { createdAt: "desc" },
		take: NOTIFICATIONS_PER_PAGE,
		skip: page * NOTIFICATIONS_PER_PAGE,
	});
}

export async function markAllNotificationsAsRead(userId: string) {
	await db.notification.updateMany({
		where: {
			userId,
			read: false,
		},
		data: {
			read: true,
		},
	});
}

export async function getSuggestions(username: string) {
	return await db.user.findMany({
		where: {
			username: {
				startsWith: username,
			},
		},
		take: SUGGESTIONS_PER_REQUEST,
	});
}

export async function updateCommunity(formData: FormData) {
	try {
		const data = Object.fromEntries(formData);

		const { communityName, description, image, banner } = CommunityValidator.parse(data);

		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to update a community.");
		}

		// check if community with the same name already exists
		const community = await db.community.findFirst({
			where: {
				name: {
					equals: communityName,
					mode: "insensitive",
				},
			},
		});

		if (!community) {
			return ActionResponse(404, "Community not found.");
		}

		// upload image and banner to cloudinary
		let imageUrl = null,
			bannerUrl = null;
		if (image?.size > 0) {
			const formData = new FormData();
			formData.append("file", image);

			const { url: _imageUrl, status: imageStatus } = await uploadFile(formData);

			if (imageStatus === 0) {
				return ActionResponse(500, "An error occurred while uploading the image.");
			}

			imageUrl = _imageUrl;
		}

		if (banner?.size > 0) {
			const formData = new FormData();
			formData.append("file", banner);

			const { url: _bannerUrl, status: bannerStatus } = await uploadFile(formData);

			if (bannerStatus === 0) {
				return ActionResponse(500, "An error occurred while uploading the banner.");
			}

			bannerUrl = _bannerUrl;
		}

		await db.community.update({
			where: { id: community.id },
			data: {
				name: communityName,
				description: description || null,
				banner: bannerUrl,
				image: imageUrl,
			},
		});

		return ActionResponse(200, "Community Updated successfully.");
	} catch (error) {
		if (error instanceof ZodError) {
			return ActionResponse(400, error.errors[0].message);
		}

		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function loadMembers(id: string, page = 0, query = "") {
	return await db.user.findMany({
		where: {
			joinedCommunities: {
				some: {
					id,
				},
			},
			OR: [
				{
					username: {
						contains: query,
						mode: "insensitive",
					},
				},
				{
					name: {
						contains: query,
						mode: "insensitive",
					},
				},
			],
		},
		select: {
			id: true,
			name: true,
			username: true,
			image: true,
		},
		take: MEMBERS_PER_PAGE,
		skip: page * MEMBERS_PER_PAGE,
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function removeMember(communityId: string, memberId: string) {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to remove a member.");
		}

		const community = await db.community.findFirst({
			where: {
				id: communityId,
				members: {
					some: {
						id: memberId,
					},
				},
			},
		});

		if (!community) {
			return ActionResponse(404, "Either the community or the member was not found.");
		}

		if (community.creatorId !== session.user.id) {
			return ActionResponse(403, "You are not authorized to remove members from this community.");
		}

		if (community.creatorId === memberId) {
			return ActionResponse(403, "You cannot remove the creator of the community.");
		}

		await db.community.update({
			where: { id: community.id },
			data: {
				members: {
					disconnect: { id: memberId },
				},
			},
		});

		return ActionResponse(200, "Member removed successfully.");
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

export async function banUser(communityId: string, userId: string) {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to ban a member.");
		}

		const community = await db.community.findUnique({
			where: { id: communityId },
		});

		if (!community) {
			return ActionResponse(404, "Community not found.");
		}

		if (community.creatorId !== session.user.id) {
			return ActionResponse(403, "You are not authorized to ban users from this community.");
		}

		if (community.creatorId === userId) {
			return ActionResponse(403, "You cannot ban the creator of the community.");
		}

		await db.community.update({
			where: { id: community.id },
			data: {
				banned: {
					connect: { id: userId },
				},
			},
		});

		await db.community.update({
			where: { id: community.id },
			data: {
				members: {
					disconnect: { id: userId },
				},
			},
		});

		return ActionResponse(200, "User banned successfully.");
	} catch (error) {
		return ActionResponse(500, "An unexpected server error occurred. Please try again later.");
	}
}

export async function banUserByUsername(communityId: string, memberUsername: string) {
	try {
		const user = await db.user.findFirst({
			where: { username: memberUsername },
		});

		if (!user) {
			return ActionResponse(404, "User not found.");
		}

		return banUser(communityId, user.id);
	} catch (error) {
		return ActionResponse(500, "An unexpected server error occurred. Please try again later.");
	}
}

export async function loadBannedUsers(id: string, page = 0, query = "") {
	return await db.user.findMany({
		where: {
			communitiesBannedFrom: {
				some: {
					id,
				},
			},
			OR: [
				{
					username: {
						contains: query,
						mode: "insensitive",
					},
				},
				{
					name: {
						contains: query,
						mode: "insensitive",
					},
				},
			],
		},
		select: {
			id: true,
			name: true,
			username: true,
			image: true,
		},
		take: MEMBERS_PER_PAGE,
		skip: page * MEMBERS_PER_PAGE,
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function unbanUser(communityId: string, userId: string) {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to ban a member.");
		}

		const community = await db.community.findFirst({
			where: {
				id: communityId,
				banned: {
					some: { id: userId },
				},
			},
		});

		if (!community) {
			return ActionResponse(404, "Either the community or the user was not banned.");
		}

		if (community.creatorId !== session.user.id) {
			return ActionResponse(403, "You are not authorized to unban users from this community.");
		}

		await db.community.update({
			where: { id: community.id },
			data: {
				banned: {
					disconnect: { id: userId },
				},
			},
		});

		if (community.creatorId === userId) {
			return ActionResponse(200, "Woah! How did you manage to ban the creator?");
		}

		return ActionResponse(200, "Member was unbanned successfully.");
	} catch (error) {
		return ActionResponse(500, "An unexpected server error occurred. Please try again later.");
	}
}
