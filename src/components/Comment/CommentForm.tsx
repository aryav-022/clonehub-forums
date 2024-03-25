"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/Button";
import { ZodError } from "zod";
import { useToast } from "../ui/Toast";
import { createComment } from "@/lib/actions";
import { type CommentCreationRequest, CommentValidator } from "@/lib/validators/comment";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import type { ExtendedComments } from "./Comments";
import { useRef } from "react";

interface CommentFormProps {
	session: Session | null;
	postId?: string;
	replyToId?: string;
	addComment: (comment: ExtendedComments) => void;
	rows?: number;
}

export default function CommentForm({
	postId,
	replyToId,
	session,
	addComment,
	rows,
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

		try {
			const entries: CommentCreationRequest = {
				content: formData.get("comment") as string,
				postId,
				replyToId,
				authorId: session.user.id,
			};

			const payload = CommentValidator.parse(entries);
			const res = await createComment(payload);

			if (res.status === 200) {
				toast({
					title: "Success",
					message: "Comment created successfully.",
					variant: "success",
				});

				addComment(res.data);

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
		<form ref={formRef} action={handleSubmit}>
			<textarea
				name="comment"
				id="comment"
				required
				placeholder="Write your thoughts..."
				rows={rows || 3}
				className="w-full resize-none rounded-lg border p-2 focus:outline-none focus:ring-2"
			></textarea>

			<SubmitButton />
		</form>
	);
}

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" aria-disabled={pending} isLoading={pending}>
			Comment
		</Button>
	);
}
