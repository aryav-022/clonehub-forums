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
				authorId: session.user.id,
				content: payload.content,
				...(payload.postId !== undefined && { postId: payload.postId }),
				...(payload.replyToId !== undefined && { replyToId: payload.replyToId }),
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
	postId?: string;
	replyToId?: string;
	page?: number;
}

export async function loadComments({ postId, replyToId, page = 0 }: LoadCommentsParams) {
	return await db.comment.findMany({
		where: {
			...(postId !== undefined && { postId }),
			...(postId === undefined && { replyToId }),
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
}

export async function voteComment(id: string, type?: VoteType) {
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
}
