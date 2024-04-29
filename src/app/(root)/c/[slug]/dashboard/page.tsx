import { CommunityForm } from "@/components/CommunityForm";
import MemberSection from "@/components/Dashboard/MemberSection";
import { updateCommunity } from "@/lib/actions";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
	params: {
		slug: string;
	};
}

async function Page({ params: { slug } }: PageProps) {
	const community = await db.community.findFirst({
		where: {
			name: {
				equals: slug,
				mode: "insensitive",
			},
		},
	});

	if (!community) {
		return notFound();
	}

	const session = await getAuthSession();

	if (!session || community.creatorId !== session.user.id) {
		return notFound();
	}

	return (
		<main className="col-span-4 space-y-8 divide-y py-4">
			<section className="space-y-4">
				<h2 className="text-xl font-semibold">Community Details</h2>

				<CommunityForm
					type="Update"
					formAction={updateCommunity}
					defaultValues={{
						communityName: community.name,
						description: community.description || undefined,
						image: community.image,
						banner: community.banner,
					}}
				/>
			</section>

			<MemberSection community={community} />
		</main>
	);
}

export default Page;
