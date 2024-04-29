"use client";

import { debounce } from "@/lib/utils";
import { Search } from "lucide-react";
import { FC } from "react";

interface SearchbarProps {
	setQuery: (query: string) => void;
}

const Searchbar: FC<SearchbarProps> = ({ setQuery }) => {
	const searchMembers = debounce((e) => {
		const searchQuery = e.target.value;
		setQuery(searchQuery);
	});

	return (
		<div className="flex w-full items-center overflow-hidden rounded-md border border-neutral-300 focus-within:ring-2">
			<Search size={18} className="mx-4 text-neutral-400" />
			<input
				type="text"
				placeholder="Search members"
				className="inline-block w-full py-2 outline-none"
				onInput={searchMembers}
			/>
		</div>
	);
};

export default Searchbar;
