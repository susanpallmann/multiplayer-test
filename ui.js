$(document).ready(function(){
    $('#submit-key').click(function (event) {
        var key = $('room-key').val();
        var keyLength =  key.length;
        if (keyLength < 4 || keyLength > 4) {
            $('#entering-key').append('<p class="error">Please enter a valid room key, must be 4 letters.</p>');
        } else {
            $('#entering-key').remove();
            console.log(key);
        }
        event.preventDefault();
    });
});
