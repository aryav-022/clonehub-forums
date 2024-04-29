import { CommunityForm } from "@/components/CommunityForm";
import { createCommunity } from "@/lib/actions";
import { FC } from "react";

interface pageProps {}

const Page: FC<pageProps> = ({}) => {
	return (
		<section className="col-span-5 my-8 space-y-8 sm:px-8 lg:col-span-4">
			<div>
				<h1 className="mb-1 text-2xl font-semibold">Create Community</h1>
				<p>Please fill in the required information below:</p>
			</div>

			<CommunityForm type="Create" formAction={createCommunity} />
		</section>
	);
};

export default Page;
