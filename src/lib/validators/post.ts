import { z } from "zod";

export const PostValidator = z.object({
	title: z.string().min(1).max(100),
	content: z.any().optional(),
	communityId: z.string().cuid(),
});

export type PostCreationRequest = z.infer<typeof PostValidator>;
