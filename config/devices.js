// Device setup (Particle Cloud)
module.exports = function () {
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
    return devices;
}
