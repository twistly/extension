import api from './api';

const isTumblrBlog = (document.getElementsByTagName('body')[0].className.indexOf('tumblelog_archive') !== -1);
const isTwistlyDown = () => api('/healthcheck', ({err}) => Boolean(err));

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
  isTwistlyDown,
  isTumblrBlog,
  getTwistlyApiKey
};
