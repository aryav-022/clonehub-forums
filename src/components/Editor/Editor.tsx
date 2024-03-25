"use client";

import { createPost } from "@/lib/actions";
import { uploadFile } from "@/lib/cloudinary";
import { PostValidator } from "@/lib/validators/post";
import type EditorJS from "@editorjs/editorjs";
import { useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import TextareaAutosize from "react-textarea-autosize";
import { ZodError } from "zod";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import "@/styles/editor.css";

interface EditorProps {
	slug: string;
}

const Editor: FC<EditorProps> = ({ slug }) => {
	const toast = useToast();
	const router = useRouter();
	const editorRef = useRef<EditorJS>();
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const titleRef = useRef<HTMLTextAreaElement>(null);

	const initializeEditor = useCallback(async () => {
		const Editor = (await import("@editorjs/editorjs")).default;
		const Header = (await import("@editorjs/header")).default;
		const List = (await import("@editorjs/list")).default;
		const Embed = (await import("@editorjs/embed")).default;
		const InlineCode = (await import("@editorjs/inline-code")).default;
		const Code = (await import("@editorjs/code")).default;
		const Table = (await import("@editorjs/table")).default;
		const LinkTool = (await import("@editorjs/link")).default;
		const ImageTool = (await import("@editorjs/image")).default;

		if (!editorRef.current) {
			const editor = new Editor({
				holder: "editor",
				placeholder: "Type here to write your post...",
				inlineToolbar: true,
				data: { blocks: [] },
				minHeight: 300,
				onReady: () => {
					editorRef.current = editor;
				},
				tools: {
					header: Header,
					linkTool: {
						class: LinkTool,
						config: {
							endpoint: "/api/link",
						},
					},
					image: {
						class: ImageTool,
						config: {
							uploader: {
								async uploadByFile(file: File) {
									const formData = new FormData();
									formData.append("file", file);

									const res = await uploadFile(formData);

									return {
										success: res.status,
										file: {
											url: res.url,
										},
									};
								},
								async uploadByUrl(url: string) {
									return {
										success: 1,
										file: {
											url,
										},
									};
								},
							},
						},
					},
					list: List,
					embed: Embed,
					inlineCode: InlineCode,
					code: Code,
					table: Table,
				},
			});
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setIsMounted(true);
	}, []);

	useEffect(() => {
		const init = async () => {
			await initializeEditor();

			setTimeout(() => {
				titleRef.current?.focus();
			});
		};

		if (isMounted) {
			init();

			return () => {
				editorRef.current?.destroy();
				editorRef.current = undefined;
			};
		}
	}, [isMounted, initializeEditor]);

	async function handleSubmit(formData: FormData) {
		try {
			const blocks = await editorRef.current?.save();

			const data = {
				title: formData.get("title"),
				content: blocks,
				slug,
			};

			const payload = PostValidator.parse(data);

			const res = await createPost(payload);

			if (res.status === 200) {
				toast({
					title: "Post Created",
					message: "Your post has been created successfully.",
					variant: "success",
				});

				router.push(`/c/${slug}/post/${res.data.cuid}`);
			} else if (res.status === 401) {
				toast({
					title: "Unauthorized",
					message: res.message,
					variant: "warning",
				});
			} else if (res.status === 404) {
				toast({
					title: "Not Found",
					message: res.message,
					variant: "warning",
				});
			} else {
				toast({
					title: "An error occurred",
					message: res.message,
					variant: "error",
				});
			}
		} catch (error) {
			if (error instanceof ZodError) {
				return toast({
					title: "Validation Error",
					message: error.errors[0].message,
					variant: "warning",
				});
			}

			toast({
				title: "An error occurred",
				message: "An unexpected error occurred. Please try again later.",
				variant: "error",
			});
		}
	}

	if (!isMounted) {
		return null;
	}

	return (
		<div className="my-6 w-fit rounded-lg border border-neutral-300 bg-neutral-50 p-4 md:m-6">
			<form action={handleSubmit}>
				<div className="prose prose-stone dark:prose-invert">
					<TextareaAutosize
						ref={titleRef}
						name="title"
						id="title"
						required
						placeholder="Title"
						className="w-fit resize-none appearance-none overflow-hidden bg-transparent text-2xl font-bold focus:outline-none sm:text-3xl md:text-5xl"
					/>
				</div>

				<div id="editor" className="prose relative z-0 min-h-80"></div>

				<SubmitButton />
			</form>
		</div>
	);
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button className="w-full" aria-disabled={pending} isLoading={pending}>
			Create Post
		</Button>
	);
}

export default Editor;
