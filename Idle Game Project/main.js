var scrap = 0;
var magnetCart = 0;

// Save Section
function save(){ // save the game
	var save = {
		scrap: scrap,
		magnetCart: magnetCart
	};

	localStorage.setItem("save", JSON.stringify(save));
}
function load(){ // load the game
	var savegame = JSON.parse(localStorage.getItem("save"));

	if(savegame !== null){
		if(typeof savegame.scrap !== "undefined"){
			scrap = savegame.scrap;
		}

		if(typeof savegame.magnetCart !== "undefined"){
			magnetCart = savegame.magnetCart;
		}
	}

	// Update UI after loading
	document.getElementById("scrap").innerHTML = prettify(scrap);
	document.getElementById("magnetCart").innerHTML = magnetCart;

	var nextTesterCost = Math.floor(10 * Math.pow(1.1, magnetCart));
	document.getElementById("magnetCartCost").innerHTML = nextTesterCost;
}
function deleteSave(){ // Deletes the Save File
	localStorage.removeItem("save");
	location.reload();
}


function gatherScrap(number){ //Increments Test amount
	scrap = scrap + number;
	document.getElementById("scrap").innerHTML = prettify(scrap);//shows scrap amount
};

function buyCart(){
	var cartCost = Math.floor(10 * Math.pow(1.1,magnetCart)); //Checks the price of this cart
	if(scrap >= cartCost){ //Checks if player can afford the cart
		magnetCart = magnetCart + 1; //increases the amount of magnetCart
		scrap = scrap - cartCost; //removes scrap spent on cart
		document.getElementById("magnetCart").innerHTML = prettify(magnetCart); //updates amount of magnetCart on UI
		document.getElementById("scrap").innerHTML = prettify(scrap);           //updates amount of scrap on UI
	};
	var nextCartCost = Math.floor(10 * Math.pow(1.1,magnetCart));            //checks cost for next cart
	document.getElementById("cartCost").innerHTML = prettify(nextCartCost);//shows the cost of next cart on UI
};

window.setInterval(function(){ //repeats everything every 1s

	gatherScrap(magnetCart);
	
}, 1000); //1000 = 1000 ms = 1s

function prettify(input){
	var output = Math.round(input);
	return output;
};


