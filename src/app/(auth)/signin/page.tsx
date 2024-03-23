import SigninModal from "@/components/Auth/SigninModal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

interface signinProps {}

const signin: FC<signinProps> = ({}) => {
	return (
		<section className="grid min-h-screen w-full place-items-center">
			<div className="space-y-4">
				<Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "-mt-20 self-start")}>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Home
				</Link>

				<SigninModal />
			</div>
		</section>
	);
};

export default signin;
