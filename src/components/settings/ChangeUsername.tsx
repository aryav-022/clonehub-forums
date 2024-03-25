"use client";

import type { User } from "@prisma/client";
import { FC, startTransition } from "react";
import { Button } from "../ui/Button";
import { updateUsername } from "@/lib/actions";
import { useToast } from "../ui/Toast";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

interface ChangeUsernameProps {
	user: User;
}

const ChangeUsername: FC<ChangeUsernameProps> = ({ user }) => {
	const toast = useToast();
	const router = useRouter();

	async function handleSubmit(formData: FormData) {
		const username = formData.get("username") as string;

		try {
			const res = await updateUsername(formData);

			switch (res.status) {
				case 200:
					toast({
						title: "Success",
						message: res.message,
						variant: "success",
					});

					startTransition(() => {
						router.replace(`/u/${username}/settings`);
						router.refresh();
					});

					break;
				case 400:
					toast({
						title: "Requirement already met",
						message: res.message,
						variant: "warning",
					});
					break;
				case 401:
					toast({
						title: "Unauthorized",
						message: res.message,
						variant: "warning",
					});
					break;
				case 409:
					toast({
						title: "Conflict",
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
				message: "An unexpected error occurred",
				variant: "error",
			});
		}
	}

	return (
		<form action={handleSubmit} className="flex flex-col gap-2">
			<label htmlFor="username" className="text-sm font-medium">
				Change Username
			</label>
			<div className="flex">
				<input
					type="text"
					required
					name="username"
					id="username"
					defaultValue={user.username as string}
					className="rounded-l-md border-2 border-r-0 px-2 py-1 focus:outline-none focus:ring-2 max-sm:w-48"
				/>
				<SubmitButton />
			</div>
		</form>
	);
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="rounded-l-none" aria-disabled={pending} isLoading={pending}>
			Save
		</Button>
	);
}

export default ChangeUsername;
