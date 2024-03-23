import { getAuthSession } from "@/lib/auth";
import { Search } from "lucide-react";
import Link from "next/link";
import { Icons } from "../Icons";
import { buttonVariants } from "../ui/Button";
import UserMenu from "./UserMenu";

const Navbar = async () => {
	const session = await getAuthSession();

	return (
		<nav className="sticky top-0 z-30 flex h-14 items-center justify-between gap-32 border-b bg-white px-8 py-2">
			<Link href="/" className="flex">
				<Icons.logo /> &nbsp;
				<h1 className="text-lg font-bold">
					CloneHub
					<sup className="text-orange-500"> Forums</sup>
				</h1>
			</Link>

			{/* searchbar */}
			<div className="flex grow items-center rounded-md">
				<Search size={16} className="relative left-7 z-10 text-neutral-400" />
				<input
					type="text"
					placeholder="Search for communities"
					className="w-full rounded-md border border-neutral-400 bg-gray-100 py-2 pl-10 pr-4 outline-none focus:ring"
				/>
			</div>

			{session ? (
				<UserMenu user={session.user} />
			) : (
				<Link href="/signin" className={buttonVariants()}>
					Sign in
				</Link>
			)}
		</nav>
	);
};

export default Navbar;
