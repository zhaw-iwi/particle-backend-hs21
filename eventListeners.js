function initEventListeners(source) {
    // Add your event listeners here.
    source.addEventListener('MyEvent', handleEvent);
}

function handleEvent (event) {
    // read variables from the event
    let eventType = event.type;
    let eventData = JSON.parse(event.data).data;
    let eventTimestamp = JSON.parse(event.data).published_at;
    let deviceId = JSON.parse(event.data).coreid;
    let timestamp = Date.parse(eventTimestamp); // the timestamp of the event

    // the data we want to send to the clients
    let data = JSON.parse(eventData);

    data.myMessage = "Hello World";

    // TODO: do something meaningful with the data

    // send data to all connected clients
    exports.sendEvent(eventType, data, deviceId, timestamp );
}

exports.sendEvent = null;
exports.initEventListeners = initEventListeners;
