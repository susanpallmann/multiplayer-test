$(document).ready(function() {
    $('#enter-room').submit(function(event) {
        var key = $('#room-key').val();
        var keyLength =  key.length;
        if (keyLength < 4 || keyLength > 4) {
            $('#entering-key').append('<p class="error">Please enter a valid room key, must be 4 letters.</p>');
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
    
});
function updateGameSetup(key) {
  var roomKey = firebase.database().ref('games/' + key + '/roomKey');
  roomKey.on('value', function(snapshot) {
  updateRoomKey(snapshot.val());
  });
}

function updatePlayers(key) {
  var numPlayers = firebase.database().ref('games/' + key + '/numPlayers');
  numPlayers.on('value', function(snapshot) {
      var players = [
          firebase.database().ref('games/' + key + '/player1'),
          firebase.database().ref('games/' + key + '/player2'),
          firebase.database().ref('games/' + key + '/player3'),
          firebase.database().ref('games/' + key + '/player4')
      ];
      for (i=0; i<players.length; i++) {
          if (players[i] === null) {
              players.splice(i, 1);
          } else {
          }
      }
      updatePlayers(players);
  });
}

function updateRoomKey(key) {
    $('#set-room-key').text(key);
}
function updatePlayers(players) {
    $('.player-name').remove();
    var array = players;
    for (i=0; i<array.length; i++) {
        $('#players').append('<p class="player-name">' + array[i] + '</p><br>');
    }
}
