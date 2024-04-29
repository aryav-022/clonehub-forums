"use client";

import { banUser, removeMember } from "@/lib/actions";
import Image from "next/image";
import { FC } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

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

	async function ban() {
		try {
			const res = await banUser(communityId, member.id);

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
			<div className="flex gap-x-2">
				<form action={remove} className="flex-1">
					<SubmitButton isCreator={isCreator} variant="subtle">
						Remove
					</SubmitButton>
				</form>
				<form action={ban} className="flex-1">
					<SubmitButton isCreator={isCreator} variant="destructive">
						Ban
					</SubmitButton>
				</form>
			</div>
		</li>
	);
};

function SubmitButton({
	isCreator,
	children,
	variant,
}: {
	isCreator: boolean;
	children: React.ReactNode;
	variant: "default" | "link" | "destructive" | "outline" | "subtle" | "ghost" | null | undefined;
}) {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			variant={variant}
			className="w-full"
			disabled={isCreator}
			isLoading={pending}
			aria-disabled={pending || isCreator}
		>
			{children}
		</Button>
	);
}

export default MemberCard;
