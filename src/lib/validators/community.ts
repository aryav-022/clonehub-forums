import { z } from "zod";

const MAX_PROFILE_PICTURE_SIZE = 200000; // 200KB
const MAX_BANNER_SIZE = 2000000; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const CommunityValidator = z.object({
	communityName: z
		.string()
		.min(3)
		.max(21)
		.refine(
			(s) => /^[A-Za-z0-9-]+$/.test(s),
			"Only lowercase, uppercase, English letters, numbers, and hyphens are allowed in community names."
		),
	description: z
		.string()
		.optional()
		.refine(
			(s) => !s || (s.length >= 5 && s.length <= 500),
			"Description must be between 5 and 500 characters."
		),
	image: z
		.any()
		.optional()
		.refine(
			(file) => !file?.size || file?.size <= MAX_PROFILE_PICTURE_SIZE,
			`Max image size is 200KB.`
		)
		.refine(
			(file) => !file?.size || ACCEPTED_IMAGE_TYPES.includes(file?.type),
			"Only .jpg, .jpeg, .png and .webp formats are supported."
		),
	banner: z
		.any()
		.optional()
		.refine((file) => !file?.size || file?.size <= MAX_BANNER_SIZE, `Max image size is 2MB.`)
		.refine(
			(file) => !file?.size || ACCEPTED_IMAGE_TYPES.includes(file?.type),
			"Only .jpg, .jpeg, .png and .webp formats are supported."
		),
});

export type CreateCommunityPayload = z.infer<typeof CommunityValidator>;
