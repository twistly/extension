import api from './api';

const isTumblrBlog = (document.getElementsByTagName('body')[0].className.indexOf('tumblelog_archive') !== -1);
const isTwistlyUp = () => {
    return new Promise(async resolve => {
        const res = await api.get('/');
        resolve(res.body.status === 200);
    });
};

const getTwistlyApiKey = () => {
    return new Promise(resolve => {
        chrome.storage.sync.get({
            apiKey: null
        }, items => {
            resolve(items.apiKey);
        });
    });
};

export {
  isTwistlyUp,
  isTumblrBlog,
  getTwistlyApiKey
};
