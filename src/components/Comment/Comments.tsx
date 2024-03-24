"use client";

import { COMMENTS_PER_POST } from "@/config";
import { loadComments, voteComment } from "@/lib/actions";
import { type ActionResponse, Show, cn, timeFromNow } from "@/lib/utils";
import { useIntersection } from "@mantine/hooks";
import type { Comment, CommentVote, User } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, type FC, useOptimistic, useMemo } from "react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import CommentForm from "./CommentForm";
import VoteCard from "../VoteCard";

export type ExtendedComments = Comment & {
	author: User;
	commentVotes: CommentVote[];
};

interface CommentsProps {
	postId?: string;
	replyToId?: string;
	comments: ExtendedComments[];
	setComments: React.Dispatch<React.SetStateAction<ExtendedComments[]>>;
	session: Session | null;
}

const Comments: FC<CommentsProps> = ({ postId, replyToId, comments, setComments, session }) => {
	const { ref, entry } = useIntersection();
	const toast = useToast();

	useEffect(() => {
		if (entry?.isIntersecting) {
			(async () => {
				const moreComments = await loadComments({
					...(postId !== undefined && { postId }),
					...(replyToId !== undefined && { replyToId }),
					page: comments.length / COMMENTS_PER_POST,
				});

				if (!moreComments || moreComments.length === 0) {
					entry.target.remove();

					toast({
						title: "No more comments",
						message: "There are no more comments to load.",
					});
				} else {
					setComments((prev) => [...prev, ...moreComments]);
				}
			})();
		}
	}, [entry, comments, postId, replyToId, setComments, toast]);

	return (
		<ul className="m-4 space-y-4 border-l-2 pl-6">
			<Show If={comments.length === 0}>
				<p>No comments yet.</p>
			</Show>

			<Show Else={comments.length === 0}>
				{comments.map((comment) => (
					<CommentCard key={comment.id} comment={comment} session={session} />
				))}
			</Show>

			<CommentPlaceholder ref={ref} />
		</ul>
	);
};

function CommentCard({ comment, session }: { comment: ExtendedComments; session: Session | null }) {
	const [showReplies, setShowReplies] = useState(false);
	const [replies, setReplies] = useState<ExtendedComments[]>([]);

	function addReply(reply: ExtendedComments) {
		setReplies((prev) => [reply, ...prev]);
	}

	let currVote: -1 | 0 | 1 = 0;

	const initialVotes = comment.commentVotes.reduce((acc, vote) => {
		if (vote.userId === session?.user.id) {
			if (vote.type === "UP") currVote = 1;
			if (vote.type === "DOWN") currVote = -1;
		}

		if (vote.type === "UP") return acc + 1;
		else if (vote.type === "DOWN") return acc - 1;
		return acc;
	}, 0);

	return (
		<li>
			<div className="flex items-start gap-2">
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
				</div>
			</div>

			<div className="flex items-center gap-4">
				<VoteCard horizontal id={comment.id} currVote={currVote} initialVotes={initialVotes} />

				<Button
					variant="ghost"
					className="flex items-center gap-1"
					onClick={() => setShowReplies((prev) => !prev)}
				>
					<MessageSquare size={16} /> replies
				</Button>
			</div>

			<Show If={showReplies}>
				<CommentForm replyToId={comment.id} session={session} addComment={addReply} rows={1} />

				<Comments
					comments={replies}
					replyToId={comment.id}
					session={session}
					setComments={setReplies}
				/>
			</Show>
		</li>
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
