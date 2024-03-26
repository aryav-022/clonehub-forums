import { z } from "zod";

export const CommentValidator = z.object({
	id: z.string(),
	variant: z.ZodEnum.create(["Post", "Comment"]),
	content: z.string(),
});

export type CommentCreationRequest = z.infer<typeof CommentValidator>;
