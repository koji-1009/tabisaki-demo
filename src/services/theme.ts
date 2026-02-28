import {
	argbFromHex,
	Hct,
	hexFromArgb,
	SchemeMonochrome,
	SchemeNeutral,
	SchemeTonalSpot,
	SchemeVibrant,
} from "@material/material-color-utilities";
import type { ToneKey } from "../types/index.ts";

// Each tone maps to a proper MD3 DynamicScheme variant:
// - vibrant:    SchemeVibrant    — maxes out colorfulness
// - calm:       SchemeTonalSpot  — default Material You, balanced
// - monochrome: SchemeMonochrome — fully grayscale
// - pastel:     SchemeNeutral    — near grayscale, naturally soft/muted
const schemeForTone = {
	vibrant: SchemeVibrant,
	calm: SchemeTonalSpot,
	monochrome: SchemeMonochrome,
	pastel: SchemeNeutral,
} as const;

interface ColorRole {
	token: string;
	value: number;
}

function extractRoles(scheme: InstanceType<typeof SchemeVibrant>): ColorRole[] {
	return [
		{ token: "primary", value: scheme.primary },
		{ token: "on-primary", value: scheme.onPrimary },
		{ token: "primary-container", value: scheme.primaryContainer },
		{ token: "on-primary-container", value: scheme.onPrimaryContainer },
		{ token: "secondary", value: scheme.secondary },
		{ token: "on-secondary", value: scheme.onSecondary },
		{ token: "secondary-container", value: scheme.secondaryContainer },
		{
			token: "on-secondary-container",
			value: scheme.onSecondaryContainer,
		},
		{ token: "tertiary", value: scheme.tertiary },
		{ token: "on-tertiary", value: scheme.onTertiary },
		{ token: "tertiary-container", value: scheme.tertiaryContainer },
		{ token: "on-tertiary-container", value: scheme.onTertiaryContainer },
		{ token: "error", value: scheme.error },
		{ token: "on-error", value: scheme.onError },
		{ token: "error-container", value: scheme.errorContainer },
		{ token: "on-error-container", value: scheme.onErrorContainer },
		{ token: "background", value: scheme.background },
		{ token: "on-background", value: scheme.onBackground },
		{ token: "surface", value: scheme.surface },
		{ token: "on-surface", value: scheme.onSurface },
		{ token: "surface-variant", value: scheme.surfaceVariant },
		{ token: "on-surface-variant", value: scheme.onSurfaceVariant },
		{ token: "outline", value: scheme.outline },
		{ token: "outline-variant", value: scheme.outlineVariant },
		{ token: "inverse-surface", value: scheme.inverseSurface },
		{ token: "inverse-on-surface", value: scheme.inverseOnSurface },
		{ token: "inverse-primary", value: scheme.inversePrimary },
		{ token: "surface-dim", value: scheme.surfaceDim },
		{ token: "surface-bright", value: scheme.surfaceBright },
		{
			token: "surface-container-lowest",
			value: scheme.surfaceContainerLowest,
		},
		{ token: "surface-container-low", value: scheme.surfaceContainerLow },
		{ token: "surface-container", value: scheme.surfaceContainer },
		{
			token: "surface-container-high",
			value: scheme.surfaceContainerHigh,
		},
		{
			token: "surface-container-highest",
			value: scheme.surfaceContainerHighest,
		},
	];
}

export function generateThemeCSS(color: string, tone: ToneKey): string {
	const argb = argbFromHex(color);
	const hct = Hct.fromInt(argb);
	const SchemeClass = schemeForTone[tone];

	const light = new SchemeClass(hct, false, 0);
	const dark = new SchemeClass(hct, true, 0);

	const lightRoles = extractRoles(light);
	const darkRoles = extractRoles(dark);

	const lightVars = lightRoles
		.map((r) => `  --md-sys-color-${r.token}: ${hexFromArgb(r.value)};`)
		.join("\n");

	const darkVars = darkRoles
		.map((r) => `  --md-sys-color-${r.token}: ${hexFromArgb(r.value)};`)
		.join("\n");

	return `:root {\n${lightVars}\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkVars}\n  }\n}`;
}
