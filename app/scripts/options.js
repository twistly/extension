// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly';
import delay from 'delay';
import api from './api';

const setStatus = async (msg, ms = 1000) => {
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
        console.log(res.err);
        return setStatus(`Twistly seems to be having issues right now.`);
    }

    chrome.storage.sync.set({
        apiKey
    }, () => {
        // Update status to let user know options were saved.
        return setStatus('Settings saved.');
    });
};

const restoreOptions = () => {
    console.log('restoring options');
    chrome.storage.sync.get({
        apiKey: null
    }, items => {
        document.getElementById('api_key').value = items.apiKey;
    });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
