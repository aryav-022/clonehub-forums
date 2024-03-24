import CommentSection from "@/components/Comment/CommentSection";
import EditorOutput from "@/components/Editor/EditorOutput";
import VoteCard from "@/components/VoteCard";
import { buttonVariants } from "@/components/ui/Button";
import { loadComments } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PageProps {
	params: {
		id: string;
	};
}

const Page = async ({ params: { id } }: PageProps) => {
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

			<main className="space-y-8 rounded-lg bg-neutral-50 p-4">
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
