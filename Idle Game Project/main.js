var Tests = 0;

function testClick(number){ //Increments Test amount
	Tests = Tests + number;
	document.getElementById("tests").innerHTML = Tests; //shows tests amount
};

var Testers = 0;

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