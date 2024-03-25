"use client";

import type { User } from "@prisma/client";
import { FC, startTransition, useState } from "react";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/actions";

interface DeleteAccountProps {
	user: User;
}

const DeleteAccount: FC<DeleteAccountProps> = ({ user }) => {
	const router = useRouter();
	const toast = useToast();
	const [confirmation, setConfirmation] = useState(false);

	function openConfirmation() {
		setConfirmation(true);
	}

	async function handleSubmit() {
		try {
			const res = await deleteAccount();

			switch (res.status) {
				case 200:
					toast({
						title: "Success",
						message: res.message,
					});

					startTransition(() => {
						router.push("/");
						router.refresh();
					});

					break;
				case 401:
					toast({
						title: "Unauthorized",
						message: res.message,
						variant: "warning",
					});
					break;
				default:
					toast({
						title: "Error",
						message: res.message,
						variant: "error",
					});
			}
		} catch (error) {
			toast({
				title: "Error",
				message: "An error occurred while deleting your account.",
				variant: "error",
			});
		}
	}

	return (
		<>
			<Button variant="destructive" onClick={openConfirmation}>
				Delete Account
			</Button>

			<dialog
				className={cn("fixed inset-0 z-10 hidden space-y-4 rounded-3xl bg-red-600 p-8 shadow-lg", {
					"block items-center justify-center": confirmation,
				})}
			>
				<h2 className="text-2xl font-semibold text-white">Delete Account</h2>

				<div className="text-white">
					<p>Are you sure you want to delete your account?</p>
					<p> This action cannot be undone.</p>
				</div>

				<div className="flex gap-4">
					<Button variant="destructive" onClick={handleSubmit}>
						Delete Account
					</Button>
					<Button variant="outline" onClick={() => setConfirmation(false)}>
						Cancel
					</Button>
				</div>
			</dialog>
		</>
	);
};

export default DeleteAccount;
