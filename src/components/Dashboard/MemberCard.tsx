"use client";

import Image from "next/image";
import { FC, startTransition } from "react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { useRouter } from "next/navigation";
import { removeMember } from "@/lib/actions";
import { useFormStatus } from "react-dom";

export interface Member {
	id: string;
	name: string | null;
	image: string | null;
	username: string | null;
}

interface MemberCardProps {
	communityId: string;
	member: Member;
	isCreator: boolean;
	removeMemberFromList: (id: string) => void;
}

const MemberCard: FC<MemberCardProps> = ({
	communityId,
	member,
	isCreator = false,
	removeMemberFromList,
}) => {
	const toast = useToast();

	async function remove() {
		try {
			const res = await removeMember(communityId, member.id);

			switch (res.status) {
				case 200:
					toast({
						title: "Success",
						message: res.message,
						variant: "success",
					});

					removeMemberFromList(member.id);

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
		<li className="grid grid-cols-4 items-center gap-2 p-2">
			<div className="relative h-10 w-10 overflow-hidden rounded-full bg-neutral-800">
				{member.image && (
					<Image src={member.image} alt={member.username!} fill className="object-cover" />
				)}
			</div>
			<span>{member.username}</span>
			<span>{member.name}</span>
			<form action={remove}>
				<SubmitButton isCreator={isCreator} />
			</form>
		</li>
	);
};

function SubmitButton({ isCreator }: { isCreator: boolean }) {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			variant="subtle"
			className="w-full text-red-500 hover:bg-red-500 hover:text-white"
			disabled={isCreator}
			isLoading={pending}
			aria-disabled={pending || isCreator}
		>
			Remove
		</Button>
	);
}

export default MemberCard;
