"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { FC, useOptimistic, useState } from "react";
import { Button } from "./ui/Button";
import { ActionResponse, cn } from "@/lib/utils";
import { votePost } from "@/lib/actions";
import { useToast } from "./ui/Toast";

interface VoteCardProps {
	postId: string;
	initialVotes: number;
	currVote: -1 | 0 | 1;
}

const VoteCard: FC<VoteCardProps> = ({ postId, initialVotes, currVote }) => {
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
		if (vote === isUpVoted) {
			// retrieve vote
			setOptimisticIsUpVoted(0);
			setOptimisticVotes((prev) => prev - vote);

			(async () => {
				const res = await votePost(postId);

				if (res.status === 200) {
					setIsUpVoted(0);
					setVotes((prev) => prev - vote);
				} else {
					handleVoteError(res);
				}
			})();
		} else {
			setOptimisticIsUpVoted(vote);

			if (isUpVoted === 0) {
				// new vote
				setOptimisticVotes((prev) => prev + vote);

				(async () => {
					const res = await votePost(postId, vote === 1 ? "UP" : "DOWN");

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
					const res = await votePost(postId, vote === 1 ? "UP" : "DOWN");

					if (res.status === 200) {
						setIsUpVoted(vote);
						setVotes((prev) => prev + vote * 2);
					} else {
						handleVoteError(res);
					}
				})();
			}
		}
	}

	return (
		<div className="space-y-2">
			<Button variant="ghost" className="p-2" onClick={() => vote(1)}>
				<ArrowBigUp
					className={cn({ "fill-orange-500 text-orange-500": optimisticIsUpVoted === 1 })}
				/>
			</Button>
			<p className="mx-auto block w-fit text-sm font-medium">{optimisticVotes}</p>
			<Button variant="ghost" className="p-2" onClick={() => vote(-1)}>
				<ArrowBigDown
					className={cn({ "fill-orange-500 text-orange-500": optimisticIsUpVoted === -1 })}
				/>
			</Button>
		</div>
	);
};

export default VoteCard;
