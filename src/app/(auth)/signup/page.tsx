import SignupModal from "@/components/Auth/SignupModal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

interface signupProps {}

const signup: FC<signupProps> = ({}) => {
	return (
		<section className="grid min-h-screen w-full place-items-center">
			<div className="space-y-4">
				<Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "-mt-20 self-start")}>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Home
				</Link>

				<SignupModal />
			</div>
		</section>
	);
};

export default signup;
