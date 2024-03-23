"use client";

import { timeFromNow } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { FC, useRef } from "react";
import VoteCard from "./VoteCard";
import { ExtendedPost } from "@/types/prisma";
import EditorOutput from "./Editor/EditorOutput";

interface PostCardProps {
	post: ExtendedPost;
}

const PostCard: FC<PostCardProps> = ({ post }) => {
	const cardRef = useRef<HTMLDivElement | null>(null);

	return (
		<div className="overflow-hidden rounded-lg">
			<div
				ref={cardRef}
				className="relative flex max-h-64 gap-4 overflow-hidden bg-neutral-50 px-4 py-4"
			>
				<VoteCard initialVotes={post._count.votes} />

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

					<EditorOutput content={post.content} />
				</div>

				{cardRef.current && cardRef.current?.scrollHeight > cardRef.current?.clientHeight && (
					<div className="absolute bottom-0 left-0 right-0 z-10 h-40 bg-gradient-to-t from-neutral-50 to-transparent"></div>
				)}
			</div>

			<div className="flex items-center gap-2 bg-zinc-100 px-6 py-3 text-sm">
				<MessageSquare size={18} /> {post._count.votes} comments
			</div>
		</div>
	);
};

export default PostCard;
