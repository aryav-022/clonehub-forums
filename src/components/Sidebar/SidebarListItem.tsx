"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { FC } from "react";

interface SidebarListItemProps {
	children: React.ReactNode;
    link: string;
}

const SidebarListItem: FC<SidebarListItemProps> = ({ children, link }) => {
	const pathname = usePathname();

	return (
		<li
			className={cn("hover:bg-neutral-100 cursor-pointer rounded-md", {
				"bg-neutral-200": pathname === link,
			})}>
			{children}
		</li>
	);
};

export default SidebarListItem;
