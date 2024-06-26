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
	const session = await getAuthSession();

	const community = await db.community.findFirst({
		where: {
			name: {
				equals: slug,
				mode: "insensitive",
			},
			...(session && {
				NOT: {
					banned: {
						some: {
							id: session.user.id,
						},
					},
				},
			}),
		},
		include: {
			_count: {
				select: { members: true, posts: true },
			},
		},
	});

	if (!community) return notFound();

	const where = { communityId: community.id };

	const posts = await loadPosts({ where });

	return (
		<div className="col-span-5 space-y-4 py-4 lg:col-span-4">
			<Header community={community} session={session} />

			<div className="grid grid-cols-3 items-start gap-4">
				<section className="col-span-3 min-h-dvh space-y-4 pb-4 md:col-span-2">
					<CreatePostInput slug={slug} session={session} />
					<PostFeed session={session} initialPosts={posts} where={where} />
				</section>

				<DescriptionCard session={session} community={community} />
			</div>
		</div>
	);
};

export default Page;
