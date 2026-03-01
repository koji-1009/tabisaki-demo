export const MOOD_IDS = [
	"romantic",
	"adventure",
	"relaxing",
	"family",
	"cultural",
	"nature",
	"gourmet",
	"active",
] as const;

export type MoodId = (typeof MOOD_IDS)[number];

export const SEASON_IDS = ["spring", "summer", "autumn", "winter"] as const;

export type SeasonId = (typeof SEASON_IDS)[number];

export interface Dish {
	name: string;
	description: string;
}

export interface Spot {
	name: string;
	description: string;
}

export interface SeasonRecommendation {
	season: SeasonId;
	reason: string;
}

export interface Prefecture {
	id: string;
	name: string;
	nameEn: string;
	region: Region;
	description: string;
	highlights: string[];
	activities: ActivityId[];
	imageUrl: string;
	dishes: Dish[];
	spots: Spot[];
	bestSeasons: SeasonRecommendation[];
	access: string;
	mood: MoodId[];
}

export const REGION_IDS = [
	"hokkaido",
	"tohoku",
	"kanto",
	"chubu",
	"kinki",
	"chugoku",
	"shikoku",
	"kyushu",
] as const;

export type Region = (typeof REGION_IDS)[number];

export const ACTIVITY_IDS = [
	"ocean",
	"mountains",
	"food",
	"temples",
	"onsen",
	"urban",
] as const;

export type ActivityId = (typeof ACTIVITY_IDS)[number];

export interface Activity {
	id: ActivityId;
	label: string;
	icon: string;
}

export interface UserPreferences {
	color: string;
	tone: ToneKey;
	onboarded: boolean;
}

export type ToneKey = "vibrant" | "calm" | "monochrome" | "pastel";

export interface Wishlist {
	items: string[];
	updatedAt: string;
}
