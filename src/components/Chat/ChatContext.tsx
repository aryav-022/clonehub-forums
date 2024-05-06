"use client";

import { getChats, getUser } from "@/lib/actions";
import type { User } from "@prisma/client";
import type { Session } from "next-auth";
import { createContext, use, useEffect, useOptimistic, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface ChatContextType {
	isChatting: Boolean;
	toggleChatMenu: () => void;
	chats: Chats;
	addMessage: (toId: string, content: string) => Promise<void>;
	createNewChat: (toId: string) => void;
	selectedChat: string | null;
	selectChat: (id: string) => void;
	removeSelectedChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
	isChatting: false,
	toggleChatMenu: () => {},
	chats: {},
	addMessage: (toId: string, content: string) => new Promise<void>((resolve, reject) => reject()),
	createNewChat: (toId: string) => {},
	selectedChat: null,
	selectChat: (id: string) => {},
	removeSelectedChat: () => {},
});

export function useChat() {
	return use(ChatContext);
}

export interface Message {
	id: string;
	createdAt: Date;
	fromId: string;
	toId: string;
	content: string;
	state: "PENDING" | "FAILED" | "DELIVERED" | "SEEN";
}

export interface Chats {
	[key: string]: {
		id: string;
		user: User;
		messages: Message[];
	};
}

interface ChatProviderProps {
	children: React.ReactNode;
	session: Session | null;
}

export default function ChatProvider({ children, session }: ChatProviderProps) {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isChatting, setIsChatting] = useState<Boolean>(false);
	const [chats, setChats] = useState<Chats>({});
	const [optimisticChats, setOptimisticChats] = useOptimistic<Chats>(chats);
	const [selectedChat, setSelectedChat] = useState<string | null>(null);

	function selectChat(id: string) {
		setSelectedChat(id);
	}

	function removeSelectedChat() {
		setSelectedChat(null);
	}

	useEffect(() => {
		if (!session) return;

		const _socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
			query: { id: session.user.id },
		});

		_socket.on("connect", () => {
			setSocket(_socket);
		});

		_socket.on("message", async (message: Message) => {
			const user = chats[message.fromId]?.user || (await getUser(message.fromId));

			setChats((prevChat) => {
				const newChats = structuredClone(prevChat);
				newChats[message.fromId] ||= {
					id: message.fromId,
					user,
					messages: [],
				};
				newChats[message.fromId].messages.push(message);
				return newChats;
			});
		});

		(async () => {
			const _chats = await getChats(session.user.id);
			setChats(_chats);
		})();

		return () => {
			_socket?.disconnect();
		};
	}, []);

	function toggleChatMenu() {
		setIsChatting((isChatting) => !isChatting);
	}

	function createNewMessage(fromId: string, toId: string, content: string): Message {
		return {
			id: Math.random().toString(36).substring(0, 9),
			createdAt: new Date(),
			fromId,
			toId,
			content,
			state: "PENDING",
		};
	}

	async function addMessage(toId: string, content: string): Promise<void> {
		if (!socket || !session) return new Promise<void>((resolve, reject) => reject());

		const newMessage = createNewMessage(session.user.id, toId, content);

		const user = chats[toId]?.user || (await getUser(toId));

		setOptimisticChats((prevChat) => {
			const newChats = structuredClone(prevChat);
			newChats[toId] ||= {
				id: toId,
				user,
				messages: [],
			};
			newChats[toId].messages.push(newMessage);
			return newChats;
		});

		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				newMessage.state = "FAILED";

				setChats((prevChat) => {
					const newChats = structuredClone(prevChat);
					newChats[toId] ||= {
						id: toId,
						user,
						messages: [],
					};
					newChats[toId].messages.push(newMessage);
					return newChats;
				});

				reject();
			}, 10000);

			function acknowledgment(message: Message) {
				clearTimeout(timeout);

				message.state = "DELIVERED";

				setChats((prevChat) => {
					const newChats = structuredClone(prevChat);
					newChats[toId] ||= {
						id: toId,
						user,
						messages: [],
					};
					newChats[toId].messages.push(message);
					return newChats;
				});

				resolve();
			}

			socket.emit("message", newMessage, acknowledgment);
		});
	}

	async function createNewChat(toId: string) {
		if (!chats[toId] || chats[toId].messages.length === 0) {
			const user = await getUser(toId);

			if (!user) return;

			setChats((prevChat) => {
				const newChats: Chats = structuredClone(prevChat);
				newChats[toId] = {
					id: toId,
					user,
					messages: [],
				};
				return newChats;
			});
		}
		setIsChatting(true);
		selectChat(toId);
	}

	return (
		<ChatContext.Provider
			value={{
				isChatting,
				toggleChatMenu,
				chats: optimisticChats,
				addMessage,
				createNewChat,
				selectedChat,
				selectChat,
				removeSelectedChat,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
}
