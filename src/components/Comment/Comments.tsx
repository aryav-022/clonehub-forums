"use client";

import { COMMENTS_PER_POST } from "@/config";
import { loadComments } from "@/lib/actions";
import { Show, timeFromNow } from "@/lib/utils";
import { useIntersection } from "@mantine/hooks";
import type { Comment, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react";
import CommentForm from "./CommentForm";
import { useToast } from "../ui/Toast";
import type { Session } from "next-auth";

export type ExtendedComments = Comment & {
	author: User;
	_count: {
		commentVotes: number;
	};
};

interface CommentsProps {
	postId: string;
	comments: ExtendedComments[];
	setComments: React.Dispatch<React.SetStateAction<ExtendedComments[]>>;
	session: Session | null;
}

const Comments: FC<CommentsProps> = ({ postId, comments, setComments, session }) => {
	const { ref, entry } = useIntersection();

	useEffect(() => {
		if (entry?.isIntersecting) {
			(async () => {
				const moreComments = await loadComments({
					postId,
					page: comments.length / COMMENTS_PER_POST,
				});

				if (!moreComments || moreComments.length === 0) {
					entry.target.remove();
				} else {
					setComments((prev) => [...prev, ...moreComments]);
				}
			})();
		}
	}, [entry]);

	return (
		<ul className="space-y-4">
			<Show If={comments.length === 0}>
				<p>No comments yet.</p>
			</Show>

			<Show Else={comments.length === 0}>
				{comments.map((comment) => (
					<CommentCard key={comment.id} comment={comment} session={session} />
				))}

				<CommentPlaceholder ref={ref} />
			</Show>
		</ul>
	);
};

function CommentCard({ comment, session }: { comment: ExtendedComments; session: Session | null }) {
	const [showReplies, setShowReplies] = useState(false);
	const [replies, setReplies] = useState<ExtendedComments[]>([]);
	const toast = useToast();

	const { ref, entry } = useIntersection();

	useEffect(() => {
		if (entry?.isIntersecting) {
			(async () => {
				const moreReplies = await loadComments({
					replyToId: comment.id,
					page: replies.length / COMMENTS_PER_POST,
				});

				if (!moreReplies || moreReplies.length === 0) {
					entry.target.remove();

					toast({
						title: "No replies",
						message: "This comment has no more replies yet.",
					});
				} else {
					setReplies((prev) => [...prev, ...moreReplies]);
				}
			})();
		}
	}, [entry]);

	function addReply(comment: ExtendedComments) {
		setReplies((prev) => [comment, ...prev]);
	}

	return (
		<>
			<li className="flex items-start gap-2">
				<div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-800">
					<Show If={comment.author.image}>
						<Image src={comment.author.image!} alt="profile picture" height={36} width={36} />
					</Show>
				</div>

				<div>
					<small className="text-sm">
						<Link href={`/u/${comment.author.username}`} className="font-medium">
							u/{comment.author.username}
						</Link>{" "}
						&bull; {timeFromNow(comment.createdAt)}
					</small>

					<p>{comment.content}</p>

					<div className="flex items-center gap-4">
						<Button variant="ghost" className="p-2">
							<ArrowBigUp size={18} />
						</Button>
						<small>{comment._count.commentVotes}</small>
						<Button variant="ghost" className="p-2">
							<ArrowBigDown size={18} />
						</Button>

						<Button
							variant="ghost"
							className="flex items-center gap-1"
							onClick={() => setShowReplies((prev) => !prev)}
						>
							<MessageSquare size={16} /> replies
						</Button>
					</div>
				</div>
			</li>

			<Show If={showReplies}>
				<ul className="ml-3 space-y-4 border-l-2 pl-6">
					<CommentForm replyToId={comment.id} session={session} rows={1} addComment={addReply} />

					{replies.map((reply) => (
						<CommentCard key={reply.id} comment={reply} session={session} />
					))}

					<CommentPlaceholder ref={ref} />
				</ul>
			</Show>
		</>
	);
}
CommentCard.displayName = "CommentCard";

const CommentPlaceholder = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
	(props, ref) => {
		return (
			<li ref={ref} {...props} className="animate-pulse space-y-2">
				<p className="h-4 w-1/2 rounded-lg bg-neutral-200"></p>
				<p className="h-4 w-3/4 rounded-lg bg-neutral-200"></p>
			</li>
		);
	}
);
CommentPlaceholder.displayName = "CommentPlaceholder";

export default Comments;
