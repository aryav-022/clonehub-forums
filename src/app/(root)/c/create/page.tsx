"use client";

import { Button } from "@/components/ui/Button";
import ImageInput from "@/components/ui/ImageInput";
import { useToast } from "@/components/ui/Toast";
import { createCommunity } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { useFormStatus } from "react-dom";

interface pageProps {}

const Page: FC<pageProps> = ({}) => {
	const router = useRouter();
	const toast = useToast();

	async function submitForm(formData: FormData) {
		const res = await createCommunity(formData);

		if (res.status === 200) {
			toast({ title: "success", message: "Community created successfully!", variant: "success" });
			router.push(`/c/${formData.get("communityName")}`);
		} else if (res.status === 400) {
			toast({ title: "Validation Error", message: res.message, variant: "warning" });
		} else if (res.status === 401) {
			toast({ title: "Unauthorized", message: res.message, variant: "warning" });
		} else if (res.status === 409) {
			toast({ title: "Invalid Community Name", message: res.message, variant: "warning" });
		} else {
			toast({ title: "Server Error", message: res.message, variant: "error" });
		}
	}

	return (
		<section className="col-span-5 my-8 space-y-8 sm:px-8 lg:col-span-4">
			<div>
				<h1 className="mb-1 text-2xl font-semibold">Create Community</h1>
				<p>Please fill in the required information below:</p>
			</div>

			<form
				className="max-md:space-y-8 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:gap-x-20"
				action={submitForm}
			>
				<fieldset className="flex flex-col gap-2 text-sm">
					<label htmlFor="name" className="font-medium">
						Community Name
					</label>
					<input
						type="text"
						name="communityName"
						id="communityName"
						placeholder="e.g. CloneHub"
						required
						className="rounded-md border border-neutral-300 p-3 focus:outline-none focus:ring-2 focus:ring-neutral-200"
					/>
					<p className="text-xs text-neutral-500">
						<strong className="text-red-500">This cannot be changed later.</strong> spaces (&apos;{" "}
						&apos;) not allowed. 3 - 21 characters. This is required.
					</p>
				</fieldset>

				<fieldset className="flex flex-col gap-2 text-sm">
					<label htmlFor="image" className="flex items-center gap-1 font-medium">
						Profile Picture
						<span className="text-xs text-neutral-500">(optional)</span>
					</label>
					<ImageInput
						name="image"
						id="image"
						className="rounded-md border border-neutral-300 p-2"
					/>
					<p className="text-xs text-neutral-500">
						Upload a profile image for your community. This is optional. You can always add a
						profile image later. Max size is 200KB. Only .jpg, .jpeg, .png and .webp formats are
						allowed
					</p>
				</fieldset>

				<fieldset className="flex flex-col gap-2 text-sm">
					<label htmlFor="description" className="flex items-center gap-1 font-medium">
						Description
						<span className="text-xs text-neutral-500">(optional)</span>
					</label>
					<textarea
						name="description"
						id="description"
						placeholder="e.g. Cats, dogs, and everything in between."
						maxLength={500}
						minLength={5}
						rows={5}
						className="rounded-md border border-neutral-300 p-3"
					/>
					<p className="text-xs text-neutral-500">
						Describe what your community is about in 5 - 500 characters. This is optional. You can
						always add a description later.
					</p>
				</fieldset>

				<fieldset className="flex flex-col gap-2 text-sm">
					<label htmlFor="banner" className="flex items-center gap-1 font-medium">
						Banner Image
						<span className="text-xs text-neutral-500">(optional)</span>
					</label>
					<ImageInput
						name="banner"
						id="banner"
						className="rounded-md border border-neutral-300 p-2"
					/>
					<p className="text-xs text-neutral-500">
						Upload a banner image for your community. This is optional. You can always add a banner
						image later. Max size is 2MB. Only .jpg, .jpeg, .png and .webp formats are allowed.
					</p>
				</fieldset>

				<SubmitButton />
			</form>
		</section>
	);
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="col-span-2 w-full" aria-disabled={pending} isLoading={pending}>
			Create Community
		</Button>
	);
}

export default Page;
