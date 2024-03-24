import { loadPosts } from "@/lib/actions";
import PostFeed from "./PostFeed";

interface GeneralFeedProps {}

const GeneralFeed = async ({}: GeneralFeedProps) => {
	const posts = await loadPosts({});

	return <PostFeed initialPosts={posts} session={null} />;
};

export default GeneralFeed;
