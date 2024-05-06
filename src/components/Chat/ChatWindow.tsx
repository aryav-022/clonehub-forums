"use client";

import { cn } from "@/lib/utils";
import { Check, CheckCheck, MailWarning, X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/Button";
import { useChat } from "./ChatContext";
import { useEffect, useRef } from "react";

const ChatWindow = () => {
	const { chats, addMessage, selectedChat, removeSelectedChat } = useChat();
	const formRef = useRef<HTMLFormElement | null>(null);
	const messagesRef = useRef<HTMLUListElement | null>(null);

	if (!selectedChat) return null;

	const user = chats[selectedChat].user;
	const messages = chats[selectedChat].messages || [];

	async function sendMessage(formData: FormData) {
		const content = formData.get("message") as string;

		formRef.current?.reset();

		if (!content || !selectedChat) return;

		try {
			await addMessage(selectedChat, content);
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		messagesRef.current?.scrollTo({
			top: messagesRef.current.scrollHeight,
		});
	}, [chats, selectedChat]);

	return (
		<div className="w-96 overflow-hidden rounded-lg border border-orange-300 bg-white shadow-lg">
			<div className="flex items-center justify-between gap-4 bg-orange-300 p-2">
				<div className="flex items-center gap-4">
					<div className="relative h-10 w-10 rounded-full">
						{user.image && user.name && (
							<Image src={user.image} alt={user.name} fill className="rounded-full object-cover" />
						)}
					</div>
					<h3 className="text-lg font-medium">{user.name}</h3>
				</div>

				<Button
					type="button"
					variant="ghost"
					onClick={removeSelectedChat}
					className="p-2 hover:bg-transparent"
				>
					<X />
				</Button>
			</div>

			<ul className="h-96 space-y-2 overflow-auto p-3" ref={messagesRef}>
				{messages.map((message) => (
					<li
						key={message.id}
						className={cn(
							"max-w-2/3 flex w-fit min-w-16 items-end justify-between gap-2 rounded-lg p-2",
							{ "ml-auto bg-orange-300": message.toId === selectedChat },
							{ "mr-auto bg-neutral-300": message.fromId === selectedChat }
						)}
					>
						<span>{message.content}</span>
						{message.toId === selectedChat && <MessageStatus state={message.state} />}
					</li>
				))}
			</ul>

			<form action={sendMessage} className="flex" ref={formRef}>
				<textarea
					rows={1}
					className="flex-1 resize-none border-t border-orange-300 p-2"
					placeholder="Type Message..."
					name="message"
					id="message"
				/>
				<Button
					type="submit"
					variant="ghost"
					className="rounded-none bg-orange-300 px-4 hover:bg-orange-400"
				>
					Send
				</Button>
			</form>
		</div>
	);
};

function MessageStatus({
	state,
}: {
	state: "PENDING" | "FAILED" | "DELIVERED" | "SEEN" | undefined;
}) {
	switch (state) {
		case "PENDING":
			return <span className="animate-spin rounded-full border-l border-t border-orange-600 p-1" />;
		case "FAILED":
			return (
				<span className="relative left-1 top-1 text-orange-600">
					<MailWarning size={14} />
				</span>
			);
		case "DELIVERED":
			return (
				<span className="relative left-1 top-1 text-orange-600">
					<Check size={14} />
				</span>
			);
		case "SEEN":
			return (
				<span className="relative left-1 top-1 text-orange-600">
					<CheckCheck size={14} />
				</span>
			);
		default:
			return null;
	}
}

export default ChatWindow;
