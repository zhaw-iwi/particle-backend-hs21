const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const EventSource = require("eventsource");

/////////////////////////////////////////////
// Server setup
/////////////////////////////////////////////
const app = express();
app.use(cors())
app.use(bodyParser.json()); // support json encoded bodies
app.use('/', express.static(path.join(__dirname, 'dist')));
const port = process.env.PORT || '3001';
app.set('port', port);
const server = http.createServer(app);

/////////////////////////////////////////////
// Device setup (Particle Cloud)
/////////////////////////////////////////////
var constants = {}
try {
    constants = require('./constants')
} catch (error) {
    console.log("Module 'constants' not found, trying Heroku config vars.")
}
const access_token_1 = process.env.ACCESS_TOKEN_1 || constants.access_token_1;
const device_id_1 = process.env.DEVICE_ID_1 || constants.device_id_1;
const access_token_2 = process.env.ACCESS_TOKEN_2 || constants.access_token_2;
const device_id_2 = process.env.DEVICE_ID_2 || constants.device_id_2;
const devices = [
    {
        device_id: device_id_1,
        access_token: access_token_1
    }
]
if (device_id_2) {
    devices.push({
        device_id: device_id_2,
        access_token: access_token_2
    })
}

/////////////////////////////////////////////
// SSE setup
/////////////////////////////////////////////
const eventListeners = require('./eventListeners.js');
var clients = [];
deviceIds = [device_id_1, device_id_2];
eventListeners.sendEvent = function (eventType, eventData, deviceId, timestamp ) {
    // map device id to device nr
    let nr = deviceIds.indexOf(deviceId)

    // the message that we send to the client
    let data = {
        eventName: eventType,
        eventData: eventData,
        deviceNumber: nr,
        deviceId: deviceId,
        timestamp: timestamp,
    };

    // send the data to all connected clients
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(data)}\n\n`))
}
for (let device of devices) {
    let eventURL = 'https://api.particle.io/v1/devices/' + device.device_id + '/events?access_token=' + device.access_token
    var source = new EventSource(eventURL);
    eventListeners.initEventListeners(source);
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

/////////////////////////////////////////////
// API
/////////////////////////////////////////////

// Read a variable. Example:
// GET /api/device/0/variable/buttonState
app.get('/api/device/:id/variable/:name', (req, res) => {
    let id = req.params.id;
    let variableName = req.params.name;

    if (id >= devices.length) {
        res.status(500).send({ error: "invalid device id" });
    }
    else {
        let device = devices[id];
        let url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + variableName + '?access_token=' + device.access_token;
        axios.get(url)
            .then(response => {
                res.send({
                    timeStamp: response.data.coreInfo.last_heard,
                    result: response.data.result,
                });
            })
            .catch(error => {
                res.status(500).send({ error: "could not read current value" });
            });
    }
})

// Call a function. Example:
// POST /api/device/0/function/blinkRed
app.post('/api/device/:id/function/:name', (req, res) => {

    let id = req.params.id;
    let functionName = req.params.name;

    if (id >= devices.length) {
        res.status(500).send({ error: "invalid device id" });
    }
    else {
        let device = devices[id];
        let data = { arg: req.body.arg };

        let url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + functionName + '?access_token=' + device.access_token;

        axios.post(url, data)
            .then(response => {
                res.send({ result: response.data.return_value })
            })
            .catch(error => {
                res.status(500).send({ error: "could not execute function " + functionName })
            });
    }
})

// start server
server.listen(port, () => {
    console.log("app listening on port " + port);
});
