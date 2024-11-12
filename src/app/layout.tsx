'use client'

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import "./globals.css";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

const metadata: Metadata = {
	title: "Alchemy Game",
	description: "An alchemy-based puzzle game",
};

// Wrapper component to combine providers
function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			{children}
		</Provider>
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}