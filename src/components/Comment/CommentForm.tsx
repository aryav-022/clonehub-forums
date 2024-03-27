"use client";

import { createComment, getSuggestions } from "@/lib/actions";
import { cn, debounce } from "@/lib/utils";
import { CommentValidator, type CommentCreationRequest } from "@/lib/validators/comment";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ZodError } from "zod";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import type { ExtendedComment } from "./Comments";
import type { User } from "@prisma/client";

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

	const [suggestions, setSuggestions] = useState<User[]>([]);

	const formRef = useRef<HTMLFormElement | null>(null);
	const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

	function detectMentions(e: any) {
		const content = e.target.value;
		const lastWord = content.split(" ").pop();

		if (lastWord && lastWord.startsWith("@")) {
			suggestMentions(lastWord.slice(1));
		} else {
			setSuggestions([]);
		}
	}

	const suggestMentions = debounce(async (word: string) => {
		const userSuggestions = await getSuggestions(word);
		setSuggestions(userSuggestions);
	}, 500);

	function acceptSuggestion(e: any) {
		const commentInput = inputRef.current;

		if (!commentInput) return;

		const content = commentInput.value;
		const lastWord = content.split(" ").pop() as string;

		const newContent = content.split(" ").slice(0, -1).join(" ") + ` @${e} `;
		commentInput.value = newContent;

		setSuggestions([]);
		commentInput.focus();
	}

	return (
		<form ref={formRef} action={handleSubmit} className={cn({ flex: variant === "Comment" })}>
			<div className="group relative">
				<textarea
					ref={inputRef}
					name="comment"
					id="comment"
					required
					placeholder="Write your thoughts..."
					rows={variant === "Post" ? 3 : 1}
					className={cn(
						"relative w-full resize-none rounded-lg border px-2 py-1 focus:outline-none focus:ring-2",
						{
							"rounded-r-none": variant === "Comment",
						}
					)}
					defaultValue={author ? `@${author} ` : ""}
					onInput={detectMentions}
				></textarea>

				{/* add suggestions above @ if suggestions array isn't empty */}
				{suggestions.length > 0 && (
					<ul className="scrollbar-thin absolute z-10 hidden max-h-40 divide-y overflow-auto rounded-lg border bg-white shadow-md group-focus-within:block">
						{suggestions.map((user) => (
							<Button
								key={user.id}
								className="block w-full cursor-pointer rounded-none p-2 text-orange-500"
								variant="ghost"
								type="button"
								onClick={() => acceptSuggestion(user.username)}
							>
								u/{user.username}
							</Button>
						))}
					</ul>
				)}
			</div>

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
