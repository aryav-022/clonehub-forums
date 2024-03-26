import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function timeFromNow(date: Date) {
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);

	if (years > 0) return `${years} ${years === 1 ? "year" : "years"} ago`;
	if (months > 0) return `${months} ${months === 1 ? "month" : "months"} ago`;
	if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ago`;
	if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	if (seconds > 30) return `a few seconds ago`;
	return "now";
}

export const ActionResponse = (status: number, message: string, data?: any) => ({
	status,
	message,
	data,
});
export type ActionResponse = ReturnType<typeof ActionResponse>;

export function Show({ children, If, Else }: { children: React.ReactNode; If?: Boolean; Else?: Boolean }) {
	if (If !== undefined) return If ? children : null;
	else if (Else !== undefined) return Else ? null : children;
	else return children;
}

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 250) {
	let timeout: NodeJS.Timeout;
	return function (this: any, ...args: Parameters<T>) {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn.apply(this, args), delay);
	};
}

export const isValidUrl = (urlString: string) => {
	var urlPattern = new RegExp(
		"^(https?:\\/\\/)?" + // validate protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // validate fragment locator
	return !!urlPattern.test(urlString);
};