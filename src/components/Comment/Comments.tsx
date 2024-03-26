"use client";

import { COMMENTS_PER_POST } from "@/config";
import { loadComments } from "@/lib/actions";
import { Show, timeFromNow } from "@/lib/utils";
import { useIntersection } from "@mantine/hooks";
import type { Comment, CommentVote, User } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, type FC } from "react";
import VoteCard from "../VoteCard";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import CommentForm from "./CommentForm";

export type ExtendedComments = Comment & {
	author: User;
	commentVotes: CommentVote[];
};

interface CommentsProps {
	id: string;
	session: Session | null;
	variant: "Post" | "Comment";
	initialComments: ExtendedComments[];
}

const Comments: FC<CommentsProps> = ({ id, session, variant, initialComments }) => {
	const [comments, setComments] = useState<ExtendedComments[]>(initialComments);

	const { ref, entry } = useIntersection();
	const toast = useToast();

	useEffect(() => {
		if (entry?.isIntersecting) {
			(async () => {
				const moreComments = await loadComments({
					id,
					variant,
					page: comments.length / COMMENTS_PER_POST,
				});

				if (!moreComments || moreComments.length === 0) {
					entry.target.classList.add("hidden");

					toast({
						title: "No more comments",
						message: "There are no more comments to load.",
					});
				} else {
					setComments((prev) => [...prev, ...moreComments]);
				}
			})();
		}
	}, [entry, comments, id, variant, setComments, toast]);

	function addComment(comment: ExtendedComments) {
		setComments((prev) => [comment, ...prev]);
	}

	return (
		<>
			<CommentForm id={id} variant={variant} session={session} addComment={addComment} />

			<ul className="m-4 space-y-4 border-l-2 pl-6">
				<Show If={comments.length === 0}>
					<li>No comments yet.</li>
				</Show>

				<Show Else={comments.length === 0}>
					{comments.map((comment) => (
						<CommentCard key={comment.id} comment={comment} session={session} />
					))}
				</Show>

				<CommentPlaceholder ref={ref} />
			</ul>
		</>
	);
};

function CommentCard({ comment, session }: { comment: ExtendedComments; session: Session | null }) {
	const [showReplies, setShowReplies] = useState(false);

	let currVote: -1 | 0 | 1 = 0;

	const initialVotes =
		comment.commentVotes?.reduce((acc, vote) => {
			if (vote.userId === session?.user.id) {
				if (vote.type === "UP") currVote = 1;
				if (vote.type === "DOWN") currVote = -1;
			}

			if (vote.type === "UP") return acc + 1;
			else if (vote.type === "DOWN") return acc - 1;
			return acc;
		}, 0) || 0;

	return (
		<li>
			<div className="flex items-start gap-2">
				<div className="grid h-8 min-h-8 w-8 min-w-8 place-items-center overflow-hidden rounded-full bg-neutral-800">
					<Show If={!!comment.author.image}>
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
				<Comments id={comment.id} variant="Comment" session={session} initialComments={[]} />
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
