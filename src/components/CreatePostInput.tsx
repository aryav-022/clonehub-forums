import { cn } from "@/lib/utils";
import { ImageIcon, Link2 } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/Button";

interface CreatePostInputProps {
	slug: string;
	session: Session | null;
}

const CreatePostInput = async ({ slug, session }: CreatePostInputProps) => {
	const link = session ? `/c/${slug}/post/create` : "/signin";

	return (
		<div className="flex w-full items-center gap-4 overflow-hidden rounded-md border p-2">
			<div className="relative h-10 w-10 min-w-10 max-w-10 rounded-full bg-gray-800 after:absolute after:bottom-0 after:right-0 after:h-3 after:w-3 after:rounded-full after:border-2 after:border-white after:bg-green-500">
				{session && session.user.image && (
					<Image
						src={session.user.image}
						alt="Profile Image"
						width={40}
						height={40}
						className="rounded-full"
					/>
				)}
			</div>

			<Link href={link} className="flex-1">
				<input
					type="text"
					placeholder="Create a post"
					className="w-full rounded-md border p-2 focus:outline-none focus:ring-2"
				/>
			</Link>

			<Link
				href={link}
				title="link"
				className={cn(buttonVariants({ variant: "ghost", className: "p-2" }))}
			>
				<Link2 size={24} />
			</Link>

			<Link
				href={link}
				title="image"
				className={cn(buttonVariants({ variant: "ghost", className: "p-2" }))}
			>
				<ImageIcon size={24} />
			</Link>
		</div>
	);
};

export default CreatePostInput;
