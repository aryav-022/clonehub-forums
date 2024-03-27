"use client";

import { timeFromNow } from "@/lib/utils";
import { ExtendedPost } from "@/types/prisma";
import { MessageSquare } from "lucide-react";
import type { Session } from "next-auth";
import Link from "next/link";
import { FC, useRef } from "react";
import EditorOutput from "./Editor/EditorOutput";
import VoteCard from "./VoteCard";

interface PostCardProps {
	post: ExtendedPost;
	session: Session | null;
}

const PostCard: FC<PostCardProps> = ({ post, session }) => {
	const contentRef = useRef<HTMLDivElement | null>(null);

	let currVote: -1 | 0 | 1 = 0;

	const initialVotes = post.votes.reduce((acc, vote) => {
		if (vote.userId === session?.user.id) {
			if (vote.type === "UP") currVote = 1;
			if (vote.type === "DOWN") currVote = -1;
		}

		if (vote.type === "UP") return acc + 1;
		if (vote.type === "DOWN") return acc - 1;
		return acc;
	}, 0) || 0;

	return (
		<div className="overflow-hidden rounded-lg">
			<div className="flex max-h-64 gap-4 overflow-hidden bg-neutral-50 px-4 py-4">
				<VoteCard id={post.id} initialVotes={initialVotes} currVote={currVote} />

				<div className="space-y-2">
					<div className="text-xs">
						Posted by{" "}
						<Link href={`/u/${post.author.username}`} className="font-medium">
							u/{post.author.username}
						</Link>{" "}
						in{" "}
						<Link href={`/c/${post.community.name}`} className="font-medium">
							c/{post.community.name}
						</Link>{" "}
						&bull; <span>{timeFromNow(post.createdAt)}</span>
					</div>

					<Link href={`/c/${post.community.name}/post/${post.id}`} className="block">
						<h1 className="text-xl font-semibold">{post.title}</h1>
					</Link>

					<div ref={contentRef} className="relative max-h-40 w-full overflow-clip text-sm">
						<EditorOutput content={post.content} />

						{contentRef.current?.clientHeight === 160 && (
							// blur bottom if content is too long
							<div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 bg-zinc-100 px-6 py-3 text-sm">
				<MessageSquare size={18} /> {post._count.comments} comments
			</div>
		</div>
	);
};

export default PostCard;
