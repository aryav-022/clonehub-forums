import { Community, Post, User } from "@prisma/client";

export type ExtendedPost = Prettify<
	Post & {
		author: User;
		community: Community;
		_count: {
			votes: number;
			comments: number;
		};
	}
>;
