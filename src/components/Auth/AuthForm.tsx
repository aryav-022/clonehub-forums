"use client";

import { signIn } from "next-auth/react";
import { FC } from "react";
import { useFormStatus } from "react-dom";
import { Icons } from "../Icons";
import { Button } from "../ui/Button";

interface AuthFormProps {
	children: React.ReactNode;
}

const AuthForm: FC<AuthFormProps> = ({ children }) => {
	async function signinWithGoogle() {
		try {
			await signIn("google");
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<form className="flex flex-col gap-2" action={signinWithGoogle}>
			<SubmitButton>{children}</SubmitButton>
		</form>
	);
};

function SubmitButton({ children }: { children: React.ReactNode }) {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" isLoading={pending}>
			{!pending && <Icons.google className="mr-2 h-5 w-5" />} {children}
		</Button>
	);
}

export default AuthForm;
