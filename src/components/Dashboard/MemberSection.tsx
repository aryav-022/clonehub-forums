"use client";

import { FC, useEffect, useRef, useState } from "react";
import Searchbar from "./Searchbar";
import MemberCard, { Member } from "./MemberCard";
import type { Community } from "@prisma/client";
import { loadMembers } from "@/lib/actions";
import { useInfiniteScroll } from "@/hooks/useInfintieScroll";
import { Show } from "@/lib/utils";

interface MemberSectionProps {
	community: Community;
}

const MemberSection: FC<MemberSectionProps> = ({ community }) => {
	const [searchQuery, setSearchQuery] = useState<string>("");

	async function loadMore(page: number) {
		return await loadMembers(community.id, page - 1, searchQuery);
	}

	const {
		ref: loaderRef,
		data: members,
		setData: setMembers,
		shouldLoad,
		reset,
	} = useInfiniteScroll<Member>([], loadMore);

	function setQuery(query: string) {
		setSearchQuery(query);
	}

	function removeMemberFromList(id: string) {
		setMembers((prev) => prev.filter((member) => member.id !== id));
	}

	useEffect(reset, [searchQuery, reset]);

	return (
		<section className="space-y-4 py-4">
			<h2 className="text-xl font-semibold">Community Members</h2>

			<Searchbar setQuery={setQuery} type="members" />

			<ul className="flex flex-col divide-y">
				<li className="grid grid-cols-4 items-center gap-2 rounded-md bg-neutral-200 px-4 py-2 font-medium">
					<span>Picture</span>
					<span>Username</span>
					<span>Name</span>
					<span>Action</span>
				</li>

				{members.map((member) => (
					<MemberCard
						key={member.id}
						communityId={community.id}
						member={member}
						isCreator={member.id === community.creatorId}
						removeMemberFromList={removeMemberFromList}
					/>
				))}

				<Show If={shouldLoad}>
					<li
						ref={loaderRef}
						className="my-2 h-8 w-full animate-pulse rounded-md bg-neutral-100 px-4"
					></li>
				</Show>
			</ul>
		</section>
	);
};

export default MemberSection;
