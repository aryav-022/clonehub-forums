"use client";

import { ActionResponse } from "@/lib/utils";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";
import ImageInput from "./ui/ImageInput";
import { useFormStatus } from "react-dom";

interface CommunityFormProps {
	type: "Create" | "Update";
	formAction: (formData: FormData) => Promise<ActionResponse>;
	defaultValues?: {
		communityName: string;
		description?: string;
		image?: string | null;
		banner?: string | null;
	};
}

export function CommunityForm({ type, formAction, defaultValues }: CommunityFormProps) {
	const router = useRouter();
	const toast = useToast();

	async function submitForm(formData: FormData) {
		const res = await formAction(formData);

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
					defaultValue={defaultValues?.communityName}
				/>
				<p className="text-xs text-neutral-500">
					<strong className="text-red-500">This cannot be changed later.</strong> spaces (&apos;{" "}
					&apos;) not allowed. 3 - 21 characters. This is required.
				</p>
			</fieldset>

			<fieldset className="flex items-center gap-4 text-sm">
				<div className="flex flex-col gap-2">
					<label htmlFor="image" className="flex items-center gap-1 font-medium">
						Profile Picture
						<span className="text-xs text-neutral-500">(optional)</span>
					</label>
					<ImageInput name="image" id="image" defaultImage={defaultValues?.image || undefined} />
				</div>
				<p className="text-xs text-neutral-500">
					Upload a profile image for your community. This is optional. You can always add a profile
					image later. Max size is 200KB. Only .jpg, .jpeg, .png and .webp formats are allowed
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
					defaultValue={defaultValues?.description}
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
					className="w-full max-w-full rounded-md sm:w-full"
					defaultImage={defaultValues?.banner || undefined}
				/>
				<p className="text-xs text-neutral-500">
					Upload a banner image for your community. This is optional. You can always add a banner
					image later. Max size is 2MB. Only .jpg, .jpeg, .png and .webp formats are allowed.
				</p>
			</fieldset>

			<SubmitButton type={type} />
		</form>
	);
}

function SubmitButton({ type }: { type: "Create" | "Update" }) {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="col-span-2 w-full" aria-disabled={pending} isLoading={pending}>
			{type} Community
		</Button>
	);
}
