/* =========================
    Constants and Configs
   ========================= */
/*----Save Data----*/
const storageKey = "save"; // localStorage key
const saveVersion = 5; // Current save schema version

/*----Base Costs and Cost Creep----*/

// Magnet Cart (requires scrap)
const cartBaseCost = 10;
const cartCostCreep = 1.1;

// Rust Collector (requires Magnet Carts)
const collectorBaseCost = 5;
const collectorCostCreep = 1.2;


/*----Generator Base Production----*/
const magnetCartProd = 1; // Magnet Cart Production/s
const rustCollectorProd = 5 ;// Rust Collector Production/s 

// Autosave interval (ms)
const saveRate = 15000;

// Game Ticks
const gameTick = 100;

/* =========================
    Game State (Globals)
   ========================= */
let scrap = 0;
let magnetCart = 0;
let rustCollector = 0;

//Items Viewed State
let magnetCartViewed = false;
let rustCollectorViewed = false;

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

/*----Generators Cost Increases----*/

// Magnet Cart Cost Creep
function getCartCost(count){
	return Math.floor(cartBaseCost * Math.pow(cartCostCreep, count));
}

// Rust Collector Cost Creep
function getCollectorCost(count){
	return Math.floor(collectorBaseCost * Math.pow(collectorCostCreep, count));
}


/*----Generation Per Second----*/

// Get Scrap/s
function totalSps(){
	return cartSps(magnetCart) + collectorSps(rustCollector);
}

// Get Cart Scrap/s
function cartSps(count){
	return count * magnetCartProd;
}

// Get Collector Scrap/s
function collectorSps(count){
	return count * rustCollectorProd;
}

// UI Updater
function updateUI(){
	// Values
	const scrapUI = document.getElementById("scrap"); // Scraps
	const cartUI = document.getElementById("cartAmount"); //Cart Amount
	const cartCostUI = document.getElementById("cartCost"); //Cart Cost
	const collectorUI = document.getElementById("collectorAmount"); //Collector Amount
	const collectorCostUI = document.getElementById("collectorCost"); //Collector Cost
	
	// Per second labels
	const scrapPSUI = document.getElementById("scrap/s");
	const magnetSpsUI = document.getElementById("cartGen/s");
	const collectorSpsUI = document.getElementById("collectorGen/s");
	
	/*----Actual Coding----*/
	//Currencies Amount
	
	if (scrapUI) scrapUI.textContent = String(prettify(scrap)); //Update Scrap Amount
	if (cartUI) cartUI.textContent = String(prettify(magnetCart)); //Update Cart Amount
	if (collectorUI) collectorUI.textContent = String(prettify(rustCollector)); //Rust Collector Amount
	
	//Generators Cost
	if (cartCostUI) cartCostUI.textContent = String(prettify(getCartCost(magnetCart))); //Update Cart Cost
	if (collectorCostUI) collectorCostUI.textContent = String(prettify(getCollectorCost(rustCollector)));
	
	// Update per second displays
	if (scrapPSUI) scrapPSUI.textContent = String(prettify(totalSps())); //Total scrap/s
	if (magnetSpsUI) magnetSpsUI.textContent = String(prettify(cartSps(magnetCart))); //Magnet Cart scrap/s
	if (collectorSpsUI) collectorSpsUI.textContent = String(prettify(collectorSps(rustCollector)));
	
	
	/*----Disable Button when unaffordable----*/
	//Magnet Cart
	const cartBtn = document.getElementById("cartCreator");
	if (cartBtn) {
		cartBtn.disabled = scrap < getCartCost(magnetCart);
		cartBtn.title = cartBtn.disabled
			? `Requires ${getCartCost(magnetCart)} scrap`
			: "Create Magnet Cart";
	}
	
	//Rust Collector
	const collectorBtn = document.getElementById("collectorCreator");
	if (collectorBtn) {
		collectorBtn.disabled = magnetCart < getCollectorCost(rustCollector);
		collectorBtn.title = collectorBtn.disabled
			? `Requires ${getCollectorCost(rustCollector)} Magnet Carts`
			: "Create Rust Collector";
	}
}

/* =========================
   Persistence
   ========================= */
   
