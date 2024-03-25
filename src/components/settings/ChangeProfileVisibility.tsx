"use client";

import { cn } from "@/lib/utils";
import type { User } from "@prisma/client";
import { FC, useOptimistic, useState } from "react";
import { useToast } from "../ui/Toast";

interface ChangeProfileVisibilityProps {
	user: User;
}

const ChangeProfileVisibility: FC<ChangeProfileVisibilityProps> = ({ user }) => {
	const toast = useToast();

	const [isVisible, setIsVisible] = useState(true);
	const [optimisiticIsVisible, setOptimisiticIsVisible] = useOptimistic(isVisible);

	async function handleSubmit() {
		setOptimisiticIsVisible((prev) => !prev);

		await new Promise((resolve) => setTimeout(resolve, 500));

		setIsVisible(true);

		toast({
			title: "Comming Soon",
			message:
				"This feature is not yet available. Currently, your profile is always visible to everyone.",
		});
	}

	return (
		<form action={handleSubmit}>
			<button
				type="submit"
				className={cn(
					"relative h-8 w-14 rounded-3xl transition-all after:absolute after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all",
					{ "bg-orange-500 after:left-7": optimisiticIsVisible },
					{ "bg-neutral-800 after:left-1": !optimisiticIsVisible }
				)}
			/>
		</form>
	);
};

export default ChangeProfileVisibility;
