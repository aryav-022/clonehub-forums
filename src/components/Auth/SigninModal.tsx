import { Icons } from "@/components/Icons";
import Link from "next/link";
import AuthForm from "./AuthForm";

export default function SigninModal() {
	return (
		<div className="w-96 space-y-10 rounded-lg border p-10 shadow-md">
			<Link
				href="/"
				className="mb-2 flex items-center justify-center gap-2 text-center text-2xl font-medium"
			>
				<Icons.logo size={32} /> CloneHub <sup className="text-xl text-orange-500">Forums</sup>
			</Link>

			<div>
				<h1 className="mb-2 text-center text-2xl">Sign in</h1>
				<p className="text-center text-neutral-500">
					By signing in you agree to our terms and conditions
				</p>
			</div>

			<AuthForm>Sign in with Google</AuthForm>

			<p className="text-center text-sm text-neutral-500">
				New to CloneHub?{" "}
				<Link href="/signup" replace className="font-medium underline underline-offset-1">
					Sign up
				</Link>{" "}
				instead
			</p>
		</div>
	);
}
