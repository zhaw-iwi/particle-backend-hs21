const axios = require('axios');

module.exports = function (app, devices) {

    // Read a variable. Example:
    // GET /api/device/0/variable/buttonState
    app.get('/api/device/:id/variable/:name', (req, res) => {
        var id = req.params.id;
        var variableName = req.params.name;

        if (id >= devices.length) {
            res.status(500).send({ error: "invalid device id" });
        }
        else {
            var device = devices[id];
            var url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + variableName + '?access_token=' + device.access_token;
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

        var id = req.params.id;
        var functionName = req.params.name;

        if (id >= devices.length) {
            res.status(500).send({ error: "invalid device id" });
        }
        else {
            var device = devices[id];
            var data = { arg: req.body.arg };

            var url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + functionName + '?access_token=' + device.access_token;

            axios.post(url, data)
                .then(response => {
                    res.send({ result: response.data.return_value })
                })
                .catch(error => {
                    res.status(500).send({ error: "could not execute function " + functionName })
                });
        }
    })
}