"use client";

import type { Post } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import type { Session } from "next-auth";
import { useState, type FC } from "react";
import CommentForm from "./CommentForm";
import Comments, { type ExtendedComments } from "./Comments";

type ExtendedPost = Post & {
	_count: {
		comments: number;
	};
};

interface CommentSectionProps {
	post: ExtendedPost;
	session: Session | null;
	initialComments: ExtendedComments[];
}

const CommentSection: FC<CommentSectionProps> = ({ post, session, initialComments }) => {
	const [comments, setComments] = useState<ExtendedComments[]>(initialComments);

	function addComment(comment: ExtendedComments) {
		setComments((prev) => [comment, ...prev]);
	}

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-medium">comments</h2>

			<CommentForm postId={post.id} session={session} addComment={addComment} />

			<small className="flex items-center gap-2 text-sm">
				<MessageSquare size={16} /> {post._count.comments} comments
			</small>

			<hr />

			<Comments postId={post.id} comments={comments} setComments={setComments} session={session} />
		</section>
	);
};

export default CommentSection;
