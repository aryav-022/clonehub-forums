"use client";

import { cn } from "@/lib/utils";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Button, buttonVariants } from "../ui/Button";

interface UserMenuProps {
	user: User;
}

const UserMenu: FC<UserMenuProps> = ({ user }) => {
	return (
		<div className="group relative flex h-full items-center">
			<button className="relative aspect-square h-full min-h-12">
				<Image
					src={user.image || ""}
					alt="profile"
					height={60}
					width={60}
					className="h-full w-full rounded-full"
				/>
			</button>

			<menu
				tabIndex={0}
				className="absolute right-0 top-full z-10 mt-2 origin-top scale-y-0 divide-y overflow-hidden rounded-md border bg-white p-2 text-sm shadow-md transition-all group-focus-within:scale-y-100"
			>
				<li className="p-2">
					<div className="text-nowrap text-base">{user.name}</div>
					<div className="text-nowrap text-neutral-500">{user.email}</div>
				</li>
				<li>
					<div className="py-2">
						<Link
							href={`/u/${user.username}`}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full cursor-pointer justify-start px-2 py-1",
								})
							)}
						>
							<UserIcon size={16} className="mr-2" />
							Profile
						</Link>
						<Link
							href={`/u/${user.username}/settings`}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full cursor-pointer justify-start px-2 py-1",
								})
							)}
						>
							<Settings size={16} className="mr-2" />
							Settings
						</Link>
					</div>
				</li>
				<li>
					<Button
						variant="ghost"
						className="w-full justify-start px-2 py-1"
						onClick={() => signOut()}
					>
						<LogOut size={16} className="mr-2" /> Signout
					</Button>
				</li>
			</menu>
		</div>
	);
};

export default UserMenu;
