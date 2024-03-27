"use client";

import { COMMENTS_PER_POST } from "@/config";
import { loadComments } from "@/lib/actions";
import { Show, cn, isValidUrl, timeFromNow } from "@/lib/utils";
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
import Paragraph from "../Header/Paragraph";

export type ExtendedComment = Comment & {
	author: User;
	commentVotes: CommentVote[];
};

interface CommentsProps {
	postId: string;
	replyToId?: string;
	session: Session | null;
	variant: "Post" | "Comment";
	initialComments: ExtendedComment[];
	author?: string;
	highlightedComment?: ExtendedComment | null;
}

const Comments: FC<CommentsProps> = ({
	postId,
	replyToId,
	session,
	variant,
	initialComments,
	author,
	highlightedComment,
}) => {
	const [comments, setComments] = useState<ExtendedComment[]>(initialComments);
	const [shouldLoad, setShouldLoad] = useState<boolean>(true);

	const { ref, entry } = useIntersection();
	const toast = useToast();

	useEffect(() => {
		if (shouldLoad && entry?.isIntersecting) {
			(async () => {
				const moreComments = await loadComments({
					id: variant === "Post" ? postId : replyToId!,
					variant,
					page: comments.length / COMMENTS_PER_POST,
				});

				if (!moreComments || moreComments.length === 0) {
					setShouldLoad(false);

					toast({
						title: "No more comments",
						message: "There are no more comments to load.",
					});
				} else {
					setComments((prev) => [...prev, ...moreComments]);
				}
			})();
		}
	}, [entry, comments, postId, replyToId, variant, setComments, toast, shouldLoad, setShouldLoad]);

	function addComment(comment: ExtendedComment) {
		setComments((prev) => [comment, ...prev]);
	}

	return (
		<>
			<CommentForm
				postId={postId}
				replyToId={replyToId}
				variant={variant}
				session={session}
				addComment={addComment}
				author={author}
			/>

			<ul className="m-4 space-y-4 border-l-2 pl-6">
				<Show If={!!highlightedComment}>
					<CommentCard
						postId={postId}
						comment={highlightedComment!}
						session={session}
						highlighted={true}
					/>
				</Show>

				<Show If={comments.length === 0}>
					<li>No comments yet.</li>
				</Show>

				<Show Else={comments.length === 0}>
					{comments.map((comment) => (
						<CommentCard key={comment.id} postId={postId} comment={comment} session={session} />
					))}
				</Show>

				<Show If={shouldLoad}>
					<CommentPlaceholder ref={ref} />
				</Show>
			</ul>
		</>
	);
};

export function formatContent(content: string) {
	return content.split(" ").map((word, index) => {
		if (word.startsWith("@")) {
			return (
				<>
					<Link key={index} href={`/u/${word.slice(1)}`} className="font-medium text-orange-500">
						{word}
					</Link>{" "}
				</>
			);
		} else if (isValidUrl(word)) {
			return (
				<>
					<a target="_blank" key={word} href={word} className="font-medium text-blue-500">
						{word}
					</a>{" "}
				</>
			);
		} else {
			return word + " ";
		}
	});
}

function CommentCard({
	comment,
	postId,
	session,
	highlighted,
}: {
	comment: ExtendedComment;
	postId: string;
	session: Session | null;
	highlighted?: boolean;
}) {
	const [showReplies, setShowReplies] = useState(false);
	const cardRef = React.useRef<HTMLLIElement | null>(null);

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

	useEffect(() => {
		if (highlighted) {
			setTimeout(() => {
				cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			}, 1500);
		}
	}, [highlighted]);

	return (
		<li className={cn({ "rounded-lg bg-orange-100": highlighted })} ref={cardRef}>
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

					<Paragraph lineClamp="line-clamp-6">{formatContent(comment.content)}</Paragraph>
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
				<Comments
					postId={postId}
					replyToId={comment.id}
					variant="Comment"
					session={session}
					initialComments={[]}
					author={comment.author.username!}
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
