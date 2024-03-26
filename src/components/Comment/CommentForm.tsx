"use client";

import { createComment } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { CommentValidator, type CommentCreationRequest } from "@/lib/validators/comment";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { ZodError } from "zod";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import type { ExtendedComment } from "./Comments";

interface CommentFormProps {
	postId: string;
	replyToId?: string;
	variant: "Post" | "Comment";
	session: Session | null;
	addComment: (comment: ExtendedComment) => void;
	author?: string;
}

export default function CommentForm({
	postId,
	replyToId,
	variant,
	session,
	addComment,
	author,
}: CommentFormProps) {
	const toast = useToast();
	const router = useRouter();

	const formRef = useRef<HTMLFormElement | null>(null);

	async function handleSubmit(formData: FormData) {
		if (!session) {
			return toast({
				title: "Unauthorized",
				message: "Please sign in to comment.",
				variant: "warning",
			});
		}

		const content = formData.get("comment") as string;

		try {
			const entries: CommentCreationRequest = {
				postId,
				replyToId,
				variant,
				content,
			};

			const payload = CommentValidator.parse(entries);
			const res = await createComment(payload);

			if (res.status === 200) {
				addComment(res.data);

				toast({
					title: "Success",
					message: "Comment created successfully.",
					variant: "success",
				});

				router.refresh();
			} else {
				toast({
					title: "Error",
					message: "An unexpected error occurred. Please try again later.",
					variant: "error",
				});
			}
		} catch (err) {
			if (err instanceof ZodError) {
				return toast({
					title: "Validation Error",
					message: err.errors[0].message,
					variant: "warning",
				});
			}

			toast({
				title: "Error",
				message: "An unexpected error occurred. Please try again later.",
				variant: "error",
			});
		} finally {
			formRef.current?.reset();
		}
	}

	return (
		<form ref={formRef} action={handleSubmit} className={cn({ flex: variant === "Comment" })}>
			<textarea
				name="comment"
				id="comment"
				required
				placeholder="Write your thoughts..."
				rows={variant === "Post" ? 3 : 1}
				className={cn(
					"w-full resize-none rounded-lg border px-2 py-1 focus:outline-none focus:ring-2",
					{
						"rounded-r-none": variant === "Comment",
					}
				)}
				defaultValue={author ? `@${author} ` : ""}
			></textarea>

			<SubmitButton variant={variant} />
		</form>
	);
}

function SubmitButton({ variant }: { variant: "Post" | "Comment" }) {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			aria-disabled={pending}
			isLoading={pending}
			className={cn({ "rounded-l-none": variant === "Comment" })}
		>
			Comment
		</Button>
	);
}
