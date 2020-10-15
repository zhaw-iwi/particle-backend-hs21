var lastButtonPressEvent = {
    deviceId: "",
    timestamp: 0
}

function handleBlinkingStateChanged (event) {
    // read variables from the event
    let eventData = JSON.parse(event.data);
    let data = eventData.data;
    let deviceId = eventData.coreid;
    let timestamp = Date.parse(eventData.published_at);

    // create a message to be sent to a client
    let message = timestamp + " - Blinking state of device " + deviceId + " changed to '" + data + "'";

    // send the message to the client (as stream)
    exports.sse.send(message)
}

function handleButtonStateChanged (event) {
    let eventData = JSON.parse(event.data);
    let data = eventData.data;
    let deviceId = eventData.coreid;
    let timestamp = Date.parse(eventData.published_at);


    let message = "";
    if (data === "pressed") {
        message = timestamp + ": Button of device " + deviceId + " was pressed";

        if (timestamp - lastButtonPressEvent.timestamp < 1000) {
            if (deviceId !== lastButtonPressEvent.deviceId) {
                exports.sse.send("Buttons pressed within 1 second")
            }
        }

        lastButtonPressEvent.timestamp = timestamp;
        lastButtonPressEvent.deviceId = deviceId;
    } 
    else if (data === "released") {
        message = timestamp + ": Button of device " + deviceId + " was released";
    }
    else {
        message = timestamp + ": Unknown state of device " + deviceId + " state - " + data;
    }
    // console.log(message);
    exports.sse.send(message)
}

exports.sse = null;
exports.handleBlinkingStateChanged = handleBlinkingStateChanged;
exports.handleButtonStateChanged = handleButtonStateChanged;