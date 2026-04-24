/** Join class names, skipping falsy values. */
export function styleHelper(
	...parts: Array<string | false | undefined | null | 0 | ''>
): string {
	return parts.filter(Boolean).join(' ');
}
