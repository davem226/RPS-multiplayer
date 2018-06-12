// Initialize Firebase
var config = {
    apiKey: "AIzaSyCoWwD1CCYRf07DNJ-tnD-hEWcCWfvcGIU",
    authDomain: "testproject-d19a0.firebaseapp.com",
    databaseURL: "https://testproject-d19a0.firebaseio.com",
    projectId: "testproject-d19a0",
    storageBucket: "testproject-d19a0.appspot.com",
    messagingSenderId: "688713158176"
};
firebase.initializeApp(config);
const F = firebase.database();

// Declare variable to suppress firebase activity on page load
let firstLoad = true;

// Create variable to identify player in the browser
let player = "";

// Create array of RPS strings
let rpsStrings = ["Rock", "Paper", "Scissors"];

// Create data object for transfer to and from firebase
let gameData = {
    addPlayer: "",
    playerOne: "",
    playerTwo: "",
    gameState: "intro",
    oneScore: 0,
    twoScore: 0,
    ties: 0,
    oneChoice: "none",
    twoChoice: "none",
    result: "",
}

// Set initial firebase data
F.ref().set(gameData);

// Play button is hidden instead of created later in order for onlick to work
$("#play-button").hide();
// Hide game screen
$("#game-screen").hide();

// Set up data transfer to html on any value change in firebase
F.ref().on("value", function (snapshot) {

    // Don't edit any html on page load
    if (firstLoad === false) {
        // If on game intro screen...
        if (snapshot.val().gameState === "intro") {
            // If no player has joined game...
            if (gameData.playerOne === "") {
                // Join as player one and create div for name
                $("#who-is-playing").append($("<div>").attr("id", "player-one"));

                // Hide p tag saying no players have joined
                $("#no-players").remove();

                // Transfer added player to player one
                gameData.playerOne = snapshot.val().addPlayer;

                // Update html to show player has joined game
                $("#player-one").text(snapshot.val().addPlayer + " is ready to play!");
            }

            // Else someone has joined...
            else {
                // Join as player two
                $("#who-is-playing").append($("<div>").attr("id", "player-two"));
                gameData.playerTwo = snapshot.val().addPlayer;
                $("#player-two").text(snapshot.val().addPlayer + " is ready to play!");

                // Show play button after both players have joined
                $("#play-button").show();
            }
        }
        // Else if game on play screen
        else if (snapshot.val().gameState === "play") {
            // Remove start screen div
            $("#start-screen").remove();

            // Show game screen
            $("#game-screen").show();
            // But hide game buttons for now
            $("#game-buttons").hide();

            // Add player scores to html
            $("#player-one-score").text(snapshot.val().playerOne + ": " + snapshot.val().oneScore);
            $("#player-two-score").text(snapshot.val().playerTwo + ": " + snapshot.val().twoScore);
            $("#ties").text("Ties: " + snapshot.val().ties);

            // After a short delay, show rock, papers, scissors, shoot! in html
            rps();
        }
        // Else if game on choices screen
        else if (snapshot.val().gameState === "result") {
            // If both players have chosen 
            if (snapshot.val().oneChoice !== "none" &&
                snapshot.val().twoChoice !== "none") {

                // Show results
                $("#rps").hide();
                $("#result").show();

                // Add player choices to html
                $("#player-one").text(snapshot.val().playerOne);
                $("#player-one-choice").text(rpsStrings[snapshot.val().oneChoice]);
                $("#player-two").text(snapshot.val().playerTwo);
                $("#player-two-choice").text(rpsStrings[snapshot.val().twoChoice]);

                // After a second, determine winner or tie and update html
                setTimeout(function () {
                    if (snapshot.val().oneChoice === snapshot.val().twoChoice) {
                        // Tie game
                        gameData.ties++;

                        // Set game result variable, which will be used to show results to html
                        gameData.result = "Tie Game!";
                    }
                    else if (snapshot.val().oneChoice - snapshot.val().twoChoice > 0 ||
                        snapshot.val().oneChoice - snapshot.val().twoChoice === -2) {
                        // Player one wins
                        gameData.oneScore++;
                        gameData.result = gameData.playerOne + " wins!!!";
                    }
                    else {
                        // Player two wins
                        gameData.twoScore++;
                        gameData.result = gameData.playerTwo + " wins!!!";
                    }

                    // Update html
                    $("#result").hide();
                    $("#end").show()
                    $("#end").text(gameData.result);
                    $("#player-one-score").text(snapshot.val().playerOne + ": " + gameData.oneScore);
                    $("#player-two-score").text(snapshot.val().playerTwo + ": " + gameData.twoScore);
                    $("#ties").text("Ties: " + gameData.ties);
                }, 2000);

                // After a couple seconds allow for next round
                setTimeout(function () {
                    gameData.gameState = "play";
                    $("#end").hide();
                    $("#rps").show();
                    gameData.oneChoice = "none";
                    gameData.twoChoice = "none";
                    rps();
                }, 5000);
            }
        }
        // Else do nothing
        else { }
    }
    // Change firstload to false after page loads
    else { firstLoad = false; }

});

