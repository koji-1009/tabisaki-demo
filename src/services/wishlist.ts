import type { Wishlist } from "../types/index.ts";

const STORAGE_KEY = "tabisaki_wishlist";

function getDefault(): Wishlist {
	return { items: [], updatedAt: new Date().toISOString() };
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
	}
	return wl;
}

export function removeFromWishlist(id: string): Wishlist {
	const wl = getWishlist();
	wl.items = wl.items.filter((item) => item !== id);
	wl.updatedAt = new Date().toISOString();
	localStorage.setItem(STORAGE_KEY, JSON.stringify(wl));
	return wl;
}

export function isInWishlist(id: string): boolean {
	return getWishlist().items.includes(id);
}
