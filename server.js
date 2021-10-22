const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

// Server setup
const app = express();
app.use(cors())
app.use(bodyParser.json()); // support json encoded bodies
app.use('/', express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || '3001';
app.set('port', port);
const server = http.createServer(app);

// Initialise Particle Devices
const devices = require('./config/devices.js')();

// Initialise SSE
require('./routes/sse.js')(app, devices);

// Initialise the API
require('./routes/api.js')(app, devices);

// start server
server.listen(port, () => {
    console.log("app listening on port " + port);
});
