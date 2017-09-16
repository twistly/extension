const chromeStoragePromise = require('chrome-storage-promise');
const delay = require('delay');
const api = require('./api');

const setStatus = async (msg, ms = 2500) => {
    const status = document.getElementById('status');

    status.textContent = msg;
    await delay(ms);
    status.textContent = '';
};

const saveOptions = async () => {
    const apiKey = document.getElementById('api_key').value.trim();

    const res = await api.get(`/queue?api_key=${apiKey}`);

    if (res.err) {
        // Update status to let user know that the server can't be reached.
        if (res.body.status === 403) {
            return setStatus('Incorrect API key.');
        }

        return setStatus(`Twistly seems to be having issues right now.`);
    }

    chromeStoragePromise.sync.set({apiKey}).then(() => {
        // Update status to let user know options were saved.
        return setStatus('Settings saved.');
    });
};

const restoreOptions = async () => {
    document.getElementById('api_key').value = await chromeStoragePromise.sync.get('apiKey').apiKey;
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
