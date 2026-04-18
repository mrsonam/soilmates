/**
 * Curated Unsplash CDN URLs for the demo showcase collection.
 * Use `fm`, `q`, `w`, and `ixlib` so Next/Image and browsers load reliably.
 * (Bare `images.unsplash.com/photo-…?w=800` links often fail or rate-limit.)
 */

const UNSPLASH_Q =
  "fm=jpg&q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0" as const;

function u(photoId: string) {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_Q}`;
}

/** Collection hero — grouped indoor jungle feel */
export const SHOWCASE_COLLECTION_COVER_URL = u(
  "photo-1501004318641-b39e6451bec6",
);

/** Area slugs from seed → cover imagery */
export const SHOWCASE_AREA_COVER_URLS: Record<string, string> = {
  sunroom: u("photo-1766736702134-8bf26e5c216a"),
  "living-room": u("photo-1668584054133-22dd634e9622"),
  bedroom: u("photo-1675676432277-870765bc03e0"),
  kitchen: u("photo-1611866734967-a59d38e03766"),
  bathroom: u("photo-1717497043540-d45bf85e5d38"),
};

/** Plant slugs from seed → species-appropriate photos */
export const SHOWCASE_PLANT_PRIMARY_URLS: Record<string, string> = {
  "monstera-delilah": u("photo-1757262087277-ca96934bdedc"),
  "fiddle-fig-sonny": u("photo-1545239705-1564e58b9e4a"),
  "pothos-willow": u("photo-1596724878582-76f1a8fdc24f"),
  "peace-lily-eva": u("photo-1593691509543-c55fb32d8de5"),
  "snake-steve": u("photo-1599719840163-1cd5b7c1fabe"),
  "zz-zara": u("photo-1632207691143-643e2a9a9361"),
  "calathea-luna": u("photo-1714507767656-2fb307e1b03d"),
  "basil-buddy": u("photo-1614749133956-845b63976d41"),
  "mint-mia": u("photo-1632431455870-65dd9cf75e0e"),
  "rosemary-rue": u("photo-1630081015294-05e6a3044eeb"),
  "fern-felix": u("photo-1611439302691-3a5d0a664ea6"),
  "pilea-pepper": u("photo-1601404294583-bb2f4510c357"),
  "alocasia-aria": u("photo-1648135637200-b22ccf545ad3"),
  "philodendron-brazil": u("photo-1614346775943-4bf1cc2decfa"),
  "rubber-otto": u("photo-1620735691820-1f4958c24b8d"),
  "bird-of-paradise-kai": u("photo-1677022584598-18f0e1d1c312"),
  "spider-spencer": u("photo-1572688484438-313a6e50c333"),
  "maranta-milo": u("photo-1596476314324-0b00820fd096"),
  "begonia-blu": u("photo-1630419544962-97655e1e88c9"),
  "croton-cedar": u("photo-1748344640456-e1d2e21a4169"),
  "orchid-olive": u("photo-1623061275416-24596e40449f"),
  "succulent-tray-sunny": u("photo-1614594895304-fe7116ac3b58"),
  "tradescantia-tara": u("photo-1668732136843-ce212fab72f4"),
  "english-ivy-ingrid": u("photo-1542347369-6fb75718485c"),
  "dracaena-dex": u("photo-1622673037877-18ee56d1f990"),
  "haworthia-honey": u("photo-1509223197845-458d87318791"),
  "tillandsia-sky": u("photo-1548663176-a551733d8262"),
  "cherry-tomato-tempo": u("photo-1723234387588-756c4d1e3e1a"),
  "aralia-arlo": u("photo-1571684137408-c9f1dea76e62"),
};