// Saves the game to localStorage
function save(){
	const data = {
		version: saveVersion,
		scrap: scrap,
		magnetCart: magnetCart,
		rustCollector: rustCollector
	};
	try {
		localStorage.setItem(storageKey, JSON.stringify(data));
	} catch (_) {
		// Ignore quota or serialization errors
	}
}

// Loads the game from localStorage migrating if needed
function load() {
	let raw = null;
	try {
		raw = localStorage.getItem(storageKey);
	} catch (_) {
		updateUI();
		return;
	}
	
	if (raw == null){
		updateUI();
		return;
	}
	
	let savegame;
	try {
		savegame = JSON.parse(raw);
	} catch (_) {
		try { localStorage.removeItem(storageKey); } catch (_) {}
		updateUI();
		return;
	}
	
	// Save Migration (legacy -> version 2)
	if (savegame.version === undefined) {
		savegame.scrap = Number(savegame.tests) || 0;
		savegame.magnetCart = Number(savegame.testers) || 0;
		savegame.version = 2;
	}
	
	// Save Migration (version 2 -> 3)
	if (savegame.version < 3) {
		savegame.rustCollector = Number(savegame.rustCollector) || 0;
		savegame.version = 3;
	}
	
	// Save Migration (version 3 -> 5)
	if (savegame.version < 5) {
		savegame.version = 5;
	}
	
	// Finalize Migration to current version
	if (savegame.version === saveVersion) {
		try { localStorage.setItem(storageKey, JSON.stringify(savegame));} catch (_) {}
	}
	
	// Apply loaded values (sanitized)
	scrap = Math.max(0, Math.floor(Number(savegame.scrap) || 0 ));
	magnetCart = Math.max(0, Math.floor(Number(savegame.magnetCart) || 0 ));
	rustCollector = Math.max(0, Math.floor(Number(savegame.rustCollector) || 0 ));
	
	updateUI();
	}
	
// Delete save and reload page
function deleteSave() {
	try { localStorage.removeItem(storageKey); } catch (_) {}
	location.reload();
}


/* =========================
   Game Actions
   ========================= */

// Add Scrap Based on source
function gatherScrap(amount) {
	const inc = Number(amount) || 0;
	scrap = Math.max(0, scrap + inc);
	updateUI();
}

//Create Magnet Cart Based on Source
function createCart(amount) {
	const inc = Number(amount) || 0;
	magnetCart = Math.max(0, magnetCart + inc);
	updateUI();
}

//Buy Magnet Cart
function buyCart() {
	const cost = getCartCost(magnetCart);
	if (scrap >= cost) {
		scrap -= cost;
		createCart(1);
	}
}

//Create Rust Collector Based on Source
function createCollector(amount) {
	const inc = Number(amount) || 0;
	rustCollector = Math.max(0, rustCollector + inc);
	updateUI();
}

//Buy Rust Collector
function buyCollector() {
	const cost = getCollectorCost(rustCollector);
	if (magnetCart >= cost) {
		magnetCart -= cost;
		createCollector(1);
	}
}

/* =========================
   Loops and Event Hooks
   ========================= */

// Game Tick Calculations
const tickHandle = setInterval(function () {
	
	// Convert Tick Length from ms to s
	const deltaTime = gameTick / 1000;
	
	//Get Generation per Second
	const magnetCartGen = cartSps(magnetCart);
	const rustCollectorGen = collectorSps(rustCollector);
	
	//Get Generation This Tick
	const totalGen = 
		(magnetCartGen + rustCollectorGen) * deltaTime;
	
	//Generate Stuff
	if (totalGen > 0) {
		gatherScrap(totalGen);
	}
	
	/*----Reveal Sections----*/
	
	//Reveal Magnet Carts
	if (scrap >= cartBaseCost || magnetCart >= 1 || rustCollector >= 1) {
		magnetCartsSection.classList.remove("hidden");
	}
	
	if (magnetCart >= collectorBaseCost || rustCollector >= 1) {
		rustCollectorSection.classList.remove("hidden");
	}
}, gameTick);

//Autosave at interval
const autosaveHandle = setInterval(function() {
	save();
}, saveRate);

//Autoload when loading page
document.addEventListener("DOMContentLoaded", function () {
	load();
	updateUI;
});