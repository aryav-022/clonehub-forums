import { POSTS_PER_PAGE } from "@/config";
import { db } from "@/lib/db";
import type { Session } from "next-auth";
import PostFeed from "./PostFeed";

interface CustomFeedProps {
	session: Session;
}

const CustomFeed = async ({ session }: CustomFeedProps) => {
	const where = {
		community: {
			members: {
				some: {
					email: session.user.email,
				},
			},
		},
	};

	const posts = await db.post.findMany({
		where,
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
		take: POSTS_PER_PAGE,
	});

	return <PostFeed initialPosts={posts} where={where} />;
};

export default CustomFeed;
