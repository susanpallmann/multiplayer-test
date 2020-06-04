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
        event.preventDefault();
    });
    
});
function updateGameSetup(key) {
  var roomKey = firebase.database().ref('games/' + key + '/roomKey');
  roomKey.on('value', function(snapshot) {
  updateRoomKey(snapshot.val());
  });
}
function updateRoomKey(key) {
    $('#set-room-key').text(key);
}
