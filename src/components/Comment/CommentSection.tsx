import { loadComments } from "@/lib/actions";
import type { Post } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import type { Session } from "next-auth";
import Comments from "./Comments";

type ExtendedPost = Post & {
	_count: {
		comments: number;
	};
};

interface CommentSectionProps {
	post: ExtendedPost;
	session: Session | null;
}

const CommentSection = async ({ post, session }: CommentSectionProps) => {
	const initialComments = await loadComments({ id: post.id, variant: "Post" });

	return (
		<section className="space-y-4">
			<h2 className="text-xl font-medium">comments</h2>

			<small className="flex items-center gap-2 text-sm">
				<MessageSquare size={16} /> {post._count.comments} comments
			</small>

			<hr />

			<Comments id={post.id} session={session} variant="Post" initialComments={initialComments} />
		</section>
	);
};

export default CommentSection;
