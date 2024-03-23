"use server";

import { getAuthSession } from "@/lib/auth";
import { uploadFile } from "@/lib/cloudinary";
import { ActionResponse } from "@/lib/utils";
import { ZodError } from "zod";
import { db } from "./db";
import { CommunityValidator } from "./validators/community";
import { PostCreationRequest } from "./validators/post";
import { COMMENTS_PER_POST, POSTS_PER_PAGE } from "@/config";
import { CommentCreationRequest } from "./validators/comment";

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

		const post = await db.post.create({
			data: {
				title: payload.title,
				content: payload.content,
				communityId: payload.communityId,
				authorId: session.user.id,
			},
		});

		return ActionResponse(200, "Post created successfully.", { cuid: post.id });
	} catch (error) {
		return ActionResponse(500, "An unexpected error occurred. Please try again later.");
	}
}

interface LoadPostsParams {
	where?: {
		communityId?: string;
	};
	page?: number;
}

export async function loadPosts({ where, page = 0 }: LoadPostsParams) {
	return await db.post.findMany({
		...(where !== undefined && { where }),
		include: {
			author: true,
			community: true,
			_count: {
				select: { votes: true, comments: true },
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
			_count: {
				select: {
					commentVotes: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
		skip: page * COMMENTS_PER_POST,
		take: COMMENTS_PER_POST,
	});
}
