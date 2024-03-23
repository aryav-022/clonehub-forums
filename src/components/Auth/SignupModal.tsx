import { Icons } from "@/components/Icons";
import Link from "next/link";
import AuthForm from "./AuthForm";

export default function SignupModal() {
	return (
		<div className="w-96 space-y-10 rounded-lg border p-10 shadow-md">
			<Link
				href="/"
				className="mb-2 flex items-center justify-center gap-2 text-center text-2xl font-medium"
			>
				<Icons.logo size={32} /> CloneHub <sup className="text-xl text-orange-500">Forums</sup>
			</Link>

			<div>
				<h1 className="mb-2 text-center text-2xl">Sign up</h1>
				<p className="text-center text-neutral-500">
					By signing up you agree to our terms and conditions
				</p>
			</div>

			<AuthForm>Sign up with Google</AuthForm>

			<p className="text-center text-sm text-neutral-500">
				Already a CloneHub user?{" "}
				<Link href="/signin" replace className="font-medium underline underline-offset-1">
					Sign in
				</Link>{" "}
				instead
			</p>
		</div>
	);
}
