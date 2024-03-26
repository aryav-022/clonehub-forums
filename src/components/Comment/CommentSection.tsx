import { loadComments } from "@/lib/actions";
import type { Post } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import type { Session } from "next-auth";
import Comments from "./Comments";
import { db } from "@/lib/db";

type ExtendedPost = Post & {
	_count: {
		comments: number;
	};
};

interface CommentSectionProps {
	post: ExtendedPost;
	session: Session | null;
	commentId?: string | string[];
}

const CommentSection = async ({ post, session, commentId }: CommentSectionProps) => {
	const initialComments = await loadComments({ id: post.id, variant: "Post" });

	const _comment = commentId
		? await db.comment.findUnique({
				where: {
					id: commentId instanceof Array ? commentId[0] : commentId,
				},
				include: {
					author: true,
					commentVotes: true,
				},
			})
		: null;

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-medium">comments</h2>

			<small className="flex items-center gap-2 text-sm">
				<MessageSquare size={16} /> {post._count.comments} comments
			</small>

			<hr />

			<Comments
				postId={post.id}
				session={session}
				variant="Post"
				initialComments={initialComments}
				highlightedComment={_comment}
			/>
		</section>
	);
};

export default CommentSection;
