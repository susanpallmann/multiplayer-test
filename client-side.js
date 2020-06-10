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
    $('.avatar').click(function() {
        var avatarName = $(this).attr('avatar');
        var key = $('body').attr('room-key');
        if ($(this).hasClass('unavailable')) {
        } else if ($(this).hasClass('selected')) {
        } else {
            var oldAvatar = $('.avatar.selected').attr('avatar');
            $('.avatar.selected').removeClass('selected');
            $(this).addClass('selected');
            var ref = firebase.database().ref('games/' + key + '/avatars');
            var avatarChange = {};
            avatarChange[avatarName] = false;
            avatarChange[oldAvatar] = true;
            var newChildRef = ref.update(avatarChange);
            var playerName = $('body').attr('player');
            var playerRef = firebase.database().ref('games/' + key + '/' + playerName);
            var newChildRef = playerRef.update({avatar: avatarName});
        }
    });
    $('#begin-play').submit(function(event) {
        var key = $('body').attr('room-key');
        if (numPlayers < 4) {
            $('.error').remove();
            $('#begin-play').append('<p class="error">Not enough players. You need 4-8 players for this game.</p>');
        } else {
            var ref = firebase.database().ref('games/' + key);
            var newChildRef = ref.update({phase: 2});
        }
        event.preventDefault();
    });
    $('#card-action-back').click(function(){
        hideCard();
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
}
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
        gold: 5,
    };
    $('#' + chosenAvatar).addClass('selected');
    $('header').attr('color', playerColor);
    $('header h2').text(user).css('text-align','center').css('color','#ffffff');
    var ref = firebase.database().ref('games/' + key + '/' + playerKey);
    var newChildRef = ref.set(values);
    var avatarUpdate = firebase.database().ref('games/' + key + '/avatars');
    var avatarValues = {};
    avatarValues[chosenAvatar] = false;
    var avatarChildRef = avatarUpdate.update(avatarValues);
    changePlayerCount(key, playerNum);
    trackGamePhase(key);
    checkAvatars(key);
    updateInventory(key);
    updateEquipment(key);
    initiateProfile(key);
}
function joinGame(key, user, num) {
    var playerNum = num + 1;
    var playerKey = "player" + playerNum;
    $('body').attr('player', playerKey);
    $('body').attr('room-key', key);
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
// Updates the playerCount in the database
function changePlayerCount(key, playerNum) {
    var values = {
        playerCount: playerNum
    };
    var ref = firebase.database().ref('games/' + key);
    var newChildRef = ref.update(values);
}
// Updates the visual representation of which avatars are available
function displayAvatar(avatar, bool) {
    var name = avatar;
    if (bool) {
        $('#' + name).removeClass('unavailable');
    } else {
        $('#' + name).addClass('unavailable');
    }
}
// Listens for updates to which avatars are taken and sends an update to the visual handler
function checkAvatars(key) {
    var avatar1 = firebase.database().ref('games/' + key + '/avatars/avatar1');
    avatar1.on('value', function(snapshot) {
        displayAvatar('avatar1', snapshot.val());
    });
    var avatar2 = firebase.database().ref('games/' + key + '/avatars/avatar2');
    avatar2.on('value', function(snapshot) {
        displayAvatar('avatar2', snapshot.val());
    });
    var avatar3 = firebase.database().ref('games/' + key + '/avatars/avatar3');
    avatar3.on('value', function(snapshot) {
        displayAvatar('avatar3', snapshot.val());
    });
    var avatar4 = firebase.database().ref('games/' + key + '/avatars/avatar4');
    avatar4.on('value', function(snapshot) {
        displayAvatar('avatar4', snapshot.val());
    });
    var avatar5 = firebase.database().ref('games/' + key + '/avatars/avatar5');
    avatar5.on('value', function(snapshot) {
        displayAvatar('avatar5', snapshot.val());
    });
    var avatar6 = firebase.database().ref('games/' + key + '/avatars/avatar6');
    avatar6.on('value', function(snapshot) {
        displayAvatar('avatar6', snapshot.val());
    });
    var avatar7 = firebase.database().ref('games/' + key + '/avatars/avatar7');
    avatar7.on('value', function(snapshot) {
        displayAvatar('avatar7', snapshot.val());
    });
    var avatar8 = firebase.database().ref('games/' + key + '/avatars/avatar8');
    avatar8.on('value', function(snapshot) {
        displayAvatar('avatar8', snapshot.val());
    });
}
// Populates the card with the information corresponding to that specific ID
function loadCardInfo(id) {
    console.log("load card ran");
    var myCard = deck[id];
    var sell = myCard.val;
    var sprite = myCard.sprite;
    var effect = myCard.effect;
    var score = myCard.score;
    var desc = myCard.desc;
    var title = myCard.title;
    $('#card-title').text(title);
    $('#card-desc').text(desc);
    if (score > 0) {
        $('#card-score').text('+' + score);
    } else {
        $('#card-score').text(score);
    }
    $('#card-sell').text(sell + ' gold');
    $('#card-image img').attr('src','images/cards/' + sprite + '.png');
    $('#card-image img').attr('alt','illustration of the ' + title);
    if (effect === "none") {
        $('#card-effect-icon').text('');
        $('#card-effect').text('');
    } else {
        $('#card-effect-icon').text('');
        $('#card-effect').text('Effect: ' + effect);
    }
}
// Listener for changes in a player's inventory, calls the visual updates needed to reflect the change
function updateInventory(key) {
    var playerKey = $('body').attr('player');
    var ref = firebase.database().ref('games/' + key + '/' + playerKey + '/items');
    ref.on('child_added', function(data) {
        loadSmallCard(data.key,$('#items'));
    });
    ref.on('child_removed', function(data) {
        removeSmallCard(data.key);
    });
}
function updateEquipment(key) {
    var playerKey = $('body').attr('player');
    var ref = firebase.database().ref('games/' + key + '/' + playerKey + '/equipped');
    ref.on('child_added', function(data) {
        loadSmallCard(data.key,$('#equipped'));
    });
    ref.on('child_removed', function(data) {
        removeSmallCard(data.key);
    });
}
// Visually adds a small card and populates ID/image information
function loadSmallCard(id,location) {
    location.append('<div class="item-small" id="' + id + '"></div>');
    var thisItem = deck[id];
    var sprite = thisItem.sprite;
    $('#' + id).css('background-image','url("images/cards/' + sprite + '.png")');
}
// Visually removes a small card by ID
function removeSmallCard(id) {
    $('#' + id).remove();
}
// Hides card overlay
function hideCard() {
    $('#card-container').css('opacity',0);
    setTimeout(function(){
        $('#card-container').css('display','none');
        return true;
    }, 0200);
}
// Displays card overlay
function showCard() {
    $('#card-container').css('display','block');
    setTimeout(function(){
        $('#card-container').css('opacity',1);
        return true;
    }, 0200);
}
// Starts some listeners for the inventory screen.
function initiateProfile(key) {
    // Getting local storage of player's key
    var playerKey = $('body').attr('player');
    // Grabs a snapshot of that player's directory under the game database
    var ref = firebase.database().ref('games/' + key + '/' + playerKey);
    ref.on('value', function(snapshot) {
        if (snapshot.exists()) {
            // Player's snapshot directory
            var directory = snapshot;
            var gold = directory.child("gold").val();
            // Updates amount of gold
            $('#gold-amount').text(gold);
            // Updates avatar
            var avatar = directory.child("avatar").val();
            $('#full-avatar img').attr('src','images/full-body/' + avatar + '.png');
            $('#full-avatar img').attr('alt','illustration of your player avatar');
        }
    });
}
// Function to edit inventory items (not equipped items for a specific player)
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
$(document).on('click', '.item-small', function(){
    var id = parseInt($(this).attr('id'));
    loadCardInfo(id);
    showCard();
});
