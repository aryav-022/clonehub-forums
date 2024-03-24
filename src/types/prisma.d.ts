import type { Community, Post, User, Vote } from "@prisma/client";

export type ExtendedPost = Post & {
	author: User;
	community: Community;
	votes: Vote[];
	_count: {
		comments: number;
	};
};
