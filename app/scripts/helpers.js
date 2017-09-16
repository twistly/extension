const chromeStoragePromise = require('chrome-storage-promise');
const api = require('./api');

const isTumblrBlog = (document.getElementsByTagName('body')[0].className.indexOf('tumblelog_archive') !== -1);
const isTwistlyUp = () => {
    return new Promise(async resolve => {
        const res = await api.get('/');
        resolve(res.body.status === 200);
    });
};

const getTwistlyApiKey = async () => {
    const {apiKey} = await chromeStoragePromise.sync.get('apiKey');
    return apiKey;
};

const isQplusUp = () => {
    return new Promise(async resolve => {
        const res = await api.get('https://qplus.io/svc/check');
        resolve(res.body.status === 'ok');
    });
};

module.exports = {
    isTwistlyUp,
    isTumblrBlog,
    getTwistlyApiKey,
    isQplusUp
};
