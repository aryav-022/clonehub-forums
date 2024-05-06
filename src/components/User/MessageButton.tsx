"use client";

import { FC } from "react";
import { Button } from "../ui/Button";
import { useChat } from "../Chat/ChatContext";

interface MessageButtonProps {
	to: string;
}

const MessageButton: FC<MessageButtonProps> = ({ to }) => {
	const { createNewChat } = useChat();

	function messageUser() {
		createNewChat(to);
	}

	return (
		<Button className="w-fit bg-orange-600 hover:bg-orange-500" onClick={messageUser}>
			Message
		</Button>
	);
};

export default MessageButton;
