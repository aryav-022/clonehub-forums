import Link from "next/link";
import { FC } from "react";
import { Button, buttonVariants } from "./ui/Button";
import type { Session } from "next-auth";

interface DescriptionCardProps {
	title: string;
	description: string;
	showIcon?: Boolean;
	session?: Session | null;
	members?: number;
	posts?: number;
	createdAt?: Date;
	creatorId?: string;
}

const DescriptionCard: FC<DescriptionCardProps> = ({
	title,
	description,
	showIcon,
	session,
	members,
	posts,
	createdAt,
	creatorId,
}) => {
	return (
		<div className="scrollbar-thin sticky top-16 overflow-auto rounded-xl bg-neutral-100">
			<h1 className="px-6 py-8 font-medium">{title}</h1>

			<div className="space-y-3 px-4 pb-6 pt-4">
				<p className="text-sm text-gray-600">{description}</p>

				<dl>
					{members !== undefined && (
						<div>
							<dt>Members</dt>
							<dd>{members}</dd>
						</div>
					)}

					{createdAt !== undefined && (
						<div>
							<dt>Created</dt>
							<dd>{new Date(createdAt).toDateString()}</dd>
						</div>
					)}

					{posts !== undefined && (
						<div>
							<dt>Posts</dt>
							<dd>{posts}</dd>
						</div>
					)}
				</dl>

				{!!session ? (
					creatorId !== undefined ? (
						creatorId === session?.user.id ? (
							<p>You created this community.</p>
						) : (
							<Button>Leave Community</Button>
						)
					) : (
						<Link href="/c/create" className={buttonVariants({ className: "w-full" })}>
							Create Community
						</Link>
					)
				) : (
					<Link href="/signin" className={buttonVariants({ className: "w-full" })}>
						Signin to create community
					</Link>
				)}
			</div>
		</div>
	);
};

export default DescriptionCard;
