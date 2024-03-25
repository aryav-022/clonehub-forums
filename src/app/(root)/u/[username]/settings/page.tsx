import ChangeProfilePicture from "@/components/settings/ChangeProfilePicture";
import ChangeProfileVisibility from "@/components/settings/ChangeProfileVisibility";
import ChangeUsername from "@/components/settings/ChangeUsername";
import DeleteAccount from "@/components/settings/DeleteAccount";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface PageProps {
	params: { username: string };
}

const Page = async ({ params: { username } }: PageProps) => {
	const session = await getAuthSession();

	if (!session) redirect("/signin");

	const user = await db.user.findFirst({
		where: { username },
	});

	if (!user) return notFound();

	return (
		<section className="col-span-5 space-y-4 py-8 sm:p-8 lg:col-span-4">
			<h1 className="text-3xl font-semibold">User Settings</h1>

			<div className="space-y-4 rounded-lg bg-neutral-50 p-4">
				<h2 className="text-xl font-medium">Account</h2>
				<ul className="grid gap-8 md:grid-cols-2">
					<li>
						<ChangeUsername user={user} />
					</li>
					<li className="flex lg:gap-2">
						<h3 className="text-sm font-medium">Change Profile Picture</h3>
						<ChangeProfilePicture user={user} />
					</li>
				</ul>
			</div>

			<div className="space-y-4 rounded-lg bg-neutral-50 p-4">
				<h2 className="text-xl font-medium">Privacy</h2>
				<ul>
					<li className="space-y-2">
						<h3 className="text-sm font-medium">Profile visibility</h3>
						<ChangeProfileVisibility user={user} />
					</li>
				</ul>
			</div>

			<div className="space-y-4 rounded-lg bg-neutral-50 p-4">
				<h2 className="text-xl font-medium">Danger Zone</h2>
				<ul>
					<li>
						<DeleteAccount user={user} />
					</li>
				</ul>
			</div>
		</section>
	);
};

export default Page;
