import DescriptionCard from "@/components/DescriptionCard";
import CustomFeed from "@/components/Feed/CustomFeed";
import GeneralFeed from "@/components/Feed/GeneralFeed";
import { getAuthSession } from "@/lib/auth";

interface PageProps {}

const Page = async ({}: PageProps) => {
	const session = await getAuthSession();

	return (
		<div className="col-span-4 space-y-4 py-4 max-lg:col-span-5">
			<div className="grid grid-cols-3 items-start gap-4">
				<section className="col-span-2 space-y-4 pb-4 max-md:col-span-4">
					{session ? <CustomFeed session={session} /> : <GeneralFeed />}
				</section>

				<DescriptionCard session={session} />
			</div>
		</div>
	);
};

export default Page;
