// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'
import $ from 'jquery';
import Frisbee from 'frisbee';
import api from './api';
import {isTwistlyDown, isTumblrBlog, getTwistlyApiKey} from './helpers';

if (!isTumblrBlog) {
    throw new Error('Not a Tumblr Blog.');
}
if (isTwistlyDown) {
    throw new Error('Twistly is currently down or unreachable, try again later.');
}

const TUMBLR_API_URL = 'https://api.tumblr.com/v2/';
const TUMBLR_API_KEY = '0NCl15FUivI5DeF4Y5xXduUwcveFtvryC45qtcsLAgKfvJGQLp';
const manifest = chrome.runtime.getManifest();
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

const setupOpts = () => {
    return new Promise(async resolve => {
        opts.thisBlog = await tumblrApi(`blog/${window.location.hostname}/info?api_key=${TUMBLR_API_KEY}`, ({body}) => body.response.blog.name);
        opts.apiKey = await getTwistlyApiKey();
        resolve();
    });
};

const setupUi = () => {
    return new Promise(resolve => {
        const navBar = $('#nav_archive');

        navBar.children('.title').eq(0).remove();
        $('#nav_archive').prepend(`<div class="post_count archive-controls"><span class="control_text">Posts: <span class="count">0</span></span></div>`);
        $('#nav_archive').append(`
      <div class="quick_select wrapper-dropdown archive-controls" tabindex="1">
        <a href="#"><span class="control_text">Quick Select</span> <i class="filter_popover_arrow icon_arrow_carrot_down"></i></a>
        <ul class="dropdown"></ul>
      </div>
    `);
        $('#nav_archive').append(`
      <div class="post_button archive-controls">
        <a href="#"><span class="control_text">Post!</span></a>
      </div>
    `);
        $('#nav_archive').append(`
      <div class="queue_button archive-controls">
          <a href="#"><span class="control_text">Queue!</span></a>
      </div>
    `);
        $('.quick_select ul.dropdown').append('<li><a href="#" data-select-type="all">All</a></li>');
        $('.quick_select ul.dropdown').append('<li><a href="#" data-select-type="photos">Photos</a></li>');
        $('.quick_select ul.dropdown').append('<li><a href="#" data-select-type="videos">Videos</a></li>');
        $('.quick_select ul.dropdown').append('<li><a href="#" data-select-type="videosAndPhotos">Photos & Videos</a></li>');
        $('.quick_select ul.dropdown').append('<li><a href="#" data-select-type="gifs">Gifs</a></li>');
        $('.quick_select ul.dropdown').append('<li><a href="#" data-select-type="text">Text</a></li>');
        $('.quick_select ul.dropdown').append('<li><a href="#" data-select-type="originals">Originals</a></li>');

        $('.blue_bar').on('click', '.blog_selector', event => {
            $(this).toggleClass('active');
            event.stopPropagation();
        });
        $('.blue_bar').on('click', '.quick_select', event => {
            $(this).toggleClass('active');
            event.stopPropagation();
        });

        resolve();
    });
};

const addPost = () => {};

Promise.all([setupOpts, setupUi]).then(async () => {
  // Add apiKey to auth header
    api.auth(opts.apiKey);

    const queues = await api.get('/queues');
    opts.currentQueue = queues[0];

    $('#nav_archive').append(`
    <div class="twistly_queue_button archive-controls">
      <a href="#"><span class="control_text">Twistly</span></a>
    </div>
  `);

    $('.post_button').before(`
    <div class="queue_selector wrapper-dropdown archive-controls" tabindex="1">
      <a href="#"><span class="control_text">Queue: <span id="queue_name">${queues[0].name}</span></span> <i class="filter_popover_arrow icon_arrow_carrot_down"></i>
    </a>
    <ul class="dropdown"></ul></div>
  `);

    queues.forEach(queue => {
        $('.queue_selector ul.dropdown').append('<li><a href="#" data-queue=' + JSON.stringify(queue) + '>' + queue.name + '</a></li>');
    });

    $('#nav_archive .quick_select ul li a').on('click', function(e) {
        if ($(this).data('select-type') === 'all') {
            $('.post').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
        } else if ($(this).data('select-type') === 'photos') {
            $('.post.is_photo').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
        } else if ($(this).data('select-type') === 'videos') {
            $('.post.is_video').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
        } else if ($(this).data('select-type') === 'videosAndPhotos') {
            $('.post.is_video').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
            $('.post.is_photo').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
        } else if ($(this).data('select-type') === 'text') {
            $('.post.is_regular').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
        } else if ($(this).data('select-type') === 'gifs') {
            $('.post.is_animated').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
        } else if ($(this).data('select-type') === 'originals') {
            $('.post.is_original').each(function() {
                $(this).addClass('ui-selected');
                addPost($(this));
            });
        }

        e.preventDefault();
        return false;
    });

    $('#nav_archive .blog_selector ul li a').on('click', event => {
        opts.currentQueue = $(this).data('queue');
        event.preventDefault();

        $('#nav_archive .blog_selector a .control_text #queue_name').text($(this).text());
        $('.wrapper-dropdown').removeClass('active');
    });
});
