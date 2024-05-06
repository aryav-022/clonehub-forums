"use client";

import { useInfiniteScroll } from "@/hooks/useInfintieScroll";
import { banUserByUsername, loadBannedUsers } from "@/lib/actions";
import { Show } from "@/lib/utils";
import type { Community } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import BannedUserCard from "./BannedUserCard";
import type { Member } from "./MemberCard";
import Searchbar from "./Searchbar";
import { useFormStatus } from "react-dom";

interface BannedUserSectionProps {
	community: Community;
}

const BannedUserSection: FC<BannedUserSectionProps> = ({ community }) => {
	const toast = useToast();

	const [searchQuery, setSearchQuery] = useState<string>("");

	async function loadMore(page: number) {
		return await loadBannedUsers(community.id, page - 1, searchQuery);
	}

	const {
		ref: loaderRef,
		data: bannedUsers,
		setData: setBannedUsers,
		shouldLoad,
		reset,
	} = useInfiniteScroll<Member>([], loadMore);

	function setQuery(query: string) {
		setSearchQuery(query);
	}

	function removeMemberFromList(id: string) {
		setBannedUsers((prev) => prev.filter((member) => member.id !== id));
	}

	useEffect(reset, [searchQuery, reset]);

	async function ban(formData: FormData) {
		const username = formData.get("username") as string;

		try {
			const res = await banUserByUsername(community.id, username);

			switch (res.status) {
				case 200:
					toast({
						title: "Success",
						message: res.message,
						variant: "success",
					});

					break;
				case 401:
					toast({
						title: "Unauthorized",
						message: res.message,
						variant: "error",
					});
					break;
				case 403:
					toast({
						title: "Forbidden",
						message: res.message,
						variant: "error",
					});
					break;
				case 404:
					toast({
						title: "Not Found",
						message: res.message,
						variant: "error",
					});
					break;
				default:
					toast({
						title: "Error",
						message: res.message,
						variant: "error",
					});
					break;
			}
		} catch (error) {
			toast({
				title: "Error",
				message: "Unkown error occurred. Please try again later.",
				variant: "error",
			});
		}
	}

	return (
		<section className="space-y-8 py-4">
			<h2 className="text-xl font-semibold">Banned Users</h2>

			<div>
				<form action={ban} className="flex flex-col gap-2">
					<label className="text-sm font-medium">Ban user by username</label>
					<div className="flex items-center">
						<input
							type="text"
							placeholder="Username"
							name="username"
							id="username"
							className="rounded-l-lg border border-neutral-300 p-2"
						/>
						<SubmitButton />
					</div>
				</form>

				<p className="mt-2 text-xs text-neutral-500">Ban by username throughout CloneHub</p>
			</div>

			<div className="space-y-2">
				<Searchbar setQuery={setQuery} type="banned users" />

				<ul className="flex flex-col divide-y">
					<li className="grid grid-cols-4 items-center gap-2 rounded-md bg-neutral-200 px-4 py-2 font-medium">
						<span>Picture</span>
						<span>Username</span>
						<span>Name</span>
						<span>Action</span>
					</li>

					{bannedUsers.map((member) => (
						<BannedUserCard
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
			</div>
		</section>
	);
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			variant="destructive"
			aria-disabled={pending}
			isLoading={pending}
			className="rounded-l-none border border-red-600"
		>
			Ban
		</Button>
	);
}

export default BannedUserSection;
