"use client";

import { uploadFile } from "@/lib/cloudinary";
import type { User } from "@prisma/client";
import { Upload } from "lucide-react";
import Image from "next/image";
import { FC, startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { useToast } from "../ui/Toast";
import { updateProfilePicture } from "@/lib/actions";
import { useRouter } from "next/navigation";

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

		inputRef.current?.addEventListener("change", handleChange);

		return () => {
			inputRef.current?.removeEventListener("change", handleChange);
		};
	}, []);

	return (
		<div className="flex gap-4">
			<button
				className="relative grid h-40 min-h-40 w-40 min-w-40 place-items-center overflow-hidden rounded-full bg-neutral-800"
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
