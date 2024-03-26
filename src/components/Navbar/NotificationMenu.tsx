"use client";

import { loadNotifications, markAllNotificationsAsRead } from "@/lib/actions";
import { cn, timeFromNow } from "@/lib/utils";
import type { Comment, Community, Notification, Post, User } from "@prisma/client";
import { Bell } from "lucide-react";
import Link from "next/link";
import React, { FC, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/Button";
import { NOTIFICATIONS_PER_PAGE } from "@/config";

type ExtendedPost = Post & {
	community: Community;
};

type ExtendedNotification = Notification & {
	post: ExtendedPost;
	comment: Comment | null;
	userTriggered: User;
};

interface NotificationMenuProps {
	userId: string;
	initialNotifications: ExtendedNotification[];
}

const NotificationMenu: FC<NotificationMenuProps> = ({ userId, initialNotifications }) => {
	const [notifications, setNotifications] = useState<ExtendedNotification[]>(initialNotifications);
	const [isAllRead, setIsAllRead] = useState<boolean>(notifications.every((n) => n.read));

	async function readAllUnreadNotifications() {
		await markAllNotificationsAsRead(userId);
		setIsAllRead(true);
	}

	async function loadMore() {
		const newNotifications = await loadNotifications(
			userId,
			notifications.length / NOTIFICATIONS_PER_PAGE
		);
		setNotifications((prev) => [...prev, ...newNotifications]);
	}

	return (
		<div className="group relative flex h-full items-center">
			<Button
				className={cn("relative p-2", {
					"after:absolute after:bottom-1 after:right-1 after:h-[6px] after:w-[6px] after:rounded-full after:bg-orange-500":
						!isAllRead,
				})}
				variant="ghost"
				onClick={isAllRead ? () => {} : readAllUnreadNotifications}
			>
				<Bell size={24} />
			</Button>

			<ul
				tabIndex={0}
				className="scrollbar-thin absolute -right-8 top-full z-10 mt-2 max-h-96 w-64 origin-top scale-y-0 divide-y overflow-auto rounded-md border bg-white p-2 text-sm shadow-md transition-all focus-within:scale-y-100 hover:scale-y-100 group-focus-within:scale-y-100 sm:right-0"
			>
				{notifications.map((notification) => (
					<NotificationCard notification={notification} />
				))}

				<form action={loadMore}>
					<SubmitButton />
				</form>
			</ul>
		</div>
	);
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" isLoading={pending} aria-disabled={pending}>
			Show Older Notifications
		</Button>
	);
}

function NotificationCard({ notification }: { notification: ExtendedNotification }) {
	const link =
		`/c/${notification.post.community.name}/post/${notification.postId}` +
		(notification.commentId ? `?comment=${notification.commentId}` : "");

	return (
		<li key={notification.id} className="hover:bg-neutral-50">
			<Link href={link} className="flex flex-col p-2">
				<NotificationMessage notification={notification} />
				<div className="flex items-center justify-between">
					<small>{timeFromNow(notification.createdAt)}</small>
					{!notification.read && <div className="h-2 w-2 rounded-full bg-orange-500" />}
				</div>
			</Link>
		</li>
	);
}

function NotificationMessage({ notification }: { notification: ExtendedNotification }) {
	switch (notification.type) {
		case "MENTIONED":
			return (
				<p>
					<Link
						href={`/u/${notification.userTriggered.username}`}
						className="font-semibold text-orange-500"
					>
						{notification.userTriggered.username}
					</Link>{" "}
					mentioned you in a comment
				</p>
			);
		case "POST_UPVOTED":
			return `${notification.userTriggered.username} replied to your comment`;
		case "COMMENT_UPVOTED":
			return `${notification.userTriggered.username} liked your comment`;
	}
}

export default NotificationMenu;
