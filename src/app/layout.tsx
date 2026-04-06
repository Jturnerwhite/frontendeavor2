'use client'

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { AlchemicalElements, type AlchEleData } from "@/app/hex/architecture/data/elements";
import type { ALCH_ELEMENT } from "@/app/hex/architecture/enums";
import "./globals.css";

/** CSS custom properties `--alch-element-<slug>` from `AlchemicalElements` (slug = element type, lowercased). */
function alchElementColorCssVars(): React.CSSProperties {
	const entries = Object.entries(AlchemicalElements) as [ALCH_ELEMENT, AlchEleData][];
	return Object.fromEntries(
		entries.map(([_, data]) => [
			`--alch-element-${String(data.type).toLowerCase().replace(/\s+/g, "-")}`,
			data.colorHex,
		]),
	) as React.CSSProperties;
}

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
		<html lang="en" style={alchElementColorCssVars()}>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}