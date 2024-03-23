"use server";

import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface FileUploadResponse {
	public_id: string;
	version: number;
	signature: string;
	width: number;
	height: number;
	format: string;
	resource_type: string;
	created_at: string;
	bytes: number;
	type: string;
	url: string;
	secure_url: string;
}

interface FunctionResponse {
	status: number;
	url?: string;
	message?: string;
}

export async function uploadFile(formData: FormData): Promise<FunctionResponse> {
	const file = formData.get("file") as File;

	const arrayBuffer = await file.arrayBuffer();
	const buffer = new Uint8Array(arrayBuffer);

	try {
		const res: FileUploadResponse = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({}, (error, result: any) => {
					if (error) {
						reject(error);
						return;
					}
					resolve(result);
				})
				.end(buffer);
		});

		return {
			status: 1,
			url: res?.secure_url,
		};
	} catch (err: any) {
		console.log(err);

		return {
			status: 0,
			message: err?.message,
		};
	}
}
