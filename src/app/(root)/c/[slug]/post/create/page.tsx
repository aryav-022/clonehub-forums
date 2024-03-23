import Editor from "@/components/Editor/Editor";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
	params: {
		slug: string;
	};
}

const Page = async ({ params: { slug } }: PageProps) => {
	const community = await db.community.findFirst({
		where: {
			name: {
				equals: slug,
				mode: "insensitive",
			},
		},
	});

	if (!community) return notFound();

	return (
		<section className="col-span-4 py-4">
			<h1 className="relative pb-2 after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:rounded-3xl after:bg-neutral-300">
				Create Post in <span className="font-medium">c/{slug.toLowerCase()}</span>
			</h1>

			<Editor slug={slug} communityId={community.id} />
		</section>
	);
};

export default Page;
