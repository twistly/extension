const Frisbee = require('frisbee');

const api = new Frisbee({
    baseURI: 'https://api.twistly.xyz',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

module.exports = api;
