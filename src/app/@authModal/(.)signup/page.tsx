import CloseModal from "@/components/Auth/CloseModal";
import SignupModal from "@/components/Auth/SignupModal";
import { FC } from "react";

interface pageProps {}

const Page: FC<pageProps> = ({}) => {
	return (
		<div className="fixed inset-0 z-40 bg-zinc-900/20">
			<div className="container mx-auto flex h-full max-w-lg items-center">
				<div className="relative mx-auto rounded-lg bg-white shadow-lg">
					<div className="absolute right-4 top-4">
						<CloseModal />
					</div>

					<SignupModal />
				</div>
			</div>
		</div>
	);
};

export default Page;
