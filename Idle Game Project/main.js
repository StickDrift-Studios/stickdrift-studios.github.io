// File: main.js
"use strict";

/* Simple incremental game: robust save/load, UI updates, and autosave.
   - Fixes typo in load(), mismatched element IDs, and UI placement.
   - Adds autosave, safe parsing, DOM-ready loader, and centralized UI updates.
*/

/* =========================
   Constants and Config
   ========================= */
const STORAGE_KEY = "save";       // localStorage key
const SAVE_VERSION = 2;           // current save schema version
const BASE_CART_COST = 10;        // base cost for first cart
const CART_GROWTH = 1.1;          // exponential cost growth factor
const TICK_MS = 1000;             // game tick interval (ms)
const AUTOSAVE_MS = 15000;        // autosave interval (ms)

/* =========================
   Game State (globals)
   ========================= */
let scrap = 0;
let magnetCart = 0;

/* =========================
   Utility Functions
   ========================= */

/**
 * Returns a clamped rounded integer for display.
 * Guards against NaN and negative values.
 */
function prettify(input) {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

/**
 * Computes the cost of the next cart based on current count.
 */
function getCartCost(count) {
  return Math.floor(BASE_CART_COST * Math.pow(CART_GROWTH, count));
}

/**
 * Updates all relevant UI elements in a consistent manner.
 * Uses textContent to avoid HTML injection and rendering quirks.
 */
function updateUI() {
  const scrapEl = document.getElementById("scrap");
  const cartEl = document.getElementById("magnetCart");
  const costEl = document.getElementById("cartCost");

  if (scrapEl) scrapEl.textContent = String(prettify(scrap));
  if (cartEl) cartEl.textContent = String(prettify(magnetCart));
  if (costEl) costEl.textContent = String(prettify(getCartCost(magnetCart)));
}

/* =========================
   Persistence
   ========================= */

/**
 * Saves the game state to localStorage.
 */
function save() {
  const data = { version: SAVE_VERSION, scrap, magnetCart };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {
    // Ignore quota or serialization errors
  }
}

/**
 * Loads the game state from localStorage, migrating old saves if needed.
 */
function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    // Access to localStorage may be blocked (privacy mode, etc.)
    return;
  }

  if (raw == null) {
    // Nothing to load
    updateUI(); // Ensure UI shows initial defaults
    return;
  }

  let savegame;
  try {
    savegame = JSON.parse(raw);
  } catch (_) {
    // Corrupted or invalid JSON; clear it to prevent repeated failures
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    updateUI();
    return;
  }

  // Migrate legacy saves with missing version (old schema)
  if (savegame.version === undefined) {
    // Map old field names to new ones with safe fallbacks
    savegame.scrap = Number(savegame.tests) || 0;
    savegame.magnetCart = Number(savegame.testers) || 0;

    // Bump version and persist migrated save
    savegame.version = SAVE_VERSION;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savegame)); } catch (_) {}
  }

  // Apply loaded values with sanitization
  scrap = Math.max(0, Math.floor(Number(savegame.scrap) || 0));
  magnetCart = Math.max(0, Math.floor(Number(savegame.magnetCart) || 0));

  // Reflect state to UI
  updateUI();
}

/**
 * Deletes the save and reloads the page.
 */
function deleteSave() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  location.reload();
}

/* =========================
   Game Actions
   ========================= */

/**
 * Adds scrap based on the provided number.
 */
function gatherScrap(number) {
  const inc = Number(number) || 0;
  scrap = Math.max(0, scrap + inc);
  updateUI();
}

/**
 * Attempts to purchase a cart if the player can afford it.
 */
function buyCart() {
  const cost = getCartCost(magnetCart);
  if (scrap >= cost) {
    magnetCart += 1;
    scrap -= cost;
    updateUI();
    save(); // Persist on meaningful state changes
  }
}

/* =========================
   Loops and Event Hooks
   ========================= */

// Game tick: generates scrap per second based on number of carts
const tickHandle = setInterval(function () {
  gatherScrap(magnetCart);
  // Do not save every tick to reduce writes; autosave handles persistence
}, TICK_MS);

// Autosave at an interval
const autosaveHandle = setInterval(function () {
  save();
}, AUTOSAVE_MS);

// Load when the DOM is ready so elements exist for UI updates
document.addEventListener("DOMContentLoaded", function () {
  load();
  updateUI(); // Ensure UI is initialized even if no save exists
});

// Save on page exit/navigation
window.addEventListener("beforeunload", function () {
  save();
});

// Expose functions for inline HTML event handlers
window.gatherScrap = gatherScrap;
window.buyCart = buyCart;
window.save = save;
window.deleteSave = deleteSave;