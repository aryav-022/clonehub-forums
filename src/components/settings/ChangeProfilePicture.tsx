"use client";

import { updateProfilePicture } from "@/lib/actions";
import type { User } from "@prisma/client";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { useToast } from "../ui/Toast";

interface ChangeProfilePictureProps {
	user: User;
}

const ChangeProfilePicture: FC<ChangeProfilePictureProps> = ({ user }) => {
	const toast = useToast();
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [image, setImage] = useState<string | null>(user.image);
	const [optimisticImage, setOptimisticImage] = useOptimistic(image);

	function uploadImage() {
		inputRef.current?.click();
	}

	useEffect(() => {
		function handleChange(e: any) {
			const file = (e.target as HTMLInputElement).files?.[0];

			if (!file) return;

			const blob = URL.createObjectURL(file);

			startTransition(() => {
				setOptimisticImage(blob);

				(async () => {
					try {
						const formData = new FormData();
						formData.append("file", file);
						const res = await updateProfilePicture(formData);

						switch (res.status) {
							case 200:
								setImage(res.data.url);

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
				})();
			});
		}

		const input = inputRef.current;

		input?.addEventListener("change", handleChange);

		return () => {
			input?.removeEventListener("change", handleChange);
		};
	}, [router, toast, setOptimisticImage]);

	return (
		<div className="flex gap-4">
			<button
				className="relative grid h-28 min-h-28 w-28 min-w-28 place-items-center overflow-hidden rounded-full bg-neutral-800 sm:h-40 sm:min-h-40 sm:w-40 sm:min-w-40"
				type="button"
				onClick={uploadImage}
			>
				{optimisticImage && <Image src={optimisticImage} alt="profile" height={160} width={160} />}

				<div className="group absolute bottom-0 left-0 right-0 top-0 z-10 grid h-full w-full cursor-pointer place-items-center transition-colors hover:bg-black/50">
					<Upload className="h-8 w-8 translate-y-4 text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100" />
				</div>
			</button>
			<input
				ref={inputRef}
				type="file"
				name="file"
				accept="image/*"
				required
				className="w-0 opacity-0"
			/>
		</div>
	);
};

export default ChangeProfilePicture;
