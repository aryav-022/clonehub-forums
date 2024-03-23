import { z } from "zod";

export const CommentValidator = z.object({
	authorId: z.string(),
	content: z.string(),
	postId: z.string().optional(),
	replyToId: z.string().optional(),
});

export type CommentCreationRequest = z.infer<typeof CommentValidator>;
