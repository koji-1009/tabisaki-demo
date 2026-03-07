import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { TONE_KEYS } from "../types/index.ts";
import { COOKIE_NAME } from "../utils/cookies.ts";

export const server = {
	preferences: {
		save: defineAction({
			input: z.object({
				color: z.string(),
				tone: z.enum(TONE_KEYS),
				onboarded: z.boolean(),
			}),
			handler: async (input, context) => {
				context.cookies.set(COOKIE_NAME, JSON.stringify(input), {
					path: "/",
					httpOnly: true,
					sameSite: "lax",
					maxAge: 60 * 60 * 24 * 365,
				});
				return { ok: true };
			},
		}),
		delete: defineAction({
			handler: async (_input, context) => {
				context.cookies.delete(COOKIE_NAME, { path: "/" });
				return { ok: true };
			},
		}),
	},
};
