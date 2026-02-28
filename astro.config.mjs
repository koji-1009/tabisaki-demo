import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	integrations: [react()],
	vite: {
		ssr: {
			noExternal: ["@material/material-color-utilities"],
		},
	},
});
