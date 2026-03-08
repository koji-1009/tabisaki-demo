/**
 * Wishlist service — localStorage persistence for demo.
 *
 * In a production app, this would be backed by a server API.
 * localStorage is the appropriate canonical source for a client-only demo.
 * CustomEvent notifies other DOM elements (e.g., header badge) of changes.
 */

import type { Wishlist } from "../types/index.ts";

const STORAGE_KEY = "tabisaki_wishlist";

function getDefault(): Wishlist {
	return { items: [], updatedAt: new Date().toISOString() };
}

function notify(count: number): void {
	window.dispatchEvent(
		new CustomEvent("wishlist-change", { detail: { count } }),
	);
}

export function getWishlist(): Wishlist {
	if (typeof window === "undefined") return getDefault();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : getDefault();
	} catch {
		return getDefault();
	}
}

export function addToWishlist(id: string): Wishlist {
	const wl = getWishlist();
	if (!wl.items.includes(id)) {
		wl.items.push(id);
		wl.updatedAt = new Date().toISOString();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(wl));
		notify(wl.items.length);
	}
	return wl;
}

export function removeFromWishlist(id: string): Wishlist {
	const wl = getWishlist();
	wl.items = wl.items.filter((item) => item !== id);
	wl.updatedAt = new Date().toISOString();
	localStorage.setItem(STORAGE_KEY, JSON.stringify(wl));
	notify(wl.items.length);
	return wl;
}

export function isInWishlist(id: string): boolean {
	return getWishlist().items.includes(id);
}
