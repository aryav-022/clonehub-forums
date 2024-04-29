"use client";

import { updateProfilePicture } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FC, startTransition } from "react";
import { Button } from "../ui/Button";
import ImageInput from "../ui/ImageInput";
import { useToast } from "../ui/Toast";
import { useFormStatus } from "react-dom";

interface ChangeProfilePictureProps {
	image: string | null;
}

const ChangeProfilePicture: FC<ChangeProfilePictureProps> = ({ image }) => {
	const toast = useToast();
	const router = useRouter();

	async function changeProfilePicture(formData: FormData) {
		try {
			const res = await updateProfilePicture(formData);

			switch (res.status) {
				case 200:
					toast({
						title: "Success",
						message: "Profile picture updated successfully.",
						variant: "success",
					});

					startTransition(() => {
						router.refresh();
					});

					break;
				case 400:
					toast({
						title: "Bad Request",
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
				default:
					toast({
						title: "Error",
						message: res.message,
						variant: "error",
					});
			}
		} catch (err) {
			toast({
				title: "Error",
				message: "Unkown error occurred. Please try again later.",
				variant: "error",
			});
		}
	}

	return (
		<form action={changeProfilePicture} className="flex items-end gap-2">
			<ImageInput defaultImage={image} />
			<SubmitButton />
		</form>
	);
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" aria-disabled={pending} isLoading={pending}>
			Update
		</Button>
	);
}

export default ChangeProfilePicture;
