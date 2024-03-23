import { POSTS_PER_PAGE } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";

interface GeneralFeedProps {}

const GeneralFeed = async ({}: GeneralFeedProps) => {
	const posts = await db.post.findMany({
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

	return <PostFeed initialPosts={posts} />;
};

export default GeneralFeed;
