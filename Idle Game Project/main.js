var Tests = 0;
var Testers = 0;

function save(){ //save the game
	var save = {
		tests: Tests,
		testers: Testers
	};
	localStorage.setItem("save", save);
};
function load(){ //load the game
	let savegame = localStorage.getItem("save");
	if(typeof savegame.tests !== "undefined") Tests = savegame.tests; //load Tests
	if(typeof savegame.testers !== "undefined") Testers = savegame.testers;   //load Testers
};
function deleteSave(){ //Deletes the Save File
	localStorage.removeItem("save");
};

function testClick(number){ //Increments Test amount
	Tests = Tests + number;
	document.getElementById("tests").innerHTML = prettify(Tests);//shows tests amount
};

function buyTester(){
	var testerCost = Math.floor(10 * Math.pow(1.1,Testers)); //Checks the price of this tester
	if(Tests >= testerCost){ //Checks if player can afford the tester
		Testers = Testers + 1; //increases the amount of Testers
		Tests = Tests - testerCost; //removes tests spent on tester
		document.getElementById("Testers").innerHTML = Testers;            //updates amount of testers on UI
		document.getElementById("tests").innerHTML = Tests;                //updates amount of tests on UI
	};
	var nextTesterCost = Math.floor(10 * Math.pow(1.1,Testers));            //checks cost f next tester
	document.getElementById("TestersCost").innerHTML = nextTesterCost;       //shows the cost of next tester on UI
};

window.setInterval(function(){ //repeats everything every 1s

	testClick(Testers);
	
}, 1000); //1000 = 1000 ms = 1s

function prettify(input){
	var output = Math.round(input);
	return output;
};

window.setInterval(function(){ //save every 5min
	save();
}, 5000); // 300000 = 300s