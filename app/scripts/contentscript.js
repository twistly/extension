const $ = require('jquery');
const Frisbee = require('frisbee');
const api = require('./api');
const {isTwistlyUp, isTumblrBlog, getTwistlyApiKey} = require('./helpers');

if (!isTumblrBlog) {
    throw new Error('Not a Tumblr Blog.');
}
if (!isTwistlyUp()) {
    throw new Error('Twistly is currently down or unreachable, try again later.');
}

const TUMBLR_API_URL = 'https://api.tumblr.com/v2/';
const TUMBLR_API_KEY = '0NCl15FUivI5DeF4Y5xXduUwcveFtvryC45qtcsLAgKfvJGQLp';
const manifest = chrome.runtime.getManifest();
const endPoints = [{
    name: 'Tumblr'
}, {
    name: 'Twistly',
    release: 'BETA'
}, {
    name: 'Qplus',
    release: 'BETA'
}];
const opts = {
    posts: {},
    formKey: null,
    currentQueue: {},
    queues: [],
    thisBlog: null,
    apiKey: null,
    waitingForPostKeys: {},
    postCache: {},
    version: manifest.version
};

const tumblrApi = new Frisbee({
    baseURI: TUMBLR_API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

const isArchivePosterInstalled = () => {
    return new Promise(resolve => {
        for (const script of document.getElementsByTagName('script')) {
            if (script.src.indexOf('assets.tumblr.com/assets/scripts/vendor/tiny_mce_3_5_10/tiny_mce.js') !== -1) {
                return resolve(true);
            }
        }
        return resolve(false);
    });
};

const setupOpts = () => {
    return new Promise(async resolve => {
        const {body} = await tumblrApi.get(`blog/${window.location.hostname}/info?api_key=${TUMBLR_API_KEY}`);

        opts.thisBlog = body.response.blog.name;
        opts.apiKey = await getTwistlyApiKey();

        resolve();
    });
};

const typeLookup = lookup => {
    const types = {
        all: '',
        photos: '.is_photo',
        videos: '.is_video',
        text: '.is_regular',
        gif: '.is_animated',
        originals: '.is_original'
    };

    if (Array.isArray(lookup)) {
        return lookup.map(type => types[type] || null).filter(type => type !== null);
    }

    if (typeof lookup === 'string') {
        return types[lookup];
    }
};

const dropDown = event => {
    const wasActive = $(event.currentTarget).hasClass('active');
    $(event.currentTarget).parent().parent().find('.wrapper-dropdown').removeClass('active');

    if (!wasActive) {
        $(event.currentTarget).addClass('active');
    }
    event.stopPropagation();
};

const setupUi = () => {
    return new Promise(resolve => {
        const navBar = $('#nav_archive');
        const endPointsHtml = endPoints.map(endpoint => {
            return `
                <li>
                    <a href="#" data-endpoint="${endpoint.name.toLowerCase()}">
                        ${endpoint.name}${endpoint.release ? ' [' + endpoint.release + ']' : ''}
                    </a>
                </li>
            `;
        }).join('');

        navBar.children('.title').eq(0).remove();
        $('#nav_archive').prepend(`<div class="post_count archive-controls"><span class="control_text">Posts: <span class="count">0</span></span></div>`);
        $('#nav_archive').append(`
          <div class="quick_select wrapper-dropdown archive-controls">
            <a href="#"><span class="control_text">Quick Select</span> <i class="filter_popover_arrow icon_arrow_carrot_down"></i></a>
            <ul class="dropdown">
                <li><a href="#" data-select-type="all">All</a></li>
                <li><a href="#" data-select-type="photos">Photos</a></li>
                <li><a href="#" data-select-type="videos">Videos</a></li>
                <li><a href="#" data-select-type="videos&photos">Photos & Videos</a></li>
                <li><a href="#" data-select-type="gifs">Gifs</a></li>
                <li><a href="#" data-select-type="text">Text</a></li>
                <li><a href="#" data-select-type="originals">Originals</a></li>
            </ul>
          </div>
        `);

        $('#nav_archive').append(`
          <div class="post_button wrapper-dropdown archive-controls">
            <a href="#"><span class="control_text">Post!</span> <i class="filter_popover_arrow icon_arrow_carrot_down"></i></a>
            <ul class="dropdown">${endPointsHtml}</ul>
          </div>
        `);

        $('#nav_archive').append(`
            <div class="queue_button wrapper-dropdown archive-controls">
              <a href="#"><span class="control_text">Queue!</span> <i class="filter_popover_arrow icon_arrow_carrot_down"></i></a>
              <ul class="dropdown">${endPointsHtml}</ul>
            </div>
        `);

        $('.blue_bar').on('click', '.post_button', dropDown);
        $('.blue_bar').on('click', '.queue_button', dropDown);
        $('.blue_bar').on('click', '.quick_select', dropDown);
        $('.blue_bar').on('click', '.queue_selector', dropDown);

        resolve();
    });
};

// Need to add .post class to all options passed or scope to posts parent div
const addPost = post => {
    opts.posts.push(post);
};

// Type refers to queue or post
const sendPosts = (endPoint, type) => {
    if (!Object.keys(endPoints).includes(endPoint)) {
        return new Error(`${endPoint} isn't currently supported, please choose one from [${Object.keys(endPoints).join(', ')}]`);
    }

    if (endPoint === 'tumblr') {
        // @TODO
    }

    if (endPoint === 'twistly') {
        // @TODO
    }

    if (endPoint === 'qplus') {
        // @TODO
    }
};

const init = async () => {
    await setupOpts();
    await setupUi();

    const {err, body} = await api.get(`/queue?api_key=${opts.apiKey}`);

    if (err) {
        return console.error(err);
    }

    if (body.length === 0) {
        return;
    }

    const {queues} = body;

    opts.currentQueue = queues[0];

    $('.post_button').before(`
      <div class="queue_selector wrapper-dropdown archive-controls">
        <a href="#"><span class="control_text">Queue: <span id="queue_name">${queues[0].name}</span></span> <i class="filter_popover_arrow icon_arrow_carrot_down"></i>
      </a>
      <ul class="dropdown"></ul></div>
    `);

    queues.forEach(queue => {
        $('.queue_selector ul.dropdown').append('<li><a href="#" data-queue=' + JSON.stringify(queue) + '>' + queue.name + '</a></li>');
    });

    $('#nav_archive .quick_select ul li a').on('click', event => {
        const selectedType = $(event.currentTarget).data('select-type');
        const posts = typeLookup(selectedType.split('&'));

        event.preventDefault();

        $(posts).forEach(post => addPost(post));
    });

    $('#nav_archive .queue_selector ul li a').on('click', event => {
        const queueName = $(event.currentTarget).text();
        opts.currentQueue = $(event.currentTarget).data('queue');

        event.preventDefault();

        $('#nav_archive .blog_selector a .control_text #queue_name').text(queueName);
        $('.wrapper-dropdown').removeClass('active');
    });
    console.log('Booted Twistly!');
};

$(document).ready(() => {
    isArchivePosterInstalled().then(async installed => {
        if (installed) {
            return console.error(`Can't run Twistly since Archive Poster is installed.`);
        }

        console.info('Booting Twistly!');
        init();
    });
});
