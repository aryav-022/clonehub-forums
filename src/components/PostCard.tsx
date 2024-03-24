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
	const contentRef = useRef<HTMLDivElement | null>(null);

	return (
		<div className="overflow-hidden rounded-lg">
			<div className="flex max-h-64 gap-4 overflow-hidden bg-neutral-50 px-4 py-4">
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
				<MessageSquare size={18} /> {post._count.votes} comments
			</div>
		</div>
	);
};

export default PostCard;
