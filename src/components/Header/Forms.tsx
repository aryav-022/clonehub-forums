"use client";

import type { ActionResponse } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { useRouter } from "next/navigation";

export function JoinCommunityForm({
	joinCommunity,
}: {
	joinCommunity: () => Promise<ActionResponse>;
}) {
	const router = useRouter();
	const toast = useToast();

	async function join() {
		const res = await joinCommunity();

		if (res.status === 200) {
			toast({ title: "Success.", message: res.message, variant: "success" });
			router.refresh();
		} else if (res.status === 400) {
			toast({ title: "Requirement already satisfied.", message: res.message, variant: "warning" });
		} else if (res.status === 401) {
			toast({ title: "Signin required.", message: res.message, variant: "warning" });
		} else {
			toast({ title: "Error.", message: res.message, variant: "error" });
		}
	}

	return (
		<form action={join}>
			<SubmitButton>Join Community</SubmitButton>
		</form>
	);
}

export function LeaveCommunityForm({
	leaveCommunity,
}: {
	leaveCommunity: () => Promise<ActionResponse>;
}) {
	const router = useRouter();
	const toast = useToast();

	async function leave() {
		const res = await leaveCommunity();

		if (res.status === 200) {
			toast({ title: "Success", message: res.message, variant: "success" });
			router.refresh();
		} else if (res.status === 400) {
			toast({ title: "Requirement already satisfied", message: res.message, variant: "warning" });
		} else if (res.status === 401) {
			toast({ title: "Unauthorized", message: res.message, variant: "warning" });
		} else if (res.status === 403) {
			toast({ title: "Forbidden", message: res.message, variant: "warning" });
		} else {
			toast({ title: "Internal Server Error.", message: res.message, variant: "error" });
		}
	}

	return (
		<form action={leave}>
			<SubmitButton>Leave Community</SubmitButton>
		</form>
	);
}

function SubmitButton({ children }: { children?: React.ReactNode }) {
	const { pending } = useFormStatus();

	return (
		<Button size="lg" type="submit" aria-disabled={pending} isLoading={pending}>
			{children}
		</Button>
	);
}
