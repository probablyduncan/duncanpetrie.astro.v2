export const PHOTO_NAMES = ["cycling-gudmundsen-drive-door-county-2019-08-31", "north-atlantic-pennance-point-2021-01-14", "melted-moon-falmouth-bay-2021-10-15", "hell-awaits-falmouth-2021-10-30", "surrogate-sea-villajoyosa-2022-02-18", "parchment-paper-window-margate-2023-09-04", "forest-library-isle-of-wight-2024-04-26", "window-safari-primrose-hill-2024-05-13", "bear-witness-belsize-park-2024-05-17", "la-corbiere-st-brelade-jersey-2024-05-25", "shed-train-window-weymouth-2024-09-03"] as const;

export type PhotoName = typeof PHOTO_NAMES[number];

export const PHOTO_TAGS = ["story - island", "_new", "site-all", "site-best", "site-heartland", "_photos that shoud have names", "world", "door county", "wisconsin", "usa", "abstracts", "site-horizons", "abstracts all", "yearning", "bookmaybeidk", "falmouth", "cornwall", "uk", "lux", "311 final", "_lingermyth", "site-lingermyth", "311 all", "313 all", "alicante", "spain", "site-palimpsest", "margate", "kent", "england", "isle of wight", "primrose hill", "london", "jersey", "weymouth"] as const;

export type PhotoTag = typeof PHOTO_TAGS[number];