var playerTable = "";  //$("#player-table")[0];
var benchTable = "";

function addToTable(tableChoice, playerName, playerWins, playerLosses) {
    if (playerName.length > 0) {
        var newRow;

        if (tableChoice == "player-table") {
            addQueueRow(playerName, playerWins, playerLosses);
        } else if (tableChoice == "bench-table") {
            addBenchRow(playerName, playerWins, playerLosses);
        }
    }

    updatePage();
}

function addQueueRow(playerName, playerWins, playerLosses) {
    var newRow = playerTable.insertRow(playerTable.rows.length);
    newRow.id = playerName;

    var moveCell = newRow.insertCell(0);
    moveCell.innerHTML = "<input type='button' class='btn btn-primary' value='Bench' onclick='moveRow(this.parentElement.parentElement, &apos;player-table&apos;, &apos;bench-table&apos;)' />";
    moveCell.id = "name-" + playerName;

    var nameCell = newRow.insertCell(1);
    nameCell.innerHTML = playerName;
    nameCell.id = "name-" + playerName;

    var winsCell = newRow.insertCell(2);
    winsCell.innerHTML = "<input type='number' id='wins-" + playerName + "-number' class='form-control' value='" + playerWins + "' style='width:100px;' />";
    winsCell.id = "wins-" + playerName;

    var lossesCell = newRow.insertCell(3);
    lossesCell.innerHTML = "<input type='number' id='losses-" + playerName + "-number' class='form-control' value='" + playerLosses + "' style='width:100px;' />";
    lossesCell.id = "losses-" + playerName;

    var streakCell = newRow.insertCell(4);
    streakCell.innerHTML = "<input type='number' id='streak-" + playerName + "-number' class='form-control' value='0' style='width:100px;' />";
    streakCell.id = "streak-" + playerName;
}

function addBenchRow(playerName, playerWins, playerLosses) {
    var newRow = benchTable.insertRow(benchTable.rows.length);
    newRow.id = playerName;

    var moveCell = newRow.insertCell(0);
    moveCell.innerHTML = "<input type='button' class='btn btn-primary' value='Queue up!' onclick='moveRow(this.parentElement.parentElement, &apos;bench-table&apos;, &apos;player-table&apos;)' />";
    moveCell.id = "name-" + playerName;

    var nameCell = newRow.insertCell(1);
    nameCell.innerHTML = playerName;
    nameCell.id = "name-" + playerName;

    var winsCell = newRow.insertCell(2);
    winsCell.innerHTML = "<p id='wins-" + playerName + "-number'>" + playerWins + "</p>";
    winsCell.id = "wins-" + playerName;

    var lossesCell = newRow.insertCell(3);
    lossesCell.innerHTML = "<p id='losses-" + playerName + "-number'>" + playerLosses + "</p>";
    lossesCell.id = "losses-" + playerName;

    var removeCell = newRow.insertCell(4);
    removeCell.innerHTML = "<input type='button' id='remove-" + playerName + "-button' class='btn btn-danger' onclick='removeRow(this.parentElement.parentElement, &apos;bench-table&apos;)' value='Remove' />";
    removeCell.id = "remove-" + playerName;
}

function removeRow(rowToDelete, tableChoice) {
    var tableToDeleteFrom;

    if (tableChoice == "player-table") {
        tableToDeleteFrom = playerTable;
    } else if (tableChoice == "bench-table") {
        tableToDeleteFrom = benchTable;
    }

    tableToDeleteFrom.deleteRow(rowToDelete.rowIndex - 1);

    updatePage();
}

function updatePage() {
	var playersInMatch = $("#players-in-match")[0].value;

	var currentPlayers = $("#current-players")[0];
	var skipPlayers = $("#skip-players")[0];

	currentPlayers.innerHTML = "<div class='alert alert-danger' style='padding-bottom:'>Not enough players in queue</div>";
	skipPlayers.innerHTML = "";

    if (playerTable.rows.length >= playersInMatch) {
		currentPlayers.innerHTML = "";
		skipPlayers.innerHTML = "";

		for(var i=0; i<playersInMatch; i++) {
			if(i != 0) {
				currentPlayers.innerHTML = currentPlayers.innerHTML
										 + "<span> vs. </span>";
			}

			currentPlayers.innerHTML = currentPlayers.innerHTML
									 + "<a onclick='chooseWinner(this)' id='" + i + "' class='btn btn-primary btn-lg'>" + playerTable.rows[i].id + "</a>";

			skipPlayers.innerHTML = skipPlayers.innerHTML
								  + "<a onclick='moveRow(playerTable.rows[this.id], &apos;player-table&apos;, &apos;player-table&apos;);' id='" + i + "' class='btn btn-danger btn-xs'>Skip "
								  + playerTable.rows[i].id + "</a>"
								  + "<span> </span>";
		}
    }

    $('#player')[0].value = "";
}

function chooseWinner(winner) {
    var playersInMatch = $("#players-in-match")[0].value;
    var winnerRow;
    var loserRows = [];

    for (var i = 0; i < playersInMatch; i++) {
        var currentRow = playerTable.rows[i];
        if(currentRow.rowIndex-1 == winner.id) {
            winnerRow = currentRow;
        } else {
            loserRows.push(currentRow);
        }
    }

    var winsCell = winnerRow.children[2].children[0];
    winsCell.value = +winsCell.value + 1;

    var streakCell = winnerRow.children[4].children[0];
    streakCell.value = +streakCell.value + 1;

    for (var i = 0; i < loserRows.length; i++) {
        var lossesCell = loserRows[i].children[3].children[0];
        lossesCell.value = +lossesCell.value + 1;

        moveRow(loserRows[i], "player-table", "player-table");
    }

	if (streakCell.value >= 3) {
        moveRow(winnerRow, "player-table", "player-table");
    }
}

function moveRow(row, startingTable, endingTable) {
    var playerName = (startingTable == "player-table") ? row.children[1].innerHTML : row.children[1].innerHTML;
    var playerWins = (startingTable == "player-table") ? row.children[2].children[0].value : row.children[2].children[0].innerHTML;
    var playerLosses = (startingTable == "player-table") ? row.children[3].children[0].value : row.children[3].children[0].innerHTML;

	removeRow(row, startingTable);
	addToTable(endingTable, playerName, playerWins, playerLosses);
}

function exportStats() {
	var dumpField = $("#data-dump")[0];

	var dataDump = "Player,Wins,Losses";

	for (var i = 0; i < benchTable.rows.length; i++) {
	    var row = benchTable.rows[i];

		var playerName = row.children[1].innerHTML;
		var playerWins = row.children[2].children[0].innerHTML;
		var playerLosses = row.children[3].children[0].innerHTML;

		dataDump = dataDump + "\n" + playerName + "," + playerWins + "," + playerLosses;
	}
	dumpField.value = dataDump;
}

function importStats(tableChoice) {
    if (benchTable.rows.length > 1) {
		var numberToDelete = benchTable.rows.length;
		for(var i=0; i<numberToDelete; i++) {
		    removeRow(benchTable.rows[0], tableChoice);
		}
	}

	var dumpField = $("#data-dump")[0];
	var regex = /[\n,]+/;	//new line or comma
	var dataDump = dumpField.value.split(regex);

	var columnCount = 3;

	var dumpLength = (dataDump.length-(columnCount))/columnCount;

	for(var i=1; i<dumpLength+1; i++) {
		var index = (i*columnCount);    //ignores header row
		addToTable(tableChoice, dataDump[index], dataDump[index + 1], dataDump[index + 2]);
	}
}

function bench(event) {
	if (event.keyCode == 13) {
        $("#bench").click();
    }
}
