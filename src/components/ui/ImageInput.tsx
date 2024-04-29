"use client";

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";

interface ImageInputProps extends React.HTMLProps<HTMLInputElement> {
	defaultImage?: string | null;
}

const ImageInput: FC<ImageInputProps> = ({ defaultImage, className, ...props }) => {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [image, setImage] = useState<string | null>(defaultImage || null);

	function uploadImage() {
		inputRef.current?.click();
	}

	useEffect(() => {
		function handleChange(e: any) {
			const file = (e.target as HTMLInputElement).files?.[0];

			if (!file) return;

			const blob = URL.createObjectURL(file);
			setImage(blob);
		}

		const input = inputRef.current;
		input?.addEventListener("change", handleChange);

		return () => {
			input?.removeEventListener("change", handleChange);
		};
	}, []);

	return (
		<div className="flex gap-4">
			<button
				className={cn(
					"relative grid h-28 min-h-28 w-28 min-w-28 place-items-center overflow-hidden rounded-full bg-neutral-800 sm:h-40 sm:min-h-40 sm:w-40 sm:min-w-40",
					className
				)}
				type="button"
				onClick={uploadImage}
			>
				{image && <Image src={image} alt="profile" fill className="object-cover" />}

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
				{...props}
			/>
		</div>
	);
};

export default ImageInput;
