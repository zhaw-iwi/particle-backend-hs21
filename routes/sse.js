const EventSource = require("eventsource");

// SSE setup
module.exports = function (app, devices) {
    const eventHandlers = require('../eventHandlers.js');
    var clients = [];
    var deviceIds = devices.map(d => d.device_id);

    eventHandlers.sendEvent = function (data) {
        // map device id to device nr
        var nr = deviceIds.indexOf(data.deviceId)
        data.deviceNumber = nr;

        // send the data to all connected clients
        clients.forEach(client => client.response.write(`data: ${JSON.stringify(data)}\n\n`))
    }
    for (var device of devices) {
        var eventURL = 'https://api.particle.io/v1/devices/' + device.device_id + '/events?access_token=' + device.access_token
        var source = new EventSource(eventURL);
        eventHandlers.registerEventHandlers(source);
    }
    function eventsHandler(request, response, next) {
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        response.writeHead(200, headers);

        const clientId = Date.now();

        const newClient = {
            id: clientId,
            response
        };

        clients.push(newClient);

        request.on('close', () => {
            console.log(`${clientId} Connection closed`);
            clients = clients.filter(client => client.id !== clientId);
        });
    }
    app.get('/api/events', eventsHandler);
}