$(document).ready(function() {
    $('#enter-room').submit(function(event) {
        var key = $('#room-key').val();
        var keyLength =  key.length;
        if (keyLength < 4 || keyLength > 4) {
            $('#entering-key').append('<p class="error">Please enter a valid room key, must be 4 letters.</p>');
        } else {
            $('#entering-key').remove();
            console.log(key);
            var values = {
                numPlayers: 0,
                player1: null,
                player2: null,
                player3: null,
                player4: null
            }
            var pathRef = firebase.database().ref('games/' + key);
            var newChildRef = pathRef.push(values);
        }
        event.preventDefault();
    });
});
