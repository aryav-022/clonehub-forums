"use client";

import { useInfiniteScroll } from "@/hooks/useInfintieScroll";
import { loadComments } from "@/lib/actions";
import { Show } from "@/lib/utils";
import type { Comment, CommentVote, User } from "@prisma/client";
import type { Session } from "next-auth";
import { type FC } from "react";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";
import CommentPlaceholder from "./CommentPlaceholder";

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
	function loadMore(page: number) {
		return loadComments({
			id: variant === "Post" ? postId : replyToId!,
			variant,
			page,
		});
	}

	const {
		data: comments,
		setData: setComments,
		ref,
		shouldLoad,
	} = useInfiniteScroll<ExtendedComment>(initialComments, loadMore);

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

export default Comments;
