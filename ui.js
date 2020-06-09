$(document).ready(function() {
    $('#start-game').submit(function(event) {
        generateRoomCode();
        event.preventDefault();
    });
    $('#enter-room').submit(function(event) {
        var key = $('#room-key').val();
        var keyLength =  key.length;
        if (keyLength < 4 || keyLength > 4) {
            $('#enter-room').append('<p class="error">Please enter a valid room key, must be 4 letters.</p>');
        } else {
            $('.error').remove();
            console.log(key);
            var values = {
                numPlayers: 0,
                roomKey: key,
                player1: null,
                player2: null,
                player3: null,
                player4: null
            }
            var pathRef = firebase.database().ref('games/' + key);
            var newChildRef = pathRef.set(values);
        }
        updateGameSetup(key);
        updatePlayers(key);
        event.preventDefault();
    });
    $('#enter-game').submit(function(event) {
        var key = $('#my-room-key').val();
        var keyLength = key.length;
        var user = $('#my-username').val();
        var userLength = user.length;
        if (keyLength < 4 || keyLength > 4) {
            $('#enter-game').append('<p class="error">Please enter a valid room key, must be 4 letters.</p>');
        } else {
            $('.error').remove();
            if (userLength < 2 || keyLength > 25) {
                $('#enter-game').append('<p class="error">Please enter a valid username, must be longer than 2 letters and less than 25 letters.</p>');
            } else {
                $('.error').remove();
                // Check number of players
                getPlayerCount(key, user);
            }
        }
        event.preventDefault();
    });
});
function getPlayerCount(key, user) {
  var playerCount = firebase.database().ref('games/' + key + '/numPlayers');
  playerCount.once('value', function(snapshot) {
  addPlayer(snapshot.val(), user, key);
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
    var roomCode = "";
    function generateDigits(code) {
        if (code.length < 4) {
            var tempNum = Math.floor(Math.random() * 25);
            var tempLetter = String.fromCharCode(65 + tempNum);
            roomCode =  code + tempLetter;
            console.log(roomCode);
            generateDigits(roomCode);
        } else {
            return code;
        }
    }
    generateDigits(roomCode);
    console.log(roomCode);
    if (verifyRoomCode(roomCode)) {
        generateRoomCode();
    } else {
        console.log("This room key is not taken, and here we'll run the function to setup the game.");
    }
}
function verifyRoomCode(key) {
    firebase.database().ref('games/' + key).once("value", snapshot => {
        if (snapshot.exists()) {
            return true;
        } else {
            return false;
        }
    });
}
