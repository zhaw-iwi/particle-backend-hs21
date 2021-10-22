function connect() {
    if (typeof (EventSource) !== "undefined") {
        if (typeof (EventSource) !== "undefined") {
            var url = window.location.origin + "/api/events";
            var source = new EventSource(url);
            source.onmessage = (event) => {
                var message = event.data;
                document.getElementById("lastmessage").innerHTML = message;
                document.getElementById("allmessages").innerHTML += "<li>" + message + "</li>";
            };
        } else {
            alert("Your browser does not support server-sent events.");
        }
    } else {
        alert("Your browser does not support server-sent events.");
    }
}
connect();
