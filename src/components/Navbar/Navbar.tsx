import { getAuthSession } from "@/lib/auth";
import Link from "next/link";
import { Icons } from "../Icons";
import { buttonVariants } from "../ui/Button";
import Searchbar from "./Searchbar";
import UserMenu from "./UserMenu";

const Navbar = async () => {
	const session = await getAuthSession();

	return (
		<nav className="sticky top-0 z-30 flex h-14 items-center justify-between gap-32 border-b bg-white px-8 py-2">
			<Link href="/" className="flex">
				<Icons.logo /> &nbsp;
				<h1 className="text-lg font-bold sm:text-nowrap">
					CloneHub
					<sup className="text-orange-500"> Forums</sup>
				</h1>
			</Link>

			{/* searchbar */}
			<Searchbar />

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
