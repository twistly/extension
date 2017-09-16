const Frisbee = require('frisbee');
const chromeStoragePromise = require('chrome-storage-promise');
const api = require('./api');

const isTumblrBlog = (document.getElementsByTagName('body')[0].className.indexOf('tumblelog_archive') !== -1);
const isTwistlyUp = () => {
    return new Promise(async resolve => {
        const res = await api.get('/');
        resolve(res.status === 200);
    });
};

const getTwistlyApiKey = async () => {
    const {apiKey} = await chromeStoragePromise.sync.get('apiKey');
    return apiKey;
};

const isQplusUp = () => {
    return new Promise(async resolve => {
        const qplus = new Frisbee({
            baseURI: 'https://qplus.io/svc/',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const res = await qplus.get('check');

        // @NOTE
        // ok means loggedin
        // meh means loggedout
        resolve((res.body.status === 'ok') || (res.body.status === 'meh'));
    });
};

module.exports = {
    isTwistlyUp,
    isTumblrBlog,
    getTwistlyApiKey,
    isQplusUp
};
