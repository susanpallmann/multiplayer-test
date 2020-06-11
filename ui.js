// Some global variables to track important things that we're going to use a lot, like the number of players.
var numPlayers;
var playDeck = [];

$(document).ready(function() {
    $('#start-game').submit(function(event) {
        generateRoomCode();
        event.preventDefault();
    });
});
function trackGamePhase(key) {
    var phase = firebase.database().ref('games/' + key + '/phase');
    phase.on('value', function(snapshot) {
        updatePhase(snapshot.val());
    });
}
function updatePhase(val) {
    $('body').attr('phase', val);
    if (val === 2) {
        runTutorial();
    }
}
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
        inventoryMode: 1, // Changes functionality in all users' inventories following the following codes:
            // 1 || Equip mode, cards disabled.
            // 2 || Effects mode, equipment disabled.
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
    var avatarsChildRef = avatarsRef.set(avatarValues);
    // TODO: Initialize some trackers now that we have a room code (like game phase)
    trackGamePhase(key);
    updateNumPlayers(key);
    updatePlayers(key);
    deckSetup(key);
}

function updatePlayers(key) {
    var player1 = firebase.database().ref('games/' + key + '/player1');
    player1.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
    var player2 = firebase.database().ref('games/' + key + '/player2');
    player2.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
    var player3 = firebase.database().ref('games/' + key + '/player3');
    player3.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
    var player4 = firebase.database().ref('games/' + key + '/player4');
    player4.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
    var player5 = firebase.database().ref('games/' + key + '/player5');
    player5.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
    var player6 = firebase.database().ref('games/' + key + '/player6');
    player6.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
    var player7 = firebase.database().ref('games/' + key + '/player7');
    player7.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
    var player8 = firebase.database().ref('games/' + key + '/player8');
    player8.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var user = directory.child("username").val();
            var color = directory.child("color").val();
            var avatar = directory.child("avatar").val();
            displayPlayer(user, color, avatar);
        }
    });
}   
function displayPlayer(user, color, avatar) {   
    $('.player-tile').each(function(index) {
        if ($(this).find('h4').text() === user) {
            console.log('this ran 1');
            $(this).removeClass('empty');
            $(this).attr('color', color)
                .attr('avatar', avatar);
            $(this).find('h4').text(user);
            return false;
        } else if ($(this).hasClass('empty')) {
            console.log('this ran 2');
            $(this).removeClass('empty');
            $(this).attr('color', color)
                .attr('avatar', avatar);
            $(this).find('h4').text(user);
            return false;
        } else {
            console.log('this ran 3');
        }
    });
}
function timesUpCodes(code) {
    switch(code) {
        case 1:
            // Call function here
            console.log("time's up!");
            break;
        default:
            break;
    }
}
function startTimer(duration, code) {
    var timer = duration, seconds;
    var thisTimer = setInterval(function () {
        seconds = parseInt(timer % 60, 10);
        seconds = seconds < 10 ? "0" + seconds : seconds;
        $('#timer').css('display','block');
        $('#timer').text(seconds);
        if (--timer < 0) {
            $('#timer').css('display','none');
            timesUpCodes(code);
            clearInterval(thisTimer);
        }
    }, 1000);
}
function runTutorial() {
    // Run tutorial video thing.
    // Just to see if this works, we'll start a timer too.
    startTimer(30, 1);
    // Then we need to tell the database what capabilities each user's inventory has right now (system TBD).
}
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function deckSetup(key) {
    for (i=0; i<deck.length; i++) {
        var thisObject = deck[i];
        thisObject.id = i;
        playDeck.push(thisObject);
    }
    playDeck = shuffleArray(playDeck);
    for (i=0; i<playDeck.length; i++) {
        updateItem(key, 'deck', i, true);
    }
}
function updateItem(key, path, id, bool) {
    var playerRef = firebase.database().ref('games/' + key + '/' + path);
    // A boolean is passed in to determine if adding or removing the specified item (true=add, false=delete)
    if (bool) {
        var values = {};
        values[id] = id;
        var newChildRef = playerRef.update(values);
    } else {
        var values = {};
        values[id] = null;
        var newChildRef = playerRef.update(values);
    }
}
