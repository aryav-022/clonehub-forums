"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { FC, startTransition, useOptimistic, useState } from "react";
import { Button } from "./ui/Button";
import { type ActionResponse, cn } from "@/lib/utils";
import { voteComment, votePost } from "@/lib/actions";
import { useToast } from "./ui/Toast";

interface VoteCardProps {
	id: string;
	initialVotes: number;
	currVote: -1 | 0 | 1;
	horizontal?: boolean;
}

const VoteCard: FC<VoteCardProps> = ({ id, initialVotes, currVote, horizontal }) => {
	const recordVote = horizontal ? voteComment : votePost;

	const toast = useToast();

	const [isUpVoted, setIsUpVoted] = useState<-1 | 0 | 1>(currVote);
	const [optimisticIsUpVoted, setOptimisticIsUpVoted] = useOptimistic<-1 | 0 | 1>(isUpVoted);

	const [votes, setVotes] = useState<number>(initialVotes);
	const [optimisticVotes, setOptimisticVotes] = useOptimistic<number>(votes);

	function handleVoteError(res: ActionResponse) {
		if (res.status === 401) {
			toast({
				title: "Unauthorized",
				message: res.message,
				variant: "warning",
			});
		} else if (res.status === 404) {
			toast({
				title: "Post not found",
				message: res.message,
				variant: "error",
			});
		} else {
			toast({
				title: "Error voting post",
				message: res.message,
				variant: "error",
			});
		}
	}

	function vote(vote: -1 | 1) {
		if (vote === optimisticIsUpVoted) {
			// retrieve vote
			startTransition(() => {
				setOptimisticIsUpVoted(0);
				setOptimisticVotes((prev) => prev - vote);
			});

			(async () => {
				const res = await recordVote(id);

				if (res.status === 200) {
					setIsUpVoted(0);
					setVotes((prev) => prev - vote);
				} else {
					handleVoteError(res);
				}
			})();
		} else {
			startTransition(() => {
				setOptimisticIsUpVoted(vote);

				if (optimisticIsUpVoted === 0) {
					// new vote
					setOptimisticVotes((prev) => prev + vote);

					(async () => {
						const res = await recordVote(id, vote === 1 ? "UP" : "DOWN");

						if (res.status === 200) {
							setIsUpVoted(vote);
							setVotes((prev) => prev + vote);
						} else {
							handleVoteError(res);
						}
					})();
				} else {
					// change vote
					setOptimisticVotes((prev) => prev + vote * 2);

					(async () => {
						const res = await recordVote(id, vote === 1 ? "UP" : "DOWN");

						if (res.status === 200) {
							setIsUpVoted(vote);
							setVotes((prev) => prev + vote * 2);
						} else {
							handleVoteError(res);
						}
					})();
				}
			});
		}
	}

	return (
		<div className={cn({ "space-y-2": !horizontal }, { "flex items-center gap-4": horizontal })}>
			<Button variant="ghost" className="p-2" onClick={() => vote(1)}>
				<ArrowBigUp
					className={cn({ "fill-orange-500 text-orange-500": optimisticIsUpVoted === 1 })}
					{...(horizontal && { size: 18 })}
				/>
			</Button>
			<p className="mx-auto block w-fit text-sm font-medium">{optimisticVotes}</p>
			<Button variant="ghost" className="p-2" onClick={() => vote(-1)}>
				<ArrowBigDown
					className={cn({ "fill-orange-500 text-orange-500": optimisticIsUpVoted === -1 })}
					{...(horizontal && { size: 18 })}
				/>
			</Button>
		</div>
	);
};

export default VoteCard;
