"use client";

import { MessageCircleMore } from "lucide-react";
import { Button } from "../ui/Button";
import { useChat } from "../Chat/ChatContext";
import { cn } from "@/lib/utils";

const ToggleChatBoxButton = () => {
	const { isChatting, toggleChatMenu } = useChat();

	return (
		<Button type="button" variant="ghost" onClick={toggleChatMenu} className="p-2">
			<MessageCircleMore className={cn({ "text-orange-500": isChatting })} />
		</Button>
	);
};

export default ToggleChatBoxButton;
