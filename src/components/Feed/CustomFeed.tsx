import { COMMUNITIES_PER_PAGE } from "@/config";
import { loadPosts } from "@/lib/actions";
import { db } from "@/lib/db";
import { Show } from "@/lib/utils";
import type { Community } from "@prisma/client";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Controllers } from "../Header/Header";
import Paragraph from "../Header/Paragraph";
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

	const posts = await loadPosts({ where });

	return (
		<>
			<Show If={posts.length === 0}>
				<CommunitySuggestion session={session} />
			</Show>
			<Show Else={posts.length === 0}>
				<PostFeed initialPosts={posts} where={where} session={session} />
			</Show>
		</>
	);
};

async function CommunitySuggestion({ session }: CustomFeedProps) {
	const communities = await db.community.findMany({
		where: {
			NOT: {
				banned: {
					some: {
						id: session.user.id,
					},
				},
			},
		},
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
			{
				createdAt: "asc",
			},
		],
	});

	return (
		<div>
			<h1 className="text-2xl font-semibold">Follow Communities</h1>
			<p className="">Follow Communities to get posts in your feed!</p>

			<ul className="flex flex-wrap gap-4 py-4">
				{communities.map((community) => (
					<CommunityCard key={community.id} community={community} session={session} />
				))}
			</ul>
		</div>
	);
}

function CommunityCard({ community, session }: { community: Community; session: Session }) {
	return (
		<li className="group relative">
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
				<h2 className="w-full truncate text-center text-lg font-bold">c/{community.name}</h2>
			</Link>

			<div className="absolute bottom-1/2 left-1/2 z-40 hidden w-96 space-y-2 rounded-lg bg-white p-4 shadow-lg group-hover:flex group-hover:flex-col">
				<div className="flex flex-wrap items-center gap-2">
					<Link href={`/c/${community.name}`}>
						<h1 className="text-lg font-bold">{community.name}</h1>
					</Link>

					<Controllers community={community} session={session} size="xs" />
				</div>

				<Show If={community.description?.length !== 0}>
					<Paragraph lineClamp="line-clamp-3" className="text-sm">
						{community.description}
					</Paragraph>
				</Show>
			</div>
		</li>
	);
}

export default CustomFeed;
