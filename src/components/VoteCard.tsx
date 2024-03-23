import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { FC } from "react";
import { Button } from "./ui/Button";

interface VoteCardProps {
	initialVotes?: number;
}

const VoteCard: FC<VoteCardProps> = ({ initialVotes }) => {
	return (
		<div className="space-y-2">
			<Button variant="ghost" className="p-2">
				<ArrowBigUp />
			</Button>
			<p className="mx-auto block w-fit text-sm font-medium">{initialVotes}</p>
			<Button variant="ghost" className="p-2">
				<ArrowBigDown />
			</Button>
		</div>
	);
};

export default VoteCard;
