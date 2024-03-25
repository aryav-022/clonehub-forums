import { Show, cn } from "@/lib/utils";
import type { Community } from "@prisma/client";
import type { Session } from "next-auth";
import Link from "next/link";
import { FC } from "react";
import { Controllers } from "./Header/Header";
import { buttonVariants } from "./ui/Button";

type ExtendedCommunity = Community & {
	_count: {
		members: number;
		posts: number;
	};
};

interface DescriptionCardProps {
	session: Session | null;
	community?: ExtendedCommunity;
}

const DescriptionCard: FC<DescriptionCardProps> = ({ session, community }) => {
	return (
		<div className="scrollbar-thin sticky top-16 space-y-6 overflow-auto rounded-xl bg-neutral-100 px-6 py-8">
			{community ? (
				<>
					<h1 className="font-medium">c/{community.name}</h1>

					<div className="space-y-3">
						<p className="text-balance text-sm text-gray-600">{community!.description}</p>

						<dl className="divide-y">
							<div className="flex w-full justify-between gap-2 py-2 text-sm">
								<dt>Members</dt>
								<dd>{community!._count.members}</dd>
							</div>

							<div className="flex w-full justify-between gap-2 py-2 text-sm">
								<dt>Posts</dt>
								<dd>{community!._count.posts}</dd>
							</div>

							<div className="flex w-full justify-between gap-2 py-2 text-sm">
								<dt>Created</dt>
								<dd>{new Date(community!.createdAt).toDateString()}</dd>
							</div>
						</dl>

						<div className="space-y-2 pt-2">
							<Controllers session={session} community={community!} />

							<Show If={!!session}>
								<Link
									href={`/c/${community!.name}/post/create`}
									className={cn(buttonVariants({ className: "w-full" }))}
								>
									Create Post
								</Link>
							</Show>
						</div>
					</div>
				</>
			) : (
				<>
					<h1 className="font-medium">Welcome to CloneHub Forums.</h1>

					<p className="text-balance text-sm text-gray-600">
						Welcome to the home page of CloneHub Forums. Here you can find the latest discussions,
						posts, and updates from the community. Join the conversation and share your thoughts
						with other members. Start exploring now!
					</p>

					<Link href="/c/create" className={buttonVariants({ className: "w-full" })}>
						Create Community
					</Link>
				</>
			)}
		</div>
	);
};

export default DescriptionCard;
