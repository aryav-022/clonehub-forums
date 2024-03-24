import CreatePostInput from "@/components/CreatePostInput";
import DescriptionCard from "@/components/DescriptionCard";
import PostFeed from "@/components/Feed/PostFeed";
import Header from "@/components/Header/Header";
import { loadPosts } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
	params: { slug: string };
}

const Page = async ({ params: { slug } }: PageProps) => {
	const community = await db.community.findFirst({
		where: {
			name: {
				equals: slug,
				mode: "insensitive",
			},
		},
		include: {
			_count: {
				select: { members: true, posts: true },
			},
		},
	});

	if (!community) return notFound();

	const session = await getAuthSession();

	const where = { communityId: community.id };

	const posts = await loadPosts({ where });

	return (
		<div className="col-span-4 space-y-4 py-4">
			<Header community={community} session={session} />

			<div className="grid grid-cols-3 items-start gap-4">
				<section className="col-span-2 min-h-dvh space-y-4 pb-4">
					<CreatePostInput slug={slug} session={session} />
					<PostFeed session={session} initialPosts={posts} where={where} />
				</section>

				<DescriptionCard
					title={`c/${slug}`}
					description="Welcome to the CloneHub Forums! This is a community-driven forum app where users can engage in discussions, share content, and vote on posts and comments. Join CloneHub's forum to connect with like-minded individuals and explore a wide range of topics."
				/>
			</div>
		</div>
	);
};

export default Page;
