$(document).ready(function(){

    ////// VARIABLEN /////
    var socket = io();
    var myUsername = "";
    var myId = -1;
    var timer; // scorebouncing
    var TIMEOUT = 200; // ms

    ////// CONTROLLER /////
    // Anmeldung
    $("#btn").click(function() {
            var input = $("#input").val();
            socket.emit("add", input);
    });

    function setUsername() {
        var regex = /^\w+$/i; // Alphanumerisch only
        var input = $("#input").val();
        var username = cleanInput(input.trim());

        if(username) {
            if (regex.test(username)) {
                 $(window).off("keydown");
                socket.emit("add", username);
                
                var seq = [
                    {e: $("#login"), p: "fadeOut"},
                    {e: $("#room"), p: "fadeIn", o: {display: "flex"}}
                ]
                $.Velocity.RunSequence(seq);
            } else {
                $("#login-error").text("Der Benutzername darf nur alphanumerische Zeichen enthalten!");
            }
        } else {
            $("#login-error").text("Du musst einen Benutzernamen angeben!");
        }
    }

    // Buttonaktionen
    $("#click").mousedown(function() {
        $("#click").addClass("down");
        $("#click").text(myUsername);
        socket.emit("down", myUsername);
        // Für den Fall, dass der User während mousedown
        // mosueleave triggert.
        $("#click").mouseleave(function() {
            $("#click").off("mouseleave");
            socket.emit("up", myId);
        });
    });

    $("#click").mouseup(function() {
        $("#click").off("mouseleave");
        socket.emit("up", myId);
    });

    ////// SOCKET.IO LISTENER //////

    // Beim connecten schonmal die User im Raum laden
    socket.on("build", function(msg) {
        // Beachte, dass wir eine Liste aus Usern haben als msg
        for (i = 0; i < msg.length; ++i) {
            addNewUser(msg[i].id, msg[i].username);
        }
    });

    // Neuer User hat sich eingeloggt
    // msg: {username, id, socketid}
    socket.on("add", function(msg) {
        addNewUser(msg.id, msg.username);
    });

    // Das gleiche wie add, bloß dass id und username gespeichert werden
    // Nach dem Anmelden, die ID und Username speichern
    socket.on("bind", function(msg) {
        addNewUser(msg.id, msg.username);
        myId = msg.id;
        myUsername = msg.username;
    });

    // Entferne einen User
    socket.on("remove", function(msg) {
        removeUserById(msg.id);
    });

    // Buttonverhalten
    socket.on("down", function(username) {
        $("#click").text(username);
        $("#click").addClass("down");
    });

    // Update score
    socket.on("up", function(userScore) {
        // msg enthält {id, score}
        var $score = $("#user-" + userScore.id + " .score");
        $score.velocity("stop");
        var seq = [
            {e: $score, p: {scale: 1.5}, o: {duration: 50}},
            {e: $score, p: {scale: 1.0}, o: {duration: 50, delay: 25}}
        ]
        $.Velocity.RunSequence(seq);
        $score.text(userScore.score);
        $("#click").removeClass("down");
    });

    ////// HILFSFUNKTIONEN //////

    $(window).keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $("#input").focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            setUsername();
        }
    });

    ////// HILFSFUNKTIONEN //////

    // Prevents input from having injected markup
    function cleanInput (input) {
        return $('<div/>').text(input).text();
    }

    // Fügt einen neuen User hinzu (auf View-Ebene)
    function addNewUser(id, username) {
        var $new = $("<div/>", {id: "user-" + id, class: "user-item"});
        $("<div/>", {class: "username", text: username}).appendTo($new);
        $("<div/>", {class: "score", text: 0}).appendTo($new);
        $("#user-container").append($new);
        $("#user-" + id).velocity("fadeIn", {duration: 300, easing: "easeInOutSine"});
    }

    // Entfernt einen User (auf View-Ebene)
    function removeUserById(id) {
        $user = $("#user-" + id);
        // Animation abspielen und danach Element entfernen
        $user.velocity("fadeOut", {duration: 300, easing: "easeInOutSine", complete: function(elements) {
            $("#user-" + id).remove();
        }});
    }

});