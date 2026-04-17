/**
 * URL for a file served from `public/`. When the app is built with a Next.js `basePath`
 * (e.g. GitHub Pages at /repo-name/), prefix with `NEXT_PUBLIC_BASE_PATH` so assets load correctly.
 */
export function publicAsset(absolutePathFromPublicRoot: string): string {
	const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
	const path = absolutePathFromPublicRoot.startsWith("/")
		? absolutePathFromPublicRoot
		: `/${absolutePathFromPublicRoot}`;
	return base ? `${base}${path}` : path;
}
