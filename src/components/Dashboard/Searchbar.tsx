"use client";

import { debounce } from "@/lib/utils";
import { Search } from "lucide-react";
import { FC } from "react";

interface SearchbarProps {
	type: "members" | "banned users";
	setQuery: (query: string) => void;
}

const Searchbar: FC<SearchbarProps> = ({ type, setQuery }) => {
	const searchMembers = debounce((e) => {
		const searchQuery = e.target.value;
		setQuery(searchQuery);
	}, 500);

	return (
		<div className="flex w-full items-center overflow-hidden rounded-md border border-neutral-300 focus-within:ring-2">
			<Search size={18} className="mx-4 text-neutral-400" />
			<input
				type="text"
				placeholder={`Search ${type}`}
				className="inline-block w-full py-2 outline-none"
				onInput={searchMembers}
			/>
		</div>
	);
};

export default Searchbar;