// When join button clicked, log name of player joining in database
$("#join").click(function (e) {
    e.preventDefault();

    // Identify as player one or two in browser
    if (gameData.playerOne === "") {
        player = "one";
    } else {
        player = "two";
    }

    // Get name input
    gameData.addPlayer = $("#name").val();

    // Remove input form when I submit
    $("#type-name").remove();

    // Send to database
    F.ref().update(gameData);
});

// Start game when play is clicked
$("#play-button").click(function () {
    // Change firebase game state to play
    gameData.gameState = "play";

    // Update firebase
    F.ref().update(gameData);
});

// Turn on click function for each RPS button
$("#rock").click(function () {
    // Change game state to results
    gameData.gameState = "result";
    // Update game state into database
    F.ref().update({
        gameState: gameData.gameState,
    });

    // Reset player choices 
    // if (gameData.oneChoice === "none" && gameData.twoChoice === "none") {
    //     F.ref().update({
    //         oneChoice: gameData.oneChoice,
    //         twoChoice: gameData.twoChoice,
    //     });
    // }

    // Store player choice; value for rock is 0, paper 1, scissors 2
    storeChoice(0);
    // Hide buttons
    $("#game-buttons").hide();
});
$("#paper").click(function () {
    // Change game state to results
    gameData.gameState = "result";
    // Update game state into database
    F.ref().update({
        gameState: gameData.gameState,
    });

    // Reset player choices 
    // if (gameData.oneChoice === "none" && gameData.twoChoice === "none") {
    //     F.ref().update({
    //         oneChoice: gameData.oneChoice,
    //         twoChoice: gameData.twoChoice,
    //     });
    // }

    // Store player choice; value for rock is 0, paper 1, scissors 2
    storeChoice(1);
    // Hide buttons
    $("#game-buttons").hide();
});
$("#scissors").click(function () {
    // Change game state to results
    gameData.gameState = "result";
    // Update game state into database
    F.ref().update({
        gameState: gameData.gameState,
    });

    // Reset player choices 
    // if (gameData.oneChoice === "none" && gameData.twoChoice === "none") {
    //     F.ref().update({
    //         oneChoice: gameData.oneChoice,
    //         twoChoice: gameData.twoChoice,
    //     });
    // }

    // Store player choice; value for rock is 0, paper 1, scissors 2
    storeChoice(2);

    // Hide buttons
    $("#game-buttons").hide();
});


// Create function to store player choice
function storeChoice(choiceValue) {
    // Store choices of each player
    console.log("player var is: " + player);
    if (player === "one") {
        gameData.oneChoice = choiceValue;
        // update only player one choice in firebase
        F.ref().update({
            oneChoice: choiceValue,
        });
    }
    else {
        gameData.twoChoice = choiceValue;
        // update only player two choice in firebase
        F.ref().update({
            twoChoice: choiceValue,
        });
    }
}

// Create function to execute rock, paper, scissors sequence
function rps() {
    timeoutRPS("Rock...", 1);
    timeoutRPS("Paper...", 2);
    timeoutRPS("Scissors...", 3);
    timeoutRPS("Shoot!", 4);
    setTimeout(function () {
        $("#text").text("");
        $("#game-buttons").show();
    }, 4000);
}
// Create timeout function to be used inside of rps()
function timeoutRPS(word, seconds) {
    setTimeout(function () {
        $("#text").text(word);
    }, seconds * 1000);
}

// Create function to determine winner or if tied
function gameResult(snapshot) {

}