import DescriptionCard from "@/components/DescriptionCard";
import CustomFeed from "@/components/Feed/CustomFeed";
import GeneralFeed from "@/components/Feed/GeneralFeed";
import { getAuthSession } from "@/lib/auth";

interface PageProps {}

const Page = async ({}: PageProps) => {
	const session = await getAuthSession();

	return (
		<div className="col-span-4 space-y-4 py-4">
			<div className="grid grid-cols-3 items-start gap-4">
				<section className="col-span-2 min-h-dvh space-y-4 pb-4">
					{session ? <CustomFeed session={session} /> : <GeneralFeed />}
				</section>

				<DescriptionCard title={"Home"} description={"nhi he"} session={session} />
			</div>
		</div>
	);
};

export default Page;
