import { z } from "zod";

export const CommentValidator = z.object({
	postId: z.string(),
	replyToId: z.string().optional(),
	variant: z.ZodEnum.create(["Post", "Comment"]),
	content: z.string(),
});

export type CommentCreationRequest = z.infer<typeof CommentValidator>;
