// Some global variables to track important things that we're going to use a lot, like the number of players.
var numPlayers;

$(document).ready(function() {
    $('#start-game').submit(function(event) {
        generateRoomCode();
        event.preventDefault();
    });
});
function updateNumPlayers(key) {
  var playerCount = firebase.database().ref('games/' + key + '/playerCount');
  playerCount.on('value', function(snapshot) {
      numPlayers = snapshot.val();
      console.log("this ran");
  });
}
function addPlayer(num, user, key) {
    if (num < 4) {
        $('.error').remove();
        var newPlayer = num + 1;
        console.log(newPlayer);
        var playerKey = "player" + newPlayer;
        var newPlayerObject = {};
        newPlayerObject[playerKey] = user;
        var pathRef = firebase.database().ref('games/' + key);
        var newChildRef = pathRef.update(newPlayerObject);
        updatePlayerNumber(key);
        setupPlaySpace(key, user, newPlayer);
    } else {
        $('#enter-game').append('<p class="error">Sorry, this lobby is full.</p>');
    }
}
function updateGameSetup(key) {
  var roomKey = firebase.database().ref('games/' + key + '/roomKey');
  roomKey.on('value', function(snapshot) {
  updateRoomKey(snapshot.val());
  });
}
function updateRoomKey(key) {
    $('#set-room-key').text(key);
}
function updatePlayers(key) {
  var player1 = firebase.database().ref('games/' + key + '/player1');
  player1.on('value', function(snapshot) {
    displayPlayer(snapshot.val(), 1);
  });
  var player2 = firebase.database().ref('games/' + key + '/player2');
  player2.on('value', function(snapshot) {
    displayPlayer(snapshot.val(), 2);
  });
  var player3 = firebase.database().ref('games/' + key + '/player3');
  player3.on('value', function(snapshot) {
    displayPlayer(snapshot.val(), 3);
  });
  var player4 = firebase.database().ref('games/' + key + '/player4');
  player4.on('value', function(snapshot) {
    displayPlayer(snapshot.val(), 4);
  });
}
function displayPlayer(playername, number) {
    $('#players #player' + number).text(playername);
}
function updatePlayerNumber(key) {
    var number = firebase.database().ref('games/' + key + '/numPlayers');
    number.once('value', function(snapshot) {
      increaseNumber(snapshot.val(), key);
    });
}
function increaseNumber(num, key) {
    var newNumber = {numPlayers: 0};
    console.log(num);
    var oldNum = parseInt(num);
    var mathing = num+1;
    console.log(mathing);
    newNumber.numPlayers = mathing;
    console.log(newNumber);
    var pathRef = firebase.database().ref('games/' + key);
    var newChildRef = pathRef.update(newNumber);
}
function setupPlaySpace(key, user, num) {
    $('#username').text(user);
    $('#username').attr('player',num);
    $('#entering-key').remove();
    if (num === 1) {
        $('.span12').append("<h1>You're the VIP. Hit 'everyone is in' when you're ready to start.</h1>");
        $('.span12').append('<form id="start game"><input id="start-game" name="start-game" type="submit" value="everyone is in"></form>');
        $('.row').append('<div class="span12 column" id="playspace"></div>');
    } else {
        $('.span12').append('<h1>Sit tight and wait for the game to begin.</h1>');
        $('.row').append('<div class="span12 column" id="playspace"></div>');
    }
}
// Function to generate a random room code for the start of the game.
function generateRoomCode() {
    // Starts with an empty string.
    var roomCode = "";
    // Recursive function to check if the room code is complete and generate random letters if not.
    function generateDigits(code) {
        // If the string isn't yet 4 characters long
        if (code.length < 4) {
            // Generate a random number between 0 and 25
            var tempNum = Math.floor(Math.random() * 25);
            // Convert this new value to an ascii character (uppercase)
            var tempLetter = String.fromCharCode(65 + tempNum);
            // Add the new value to the existing room code
            roomCode =  code + tempLetter;
            console.log(roomCode);
            // Run this function again to check if the code is complete (length of 4)
            generateDigits(roomCode);
        // If the string is 4 characters
        } else {
            // End function
            return code;
        }
    }
    // Calls the previous function the first time it's run.
    generateDigits(roomCode);
    console.log(roomCode);
    // Passes the finalized code into the verifyRoomCode function
    verifyRoomCode(roomCode);
}
// Function to check if the room key passed into it (key) is already an in-session game in the database
function verifyRoomCode(key) {
    // Checks that specific location in the database and takes a snapshot
    firebase.database().ref('games/' + key).once("value", snapshot => {
        // If the snapshot exists already
        if (snapshot.exists()) {
            // Rerun the code generator and try again
            // While this method isn't entirely as efficient as it could be, this is currently only made for a few close friends to be using, 
            // so it is statistically unlikely that that the function will need run again
            // ¯\_(ツ)_/¯
            generateRoomCode();
            return true;
        // If the snapshot doesn't exist, we can set up the lobby
        } else {
            // Calls function lobbySetup
            lobbySetup(key);
            console.log("We will set up the game by calling a function from here.");
            return false;
        }
    });
}
// Function to set up the initial lobby for users to join client-side.
function lobbySetup(key) {
    // Sets up some dummy directory values and sets some mechanical numbers
    var values = {
        roomCode: key, // Room code, just in case it's needed
        playerCount: 0, // Keeps a count of how many players are in game
        phase: 1, // Tracks game progression, see below:
            // Phase 1: Lobby || Users can join from their phones, transitions once the VIP presses "everyone's in."
            // Phase 2: Setup || Deals cards to users, introduces instructions, transitions on a timer.
            // Phase 3: Play  || Gameplay, the main part of the game, transitions when either someone wins or there are too few players.
            // Phase 4: Win   || Shows a winner and overall scoreboard, ends play, and allows either repeat game or a full restart.
            // Phase 5: Error || Ends the game due to too few players, shows error on screen and then brings host to the homepage.
            // Phase 6: Close || Occurs if the host window is closed, ends the game and removes the room code again.
        // Player slots
        player1: null,
        player2: null,
        player3: null,
        player4: null,
        player5: null,
        player6: null,
        player7: null,
        player8: null,
    };
    var avatarValues = {
        avatar1: true,
        avatar2: true,
        avatar3: true,
        avatar4: true,
        avatar5: true,
        avatar6: true,
        avatar7: true,
        avatar8: true,
    };
    $('#room-code').text(key);
    // Sends new game to the database stored under the room key.
    var ref = firebase.database().ref('games/' + key);
    var newChildRef = ref.set(values);
    var avatarsRef = firebase.database().ref('games/' + key + '/avatars');
    var avatarsChildRef = ref.set(avatarValues);
    // TODO: Initialize some trackers now that we have a room code (like game phase)
    updateNumPlayers(key);
}
