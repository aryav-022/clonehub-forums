"use client";

import { Show, cn } from "@/lib/utils";
import { FC, useState } from "react";
import { useChat } from "./ChatContext";
import ChatMenu from "./ChatMenu";
import ChatWindow from "./ChatWindow";

interface ChatContainerProps {}

const ChatContainer: FC<ChatContainerProps> = ({}) => {
	const { isChatting, selectedChat } = useChat();

	return (
		<div
			className={cn("fixed bottom-2 right-4 z-10 hidden", {
				"flex items-end gap-2": isChatting,
			})}
		>
			<Show If={!!selectedChat}>
				<ChatWindow />
			</Show>
			<ChatMenu />
		</div>
	);
};

export default ChatContainer;
