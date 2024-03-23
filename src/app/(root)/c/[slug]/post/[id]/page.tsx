import CommentForm from "@/components/Comment/CommentForm";
import CommentSection from "@/components/Comment/CommentSection";
import Comments from "@/components/Comment/Comments";
import EditorOutput from "@/components/Editor/EditorOutput";
import VoteCard from "@/components/VoteCard";
import { buttonVariants } from "@/components/ui/Button";
import { loadComments } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChevronLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
	params: {
		slug: string;
		id: string;
	};
}

const Page = async ({ params: { slug, id } }: PageProps) => {
	const post = await db.post.findUnique({
		where: { id },
		include: {
			community: {
				select: {
					name: true,
				},
			},
			_count: {
				select: {
					comments: true,
					votes: true,
				},
			},
		},
	});

	if (!post) return notFound();

	const comments = await loadComments({ postId: id });

	const session = await getAuthSession();

	return (
		<div className="col-span-3 my-4 space-y-4">
			<Link href={`/c/${post.community.name}`} className={buttonVariants({ variant: "ghost" })}>
				<ChevronLeft /> Back Community
			</Link>

			<main className="rounded-lg bg-neutral-50 p-4">
				<section className="flex gap-4">
					<VoteCard initialVotes={post._count.votes} />

					<div className="space-y-4">
						<h1 className="text-3xl font-medium">{post.title}</h1>
						<EditorOutput content={post.content} />
					</div>
				</section>

				<CommentSection session={session} post={post} initialComments={comments} />
			</main>
		</div>
	);
};

export default Page;
