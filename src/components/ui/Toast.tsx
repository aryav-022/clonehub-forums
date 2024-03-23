"use client";

import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import { createContext, use, useEffect, useRef, useState } from "react";

const toastVariants = cva(
	"group z-40 flex w-full items-start justify-between gap-4 rounded-md border p-4 shadow transition-all duration-500 sm:w-96",
	{
		variants: {
			variant: {
				default: "border-gray-200 bg-white text-black",
				success: "border-green-500 bg-green-500 text-white",
				error: "border-red-500 bg-red-500 text-white",
				warning: "border-yellow-500 bg-yellow-500 text-white",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

interface ToastProps extends VariantProps<typeof toastVariants> {
	title: string;
	message: string;
}

const ToastContext = createContext((toast: ToastProps) => {});

export function useToast() {
	return use(ToastContext);
}

export function Toaster({ children }: { children: React.ReactNode }) {
	const toastContainer = useRef<HTMLDivElement | null>(null);
	const [toasts, setToasts] = useState<ToastProps[]>([]);

	function toast({ title, message, variant }: ToastProps) {
		setToasts((prev) => [...prev, { title, message, variant }]);
	}

	return (
		<ToastContext.Provider value={toast}>
			{children}
			<div
				ref={toastContainer}
				className="fixed bottom-4 right-4 flex flex-col gap-2 transition-all"
			>
				{toasts.map((toast, index) => (
					<ToastCard key={index} toast={toast} />
				))}
			</div>
		</ToastContext.Provider>
	);
}

function ToastCard({ toast }: { toast: ToastProps }) {
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isClosed, setIsClosed] = useState(false);

	const toastRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setTimeout(() => setIsVisible(true), 100);
		setTimeout(() => closeToast(), 10000);
	}, []);

	function closeToast() {
		setIsClosing(true);

		function close() {
			setIsClosed(true);
			toastRef.current?.removeEventListener("transitionend", close);
		}

		toastRef.current?.addEventListener("transitionend", close);
	}

	function detectMovement(e: any) {
		const { clientX: startX } = e;

		function handleMove(e: any) {
			const { clientX: endX } = e;

			if (!toastRef.current || endX < startX) return;

			toastRef.current.style.transform = `translateX(${endX - startX}px)`;
		}

		function handleUp(e: any) {
			if (e.clientX > startX) closeToast();
			else toastRef.current?.style.removeProperty("transform");

			toastRef.current?.removeEventListener("pointermove", handleMove);
			toastRef.current?.removeEventListener("pointerup", handleUp);
		}

		toastRef.current?.addEventListener("pointermove", handleMove);
		toastRef.current?.addEventListener("pointerup", handleUp);
	}

	return (
		<div
			ref={toastRef}
			className={cn(toastVariants({ variant: toast.variant }), {
				"translate-y-full opacity-0": !isVisible,
				"translate-x-full opacity-0": isClosing,
				hidden: isClosed,
			})}
			// onPointerDown={detectMovement}
		>
			<div>
				<h1 className="font-medium">{toast.title}</h1>
				<p className="text-sm">{toast.message}</p>
			</div>
			<button className="invisible group-hover:visible" onClick={closeToast}>
				<X size={14} />
			</button>
		</div>
	);
}
