// Some global variables to track important things that we're going to use a lot, like the number of players.
var numPlayers;

function updateNumPlayers(key) {
  var playerCount = firebase.database().ref('games/' + key + '/playerCount');
  playerCount.on('value', function(snapshot) {
      numPlayers = snapshot.val();
      console.log("this ran");
  });
}

$(document).onbeforeunload(function() {
    // Detects that the user is leaving. We'll need to do some stuff.
});
$(document).ready(function() {
    $('#enter-game').submit(function(event) {
        var key = $('#my-room-key').val();
        var keyLength = key.length;
        var user = $('#my-username').val();
        var userLength = user.length;
        if (keyLength < 4 || keyLength > 4) {
            $('.error').remove();
            $('#enter-game').append('<p class="error">Please enter a valid room key, must be 4 letters.</p>');
        } else {
            $('.error').remove();
            if (userLength < 2 || keyLength > 25) {
                $('.error').remove();
                $('#enter-game').append('<p class="error">Please enter a valid username, must be longer than 2 letters and less than 25 letters.</p>');
            } else {
                if (validateUsername(user)) {
                    $('.error').remove();
                    $('#enter-game').append('<p class="error">Please enter a valid username, letters only.</p>');
                } else {
                    $('.error').remove();
                    console.log("username passed validation");
                    updateNumPlayers(key);
                }
            }
        }
        event.preventDefault();
    });
});
function validateUsername(username) {
    if (!/^[a-zA-Z]*$/g.test(username)) {
        return true;
    } else {
        return false;
    }
}
