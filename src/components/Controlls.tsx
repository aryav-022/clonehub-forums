import { FC } from "react";
import { Button } from "./ui/Button";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";

interface ControllsProps {}

const Controlls: FC<ControllsProps> = ({}) => {
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex items-center gap-2">
				<span>Sort by: </span>
				<select className="rounded-md bg-black p-2 text-white">
					<option>Top</option>
					<option>New</option>
					<option>Hot</option>
				</select>
			</div>
			<div className="space-x-2">
				<Button className="aspect-square p-1" title="sort descending">
					<ArrowUpNarrowWide />
				</Button>
				<Button variant="ghost" className="aspect-square p-1" title="sort ascending">
					<ArrowDownNarrowWide />
				</Button>
			</div>
		</div>
	);
};

export default Controlls;
