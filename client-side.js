// Some global variables to track important things that we're going to use a lot, like the number of players.
var numPlayers;

$(document).ready(function() {
    $('#enter-game').submit(function(event) {
        var key = $('#my-room-key').val().toUpperCase();
        var keyLength = key.length;
        var user = $('#my-username').val();
        var userLength = user.length;
        // If room key is too long or too short, show an error
        if (keyLength < 4 || keyLength > 4) {
            $('.error').remove();
            $('#enter-game').append('<p class="error">Please enter a valid room key, must be 4 letters.</p>');
        // If room key is not only letters, show an error
        } else if (validateUsername(key)) {
            $('.error').remove();
        // If username is too long or too short, show an error
        } else if (userLength < 2 || keyLength > 25) {
            $('.error').remove();
            $('#enter-game').append('<p class="error">Please enter a valid username, must be longer than 2 letters and less than 25 letters.</p>');
        // If username is not only letters, show an error
        } else if (validateUsername(user)) {
            $('.error').remove();
            $('#enter-game').append('<p class="error">Please enter a valid username, letters only.</p>');
         // If username has passed all the client-side validation, continue on with server validation methods
         } else {
            $('.error').remove();
            console.log("username passed validation up to this point");
            validateKey(key, user);
        }
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
function getNumPlayers(key, user) {
  var playerCount = firebase.database().ref('games/' + key + '/playerCount');
  playerCount.once('value', function(snapshot) {
      numPlayers = snapshot.val();
      updateNumPlayers(key);
      joinGame(key, user, numPlayers);
  });
}

function validateUsername(username) {
    if (!/^[a-zA-Z]*$/g.test(username)) {
        return true;
    } else {
        return false;
    }
}
// This is going to be pretty ugly, because we need to take two snapshots
function validateKey(key, user) {
    var ref = firebase.database().ref('games/' + key);
    ref.once('value', function(snapshot) {
        if (snapshot.exists()) {
            var directory = snapshot;
            var count = directory.child("playerCount").val();
            var phase = directory.child("phase").val();
            if (count >= 8) {
                $('.error').remove();
                $('#enter-game').append('<p class="error">Sorry, this lobby is full.</p>');
            } else if (phase !== 1) {
                $('.error').remove();
                $('#enter-game').append('<p class="error">Sorry, this game is already in session.</p>');
            } else {
                console.log("we've made it this far, room key exists and the room isn't full");
                validateUser(key, user);
            }
        } else {
             $('.error').remove();
             $('#enter-game').append('<p class="error">Please enter a valid room key.</p>');
        }
    });
}

function validateUser(key, user) {
    var ref = firebase.database().ref('games/' + key);
    ref.orderByChild("username").equalTo(user).once("value",snapshot => {
        if (snapshot.exists()){
            $('.error').remove();
            $('#enter-game').append('<p class="error">This username has already been taken.</p>');
        } else {
            getNumPlayers(key, user);
        }
    });
}
function sendPlayerValues(key, user, playerKey, playerNum, playerColor, chosenAvatar) {
    var values = {
        username: user,
        avatar: chosenAvatar,
        color: playerColor,
    };
    var ref = firebase.database().ref('games/' + key + '/' + playerKey);
    var newChildRef = ref.set(values);
    var avatarUpdate = firebase.database().ref('games/' + key + '/avatars');
    var avatarValues = {};
    avatarValues[chosenAvatar] = false;
    var avatarChildRef = avatarUpdate.update(avatarValues);
    changePlayerCount(key, playerNum);
}
function joinGame(key, user, num) {
    var playerNum = num + 1;
    var playerKey = "player" + playerNum;
    $('body').attr('player', playerKey);
    var playerColor;
    switch(playerNum) {
        case 1:
            playerColor = "purple";
            break;
        case 2:
            playerColor = "blue";
            break;
        case 3:
            playerColor = "green";
            break;
        case 4:
            playerColor = "yellow";
            break;
        case 5:
            playerColor = "red";
            break;
        case 6:
            playerColor = "pink";
            break;
        case 7:
            playerColor = "white";
            break;
        case 8:
            playerColor = "teal";
            break;
        default:
            break;
           }
    $('body').attr('color', playerColor);
    var chosenAvatar
    function chooseRandomAvatar(avatar) {
        var randAvatar = Math.floor(Math.random() * 8) + 1;
        chosenAvatar = "avatar" + randAvatar;
        var ref = firebase.database().ref('games/' + key + '/avatars/' + chosenAvatar);
        ref.once('value', function(snapshot) {
            var value = snapshot.val();
            if (value) {
                sendPlayerValues(key, user, playerKey, playerNum, playerColor, chosenAvatar);
            } else {
                chooseRandomAvatar(chosenAvatar);
            }
        });
    }
    chooseRandomAvatar(chosenAvatar);
}
function changePlayerCount(key, playerNum) {
    var values = {
        playerCount: playerNum
    };
    var ref = firebase.database().ref('games/' + key);
    var newChildRef = ref.update(values);
}
