import { loadPosts } from "@/lib/actions";
import type { Session } from "next-auth";
import PostFeed from "./PostFeed";
import { db } from "@/lib/db";
import { COMMUNITIES_PER_PAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

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

	return (
		<>
			{posts.length === 0 && <CommunitySuggestion />}
			<PostFeed initialPosts={posts} where={where} session={session} />
		</>
	);
};

async function CommunitySuggestion() {
	const communities = await db.community.findMany({
		take: COMMUNITIES_PER_PAGE,
		orderBy: [
			{
				posts: {
					_count: "desc",
				},
			},
			{
				members: {
					_count: "desc",
				},
			},
		],
	});

	return (
		<div>
			<h1 className="text-2xl font-semibold">Follow Communities</h1>
			<p className="">Follow Communities to get posts in your feed!</p>

			<ul className="flex flex-wrap gap-4 py-4">
				{communities.map((community) => (
					<li key={community.id}>
						<Link
							className="flex h-40 w-40 cursor-pointer flex-col justify-between gap-2 rounded-lg bg-neutral-100 p-4 hover:bg-neutral-200"
							href={`/c/${community.name}`}
						>
							<div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full">
								{community.image ? (
									<Image src={community.image} alt={community.name} width={80} height={80} />
								) : (
									<div className="h-20 w-20 bg-neutral-800" />
								)}
							</div>
							<h2 className="text-center text-lg font-bold">c/{community.name}</h2>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

export default CustomFeed;
