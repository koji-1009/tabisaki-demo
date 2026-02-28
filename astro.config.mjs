import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	integrations: [react()],
	vite: {
		ssr: {
			noExternal: ["@material/material-color-utilities"],
		},
	},
});
