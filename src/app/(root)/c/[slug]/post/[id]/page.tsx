import CommentSection from "@/components/Comment/CommentSection";
import EditorOutput from "@/components/Editor/EditorOutput";
import VoteCard from "@/components/VoteCard";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
	params: {
		id: string;
	};
	searchParams: { [key: string]: string | string[] | undefined };
}

export const dynamic = "force-dynamic";

const Page = async ({ params: { id }, searchParams: { comment } }: PageProps) => {
	const post = await db.post.findUnique({
		where: { id },
		include: {
			community: {
				select: {
					name: true,
				},
			},
			votes: true,
			_count: {
				select: {
					comments: true,
				},
			},
		},
	});

	if (!post) return notFound();

	const session = await getAuthSession();

	let currVote: -1 | 0 | 1 = 0;

	const initialVotes = post.votes.reduce((acc, vote) => {
		if (vote.userId === session?.user.id) {
			if (vote.type === "UP") currVote = 1;
			if (vote.type === "DOWN") currVote = -1;
		}

		if (vote.type === "UP") return acc + 1;
		if (vote.type === "DOWN") return acc - 1;
		return acc;
	}, 0);

	return (
		<div className="col-span-5 my-4 space-y-4 lg:col-span-3">
			<Link href={`/c/${post.community.name}`} className={buttonVariants({ variant: "ghost" })}>
				<ChevronLeft /> Back Community
			</Link>

			<main className="space-y-8 rounded-lg bg-neutral-50 p-4">
				<section className="flex gap-4">
					<VoteCard id={post.id} currVote={currVote} initialVotes={initialVotes} />

					<div className="space-y-4">
						<h1 className="text-3xl font-medium">{post.title}</h1>
						<EditorOutput content={post.content} />
					</div>
				</section>

				<CommentSection session={session} post={post} commentId={comment} />
			</main>
		</div>
	);
};

export default Page;
