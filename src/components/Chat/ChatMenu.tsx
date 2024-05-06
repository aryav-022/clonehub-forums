"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/Button";
import { useChat } from "./ChatContext";

const ChatMenu = () => {
	const { toggleChatMenu, chats } = useChat();

	const keys = Object.keys(chats);

	return (
		<div className="w-72 overflow-hidden rounded-lg border border-orange-300 bg-white shadow-lg ">
			<div className="flex items-center justify-between bg-orange-300 p-4 text-lg font-medium">
				<h3>Chats</h3>
				<Button
					type="button"
					variant="ghost"
					className="p-2 hover:bg-transparent"
					onClick={toggleChatMenu}
				>
					<X />
				</Button>
			</div>

			<ul className="h-72 divide-y overflow-auto">
				{keys.length === 0 ? (
					<h4 className="p-2">Nothing to show</h4>
				) : (
					keys.map((id) => <ChatCard key={id} id={id} />)
				)}
			</ul>
		</div>
	);
};

function ChatCard({ id }: { id: string }) {
	const { selectedChat, selectChat, chats } = useChat();

	const chat = chats[id];

	return (
		<li
			className={cn("flex cursor-pointer gap-2 p-2 hover:bg-neutral-100", {
				"bg-neutral-200": id === selectedChat,
			})}
			onClick={() => selectChat(id)}
		>
			<div className="relative h-10 w-10 rounded-full bg-neutral-800">
				{chat.user.image && chat.user.name && (
					<Image
						src={chat.user.image}
						alt={chat.user.name}
						fill
						className="rounded-full object-cover"
					/>
				)}
			</div>

			<div className="ml-2 flex-1">
				<h4 className="text-sm font-medium">{chat.user.name}</h4>
				<p className="truncate text-xs text-neutral-500">
					{chat.messages[chat.messages.length - 1]?.content || "No messages"}
				</p>
			</div>
		</li>
	);
}

export default ChatMenu;
