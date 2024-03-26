import { getAuthSession } from "@/lib/auth";
import Link from "next/link";
import { Icons } from "../Icons";
import { buttonVariants } from "../ui/Button";
import NotificationMenu from "./NotificationMenu";
import Searchbar from "./Searchbar";
import UserMenu from "./UserMenu";
import { loadNotifications } from "@/lib/actions";

const Navbar = async () => {
	const session = await getAuthSession();

	const notifications = session ? await loadNotifications(session.user.id) : [];

	return (
		<nav className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-white px-4 py-2 sm:gap-8 sm:px-8 md:gap-32">
			<Link href="/" className="flex">
				<Icons.logo /> &nbsp;
				<h1 className="text-md font-bold max-sm:hidden sm:text-nowrap md:text-lg">
					CloneHub
					<sup className="text-orange-500"> Forums</sup>
				</h1>
			</Link>

			{/* searchbar */}
			<Searchbar />

			{session ? (
				<div className="flex items-center gap-2">
					<NotificationMenu userId={session.user.id} initialNotifications={notifications} />

					<UserMenu user={session.user} />
				</div>
			) : (
				<Link href="/signin" className={buttonVariants()}>
					Sign in
				</Link>
			)}
		</nav>
	);
};

export default Navbar;
