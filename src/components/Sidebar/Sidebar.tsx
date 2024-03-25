import { BriefcaseBusiness, Code, Gamepad2, Home, Medal, Star, Tv } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import SidebarListItem from "./SidebarListItem";

interface SidebarProps {}

const Sidebar: FC<SidebarProps> = () => {
	return (
		<aside className="scrollbar-thin sticky left-0 top-14 hidden h-[calc(100dvh-56px)] w-full divide-y overflow-auto border-r lg:block">
			<menu className="space-y py-4">
				<SidebarListItem link="/">
					<Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm ">
						<Home /> Home
					</Link>
				</SidebarListItem>
			</menu>

			<div className="py-4">
				<h3 className="font-medium">Recent</h3>
				<ul className="space-y-2 py-2">
					<li className="text-sm">Nothing to show</li>
				</ul>
			</div>

			<div className="py-4">
				<h3 className="font-medium">Topics</h3>
				<ul className="space-y py-2">
					<SidebarListItem link="/t/gaming">
						<Link href="/t/gaming" className="flex items-center gap-2 px-4 py-2 text-sm">
							<Gamepad2 /> Gaming
						</Link>
					</SidebarListItem>
					<SidebarListItem link="/t/sports">
						<Link href="/t/sports" className="flex items-center gap-2 px-4 py-2 text-sm">
							<Medal /> Sports
						</Link>
					</SidebarListItem>
					<SidebarListItem link="/t/business">
						<Link href="/t/business" className="flex items-center gap-2 px-4 py-2 text-sm">
							<BriefcaseBusiness /> Business
						</Link>
					</SidebarListItem>
					<SidebarListItem link="/t/programming">
						<Link href="/t/programming" className="flex items-center gap-2 px-4 py-2 text-sm">
							<Code /> Programming
						</Link>
					</SidebarListItem>
					<SidebarListItem link="/t/television">
						<Link href="/t/television" className="flex items-center gap-2 px-4 py-2 text-sm">
							<Tv /> Television
						</Link>
					</SidebarListItem>
					<SidebarListItem link="/t/celebrity">
						<Link href="/t/celebrity" className="flex items-center gap-2 px-4 py-2 text-sm">
							<Star /> Celebrity
						</Link>
					</SidebarListItem>
				</ul>
			</div>

			<div className="py-4">
				<h3 className="font-medium">Communities</h3>
				<ul className="space-y-2 py-2">
					<li className="text-sm">Nothing to show</li>
				</ul>
			</div>

			<div className="py-4">
				<h3 className="font-medium">Trending</h3>
				<ul className="space-y-2 py-2">
					<li className="text-sm">Nothing to show</li>
				</ul>
			</div>
		</aside>
	);
};

export default Sidebar;
