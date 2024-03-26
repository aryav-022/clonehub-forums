"use client";

import type EditorJS from "@editorjs/editorjs";
import { FC, useCallback, useEffect, useId, useRef, useState } from "react";
import "@/styles/editor.css";

interface EditorOutputProps {
	content: any;
}

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
	const editorRef = useRef<EditorJS>();
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const id = useId();

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
				holder: id,
				data: content,
				readOnly: true,
				tools: {
					header: Header,
					linkTool: LinkTool,
					image: ImageTool,
					list: List,
					embed: Embed,
					inlineCode: InlineCode,
					code: Code,
					table: Table,
				},
				onReady: () => {
					editorRef.current = editor;
				},
			});
		}
	}, [content, id]);

	useEffect(() => {
		const init = async () => {
			await initializeEditor();
		};

		if (isMounted) {
			init();

			return () => {
				editorRef.current?.destroy();
				editorRef.current = undefined;
			};
		}
	}, [isMounted, initializeEditor]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return <div id={id} className="prose relative z-0" />;
};

export default EditorOutput;
