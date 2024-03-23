"use client";

import Editor from "@/components/Editor/Editor";
import { useParams } from "next/navigation";

const Page = () => {
	const { slug } = useParams<{ slug: string }>();

	return (
		<section className="col-span-4 py-4">
			<h1 className="relative pb-2 after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:rounded-3xl after:bg-neutral-300">
				Create Post in <span className="font-medium">c/{slug.toLowerCase()}</span>
			</h1>

			<Editor slug={slug} />
		</section>
	);
};

export default Page;
