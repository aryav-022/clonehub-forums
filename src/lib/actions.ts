"use server";

import { getAuthSession } from "@/lib/auth";
import { uploadFile } from "@/lib/cloudinary";
import { ActionResponse } from "@/lib/utils";
import { ZodError } from "zod";
import { db } from "./db";
import { CommunityValidator } from "./validators/community";
import { PostCreationRequest } from "./validators/post";
import { COMMENTS_PER_POST, POSTS_PER_PAGE, SEARCH_RESULTS_LIMIT } from "@/config";
import { CommentCreationRequest } from "./validators/comment";
import type { VoteType } from "@prisma/client";

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

export async function createComment(payload: CommentCreationRequest): Promise<ActionResponse> {
	try {
		const session = await getAuthSession();

		if (!session) {
			return ActionResponse(401, "You must be logged in to comment.");
		}

		const comment = await db.comment.create({
			data: {
				...(payload.variant === "Post" && { postId: payload.id }),
				...(payload.variant === "Comment" && { replyToId: payload.id }),
				authorId: session.user.id,
				content: payload.content,
			},
		});

		const extendedComment = await db.comment.findUnique({
			where: { id: comment.id },
			include: {
				author: true,
				_count: {
					select: {
						commentVotes: true,
					},
				},
			},
		});

		return ActionResponse(200, "Comment created successfully.", extendedComment);
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
	return await db.community.findMany({
		where: {
			name: {
				contains: query,
				mode: "insensitive",
			},
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
