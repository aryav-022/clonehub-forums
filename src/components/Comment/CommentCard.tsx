"use client";

import { Show, cn, isValidUrl, timeFromNow } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Paragraph from "../Header/Paragraph";
import VoteCard from "../VoteCard";
import { Button } from "../ui/Button";
import type { ExtendedComment } from "./Comments";
import Comments from "./Comments";

export default function CommentCard({
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
	const cardRef = useRef<HTMLLIElement | null>(null);

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
