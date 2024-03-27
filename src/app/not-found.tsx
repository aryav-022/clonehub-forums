import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<section className="mx-auto flex h-dvh flex-col items-center justify-center gap-2">
			<h1 className="text-9xl text-white [text-shadow:2px_2px_0_#000,-2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000]">
				404
			</h1>
			<p>Could not find requested resource</p>
			<Link
				href="/"
				className={cn(buttonVariants({ className: "group", variant: "outline", size: "lg" }))}
			>
				<ChevronLeft className="mr-1 transition-transform group-hover:-translate-x-1" size={20} />
				Return Home
			</Link>
		</section>
	);
}
