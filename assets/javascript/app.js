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

// Create data object for transfer to and from firebase
let gameData = {
    addPlayer: "",
    playerOne: "",
    playerTwo: "",
    gameState: "intro",
    oneScore: 0,
    twoScore: 0,
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
        // If game intro screen...
        if (snapshot.val().gameState === "intro") {
            // If no player has joined game...
            if (gameData.playerOne === "") {
                // Join as player one and create div for name
                $("#who-is-playing").append($("<div>").attr("id", "player-one"));

                // Hide p tag saying no players have joined
                $("#no-players").remove();

                // Transfer added player to player one
                gameData.playerOne = snapshot.val().addPlayer;

                // Update html to show a player has joined the game
                $("#player-one").text(snapshot.val().addPlayer + " is ready to play!");
            }

            // Else someone has joined...
            else {
                // Join as player two
                $("#who-is-playing").append($("<div>").attr("id", "player-two"));
                gameData.playerTwo = snapshot.val().addPlayer;
                $("#player-two").text(snapshot.val().addPlayer + " is ready to play!");

                // Show play button once both players have joined
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
        }
    }
    // Change firstload to false after page loads
    else { firstLoad = false; }

});

// When join button clicked, log name of player joining in database
$("#join").click(function (e) {
    e.preventDefault();

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

