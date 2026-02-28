import { generateThemeCSS } from "../services/theme.ts";
import type { ToneKey } from "../types/index.ts";

export function applyTheme(color: string, tone: ToneKey): void {
	const css = generateThemeCSS(color, tone);
	let el = document.getElementById("dynamic-theme");
	if (!el) {
		el = document.createElement("style");
		el.id = "dynamic-theme";
		document.head.appendChild(el);
	}
	el.textContent = css;
}
