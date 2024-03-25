import PostFeed from "@/components/Feed/PostFeed";
import { loadPosts } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
	params: { username: string };
}

const Page = async ({ params: { username } }: PageProps) => {
	const user = await db.user.findFirst({
		where: { username },
		include: {
			createdCommunities: true,
			_count: {
				select: { createdPosts: true },
			},
		},
	});

	if (!user) return notFound();

	const where = { author: { username } };
	const posts = await loadPosts({ where });

	const session = await getAuthSession();

	return (
		<section className="col-span-4 my-4 space-y-8 divide-y overflow-hidden rounded-lg">
			<div className="flex gap-8 rounded-lg bg-neutral-50 py-8">
				<div className="mx-16 grid h-40 w-40 place-items-center overflow-hidden rounded-full bg-neutral-800">
					{user.image && <Image src={user.image} alt={user.username!} height={200} width={200} />}
				</div>

				<div className="flex flex-col justify-between">
					<div>
						<h1 className="text-2xl font-medium">u/{user.username}</h1>
						<h2 className="text-lg font-medium">{user.name}</h2>
					</div>

					<dl className="flex gap-8">
						<div className="flex gap-2 text-lg font-semibold">
							<dt>Posts</dt>
							<dd>{user._count.createdPosts}</dd>
						</div>
						<div className="flex gap-2 text-lg font-semibold">
							<dt>Communities</dt>
							<dd>{user.createdCommunities.length}</dd>
						</div>
					</dl>

					<div>
						Joined CloneHub on <time>{new Date(user.createdAt).toDateString()}</time>
					</div>
				</div>
			</div>

			<div className="flex gap-4 py-4">
				<div className="basis-2/3 space-y-4 border-r pr-4">
					<h3 className="text-xl font-medium">Posts</h3>

					<PostFeed initialPosts={posts} session={session} where={where} />
				</div>

				<div className="basis-1/3">
					<h3 className="text-xl font-medium">Communities Created</h3>
					<ul className="py-4">
						{user.createdCommunities.map((community) => (
							<li key={community.id}>
								<Link
									href={`/c/${community.name}`}
									className="flex cursor-pointer items-center gap-4 rounded-lg p-2 hover:bg-neutral-200"
								>
									<div className="grid h-12 min-h-12 w-12 min-w-12 place-items-center overflow-hidden rounded-full bg-neutral-800">
										{community.image && (
											<Image src={community.image} alt={community.name} height={48} width={48} />
										)}
									</div>

									<div>
										<h3 className="font-semibold">c/{community.name}</h3>
										<small className="line-clamp-2">{community.description}</small>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
};

export default Page;
