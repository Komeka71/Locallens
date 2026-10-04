const SAVED_KEY = "locallens:saved";
const RECENT_KEY = "locallens:recent";

/* ---------- storage (always guarded; storage can be unavailable) ---------- */

function read(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const loadSaved = () => read(SAVED_KEY);
export const storeSaved = (items) => write(SAVED_KEY, items);

export const loadRecent = () => read(RECENT_KEY);

export function pushRecent(text) {
  const clean = text.trim();
  if (!clean) return loadRecent();
  const next = [clean, ...loadRecent().filter((t) => t !== clean)].slice(0, 4);
  write(RECENT_KEY, next);
  return next;
}

/* ---------- places ---------- */

export const placeKey = (place) =>
  `${place.name}|${place.address || ""}`.toLowerCase();

export const mapsUrl = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [place.name, place.address].filter(Boolean).join(" ")
  )}`;

export const prettyType = (type = "") =>
  type ? type.charAt(0).toUpperCase() + type.slice(1) : "Place";

/**
 * Picks the clip-art + colour tone for a place card.
 * Name keywords win, then the plan type (dinner / cafe / activity).
 */
export function artFor(place) {
  const name = (place.name || "").toLowerCase();
  const type = (place.type || "").toLowerCase();
  const has = (words) =>
    words.some((w) => new RegExp(`\\b${w}s?\\b`).test(name));

  if (has(["pizza", "pizzeria"])) return { art: "pizza", tone: "coral" };
  if (has(["burger"])) return { art: "burger", tone: "coral" };
  if (has(["ramen", "noodle", "wok", "thai", "chinese", "asian"]))
    return { art: "ramen", tone: "coral" };
  if (has(["ice cream", "gelato", "dessert", "creamery", "sweet"]))
    return { art: "icecream", tone: "amber" };
  if (has(["bowling"])) return { art: "bowling", tone: "cyan" };
  if (has(["cinema", "movie", "pvr", "inox", "theatre", "multiplex"]))
    return { art: "clapper", tone: "cyan" };
  if (has(["arcade", "gaming", "game", "escape", "play"]))
    return { art: "gamepad", tone: "cyan" };
  if (type.includes("cafe") || type.includes("coffee") || has(["cafe", "coffee", "chai", "tea", "bakery"]))
    return { art: "coffee", tone: "amber" };
  if (has(["bar", "lounge", "pub", "brewery", "cocktail", "sky"]))
    return { art: "cocktail", tone: "violet" };

  if (type.includes("activity")) return { art: "pin", tone: "cyan" };
  return { art: "cloche", tone: "coral" };
}

/* ---------- sharing ---------- */

export function planToText(result) {
  const items = result.recommended_plan?.length
    ? result.recommended_plan
    : result.plan || [];

  const lines = [
    `LocalLens plan${
      result.requirements?.location ? ` for ${result.requirements.location}` : ""
    }`,
    "",
    result.summary,
    "",
  ];

  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name} (${item.type})`);
    if (item.rating != null) lines.push(`   Rating: ${item.rating}`);
    if (item.estimated_cost) lines.push(`   Cost: ${item.estimated_cost}`);
    if (item.address) lines.push(`   ${item.address}`);
    lines.push(`   ${mapsUrl(item)}`);
    lines.push("");
  });

  if (result.total_estimated_cost) lines.push(`Budget: ${result.total_estimated_cost}`);
  return lines.join("\n").trim();
}
