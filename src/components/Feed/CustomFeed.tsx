import { POSTS_PER_PAGE } from "@/config";
import { db } from "@/lib/db";
import type { Session } from "next-auth";
import PostFeed from "./PostFeed";
import { loadPosts } from "@/lib/actions";

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

	const posts = await loadPosts({ where });

	return <PostFeed initialPosts={posts} where={where} session={session} />;
};

export default CustomFeed;
