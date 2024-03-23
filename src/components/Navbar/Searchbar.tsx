"use client";

import { searchCommunities } from "@/lib/actions";
import { debounce } from "@/lib/utils";
import type { Community } from "@prisma/client";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FC } from "react";

interface SearchbarProps {}

const Searchbar: FC<SearchbarProps> = ({}) => {
	const [pending, setPending] = useState(false);
	const [results, setResults] = useState<Community[]>([]);

	async function handleInput(e: any) {
		setPending(true);

		const res = await searchCommunities(e.target.value);
		setResults(res);

		setPending(false);
	}

	function removeFocus() {
		if (document.activeElement instanceof HTMLElement) document.activeElement?.blur();
	}

	return (
		<div className="group relative grow self-start">
			<div className="relative flex items-center rounded-md">
				<Search size={16} className="absolute left-3 z-10 text-neutral-400" />
				<input
					type="text"
					placeholder="Search for communities"
					className="w-full rounded-md border border-neutral-400 bg-gray-100 py-2 pl-10 pr-4 outline-none focus:ring"
					onInput={debounce(handleInput, 1000)}
				/>
			</div>

			<div className="relative z-30 hidden w-full divide-y overflow-hidden rounded-b-lg bg-zinc-100 shadow-lg group-focus-within:block">
				{pending ? (
					<p className="p-4 text-center text-neutral-500">
						<span className="animate-spin rounded-full border-t-2 border-blue-500" /> Searching...
					</p>
				) : (
					results.map((community) => (
						<Link
							href={`/c/${community.name}`}
							key={community.id}
							className="flex items-center gap-4 p-4 hover:bg-neutral-200"
							onClick={removeFocus}
						>
							<div className="h-10 w-10 min-w-10 max-w-10 overflow-hidden rounded-full bg-neutral-800">
								{community.image && (
									<Image src={community.image} alt={community.name} height={40} width={40} />
								)}
							</div>
							<div>
								<h3 className="font-bold">c/{community.name}</h3>
								<p className="line-clamp-1 text-sm text-neutral-500">{community.description}</p>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
};

export default Searchbar;
