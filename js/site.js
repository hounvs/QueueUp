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
    moveCell.innerHTML = "<input type='button' class='btn btn-info btn-sm' value='Bench' onclick='moveRow(this.parentElement.parentElement, &apos;player-table&apos;, &apos;bench-table&apos;)' />";
    
    var nameCell = newRow.insertCell(1);
    nameCell.innerHTML = playerName;
    nameCell.id = "name-" + playerName;

    var winsCell = newRow.insertCell(2);
    winsCell.innerHTML = "<input type='number' id='wins' class='form-control' value='" + playerWins + "' />";

    var lossesCell = newRow.insertCell(3);
    lossesCell.innerHTML = "<input type='number' id='losses' class='form-control' value='" + playerLosses + "' />";

    var streakCell = newRow.insertCell(4);
    streakCell.innerHTML = "<input type='number' id='streak' class='form-control' value='0' />";
}

function addBenchRow(playerName, playerWins, playerLosses) {
    var newRow = benchTable.insertRow(benchTable.rows.length);
    newRow.id = playerName;

    var moveCell = newRow.insertCell(0);
    moveCell.innerHTML = "<input type='button' class='btn btn-info btn-sm' value='Queue up!' onclick='moveRow(this.parentElement.parentElement, &apos;bench-table&apos;, &apos;player-table&apos;)' />";

    var nameCell = newRow.insertCell(1);
    nameCell.innerHTML = playerName;
    nameCell.id = "name-" + playerName;

    var winsCell = newRow.insertCell(2);
    winsCell.innerHTML = "<p id='wins'>" + playerWins + "</p>";

    var lossesCell = newRow.insertCell(3);
    lossesCell.innerHTML = "<p id='losses'>" + playerLosses + "</p>";

    var removeCell = newRow.insertCell(4);
    removeCell.innerHTML = "<input type='button' id='remove-" + playerName + "-button' class='btn btn-danger btn-sm' onclick='removeRow(this.parentElement.parentElement, &apos;bench-table&apos;)' value='Remove' />";
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
	var playersInMatch = $("#players-in-match").val();

	var currentPlayers = $("#current-players")[0];
	var skipPlayers = $("#skip-players")[0];


    if (playerTable.rows.length >= playersInMatch) {
		currentPlayers.innerHTML = "";
		skipPlayers.innerHTML = "";

		for(var i=0; i<playersInMatch; i++) {

			currentPlayers.innerHTML = currentPlayers.innerHTML
									 + "<a onclick='chooseWinner(this)' id='" + i + "' class='btn btn-info btn-lg'>" + playerTable.rows[i].id + "</a>";

			skipPlayers.innerHTML = skipPlayers.innerHTML
                                  + "<a onclick='moveRow(playerTable.rows[this.id], &apos;player-table&apos;, &apos;player-table&apos;);' id='" + i + "' class='btn btn-danger btn-sm'>Skip "
								  + playerTable.rows[i].id + "</a>";
		}
    } else{
        currentPlayers.innerHTML = "<div class='alert alert-danger' style='text-align:center;'>Not enough players in queue</div>";
        skipPlayers.innerHTML = "";
    }

    $('#player').val('');
}

function chooseWinner(winner) {
    var playersInMatch = $("#players-in-match").val();
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
    
    updateRecord(winnerRow, true);

    for (var i = 0; i < loserRows.length; i++) {
        updateRecord(loserRows[i], false);
        moveRow(loserRows[i], "player-table", "player-table");
    }

	if (parseInt($(winnerRow).find("#streak").val(), 10) >= parseInt($('#maxStreak').val(), 10)) {
        moveRow(winnerRow, "player-table", "player-table");
    }
}

// Update the wins, losses, and streak of that row
function updateRecord(playerRow, won) {
    if(won) {
        $(playerRow).find("#wins").val(function(i, oldVal) {
            return ++oldVal;
        });
        $(playerRow).find("#streak").val(function(i, oldVal) {
            return ++oldVal;
        });
    } else {
        $(playerRow).find("#losses").val(function(i, oldVal) {
            return ++oldVal;
        });
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
	var dumpField = $("#data-dump");

	var dataDump = "Player,Wins,Losses";

	for (var i = 0; i < benchTable.rows.length; i++) {
	    var row = benchTable.rows[i];

		var playerName = row.children[1].innerHTML;
		var playerWins = row.children[2].children[0].innerHTML;
		var playerLosses = row.children[3].children[0].innerHTML;

		dataDump = dataDump + "\n" + playerName + "," + playerWins + "," + playerLosses;
	}
	dumpField.val(dataDump);
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
	var dataDump = dumpField.val().split(regex);

	var columnCount = 3;

	var dumpLength = (dataDump.length-(columnCount))/columnCount;

	for(var i=1; i<dumpLength+1; i++) {
		var index = (i*columnCount);    //ignores header row
		addToTable(tableChoice, dataDump[index], dataDump[index + 1], dataDump[index + 2]);
	}
}

function bench(event) {
	if (event.keyCode == 13) {
        $("#addToBench").click();
    }
}

// Link navigation tabs to each other and add swipe support
(function(jQuery) {
    window.onload = function() {
        $('.nav-pills a').click(this, function(e) {$('a[href=#' + $(this).attr("aria-controls") + ']').tab('show')});
        
        var hammertime = new Hammer(document);
        hammertime.on('swiperight', function(ev) {
            if(ev.pointerType == "touch") {
                $('a[href=#queue]').tab('show');
            }
        });
        hammertime.on('swipeleft', function(ev) {
            if(ev.pointerType == "touch") {
                $('a[href=#bench]').tab('show');
            }
        });
    }
}(window.jQuery));