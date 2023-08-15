// Open Pixel v1.3.1 | Published By Dockwa | Created By Stuart Yamartino | MIT License
;(function(window, document, pixelFunc, pixelFuncName, pixelEndpoint, versionNumber) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
exports.Config = {
    id: '',
    params: {},
    version: '1.0.0',
    pageLoadOnce: false,
    pageCloseOnce: false,
    externalHost: {
        link: '',
        time: new Date()
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
const config_1 = require("./config");
class Helper {
    static isPresent(variable) {
        return (typeof variable !== 'undefined' && variable !== null && variable !== '');
    }
    static now() {
        return new Date();
    }
    static guid() {
        return (config_1.Config.version +
            '-xxxxxxxx-'.replace(/[x]/g, function (c) {
                var r = (Math.random() * 36) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(36);
            }) +
            new Date().toString());
    }
    // reduces all optional data down to a string
    static optionalData(data) {
        if (Helper.isPresent(data) === false) {
            return '';
        }
        else if (typeof data === 'object') {
            // runs Helper.optionalData again to reduce to string in case something else was returned
            return Helper.optionalData(JSON.stringify(data));
        }
        else if (typeof data === 'function') {
            // runs the function and calls Helper.optionalData again to reduce further if it isn't a string
            return Helper.optionalData(data());
        }
        else {
            return String(data);
        }
        return '';
    }
}
exports.Helper = Helper;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Browser = void 0;
class Browser {
    static nameAndVersion() {
        // http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null)
                return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null)
            M.splice(1, 1, tem[1]);
        return M.join(' ');
    }
    static isMobile() {
        return ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.maxTouchPoints > 0);
    }
    static userAgent() {
        return window.navigator.userAgent;
    }
}
exports.Browser = Browser;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookie = void 0;
const helper_1 = require("./helper");
const url_1 = require("./url");
class Cookie {
    static prefix() {
        return `__${this.pixelFuncName}_`;
    }
    static set(name, value, minutes, path = '/') {
        var expires = '';
        if (helper_1.Helper.isPresent(minutes)) {
            var date = new Date();
            date.setTime(date.getTime() + minutes * 60 * 1000);
            expires = `expires=${date.toDateString()}; `;
        }
        document.cookie = `${this.prefix()}${name}=${value}; ${expires}path=${path}; SameSite=Lax`;
    }
    static get(name) {
        var formatedName = `${this.prefix()}${name}=`;
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(formatedName) == 0)
                return c.substring(formatedName.length, c.length);
        }
        return '';
    }
    static delete(name) {
        this.set(name, '', -100);
    }
    static exists(name) {
        return helper_1.Helper.isPresent(this.get(name));
    }
    static setUtms() {
        var utmArray = [
            'utm_source',
            'utm_medium',
            'utm_term',
            'utm_content',
            'utm_campaign',
            'utm_source_platform',
            'utm_creative_format',
            'utm_marketing_tactic',
        ];
        var exists = false;
        for (var i = 0, l = utmArray.length; i < l; i++) {
            if (helper_1.Helper.isPresent(url_1.Url.getParameterByName(utmArray[i]))) {
                exists = true;
                break;
            }
        }
        if (exists) {
            var val;
            var save = {};
            for (var i = 0, l = utmArray.length; i < l; i++) {
                val = url_1.Url.getParameterByName(utmArray[i]) || '';
                if (helper_1.Helper.isPresent(val)) {
                    save[utmArray[i]] = val;
                }
            }
            this.set('utm', JSON.stringify(save), 30);
        }
    }
    static getUtm(name) {
        if (this.exists('utm')) {
            var utms = JSON.parse(this.get('utm'));
            return name in utms ? utms[name] : '';
        }
        return '';
    }
}
exports.Cookie = Cookie;
Cookie.pixelFuncName = 'keytrends_pixel';

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Url = void 0;
class Url {
    // http://stackoverflow.com/a/901144/1231563
    static getParameterByName(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    static externalHost(link) {
        return link.hostname != location.hostname && link.protocol.indexOf('http') === 0;
    }
}
exports.Url = Url;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pixel = void 0;
const helper_1 = require("./helper");
const config_1 = require("./config");
const cookie_1 = require("./cookie");
const browser_1 = require("./browser");
class Pixel {
    constructor(event, timestamp, optional, endpoint) {
        this.params = [];
        this.params = [];
        this.event = event;
        this.timestamp = timestamp;
        this.optional = helper_1.Helper.optionalData(optional);
        this.pixelEndpoint = endpoint || 'https://pixel.keytrends.com';
        this.buildParams();
        this.send();
    }
    buildParams() {
        var attr = this.getAttribute();
        for (var index in attr) {
            if (attr.hasOwnProperty(index)) {
                this.setParam(index, attr[index](index));
            }
        }
    }
    getAttribute() {
        return Object.assign({ id: () => config_1.Config.id, uid: () => cookie_1.Cookie.get('uid'), ev: () => this.event, ed: () => this.optional, v: () => config_1.Config.version, dl: () => window.location.href, rl: () => document.referrer, ts: () => this.timestamp, de: () => document.characterSet, sr: () => window.screen.width + 'x' + window.screen.height, vp: () => window.innerWidth + 'x' + window.innerHeight, cd: () => window.screen.colorDepth, dt: () => document.title, bn: () => browser_1.Browser.nameAndVersion(), md: () => browser_1.Browser.isMobile(), ua: () => browser_1.Browser.userAgent(), tz: () => new Date().getTimezoneOffset(), utm_source: (key) => cookie_1.Cookie.getUtm(key), utm_medium: (key) => cookie_1.Cookie.getUtm(key), utm_term: (key) => cookie_1.Cookie.getUtm(key), utm_content: (key) => cookie_1.Cookie.getUtm(key), utm_campaign: (key) => cookie_1.Cookie.getUtm(key), utm_source_platform: (key) => cookie_1.Cookie.getUtm(key), utm_creative_format: (key) => cookie_1.Cookie.getUtm(key), utm_marketing_tactic: (key) => cookie_1.Cookie.getUtm(key) }, config_1.Config.params);
    }
    setParam(key, val) {
        if (helper_1.Helper.isPresent(val) && val) {
            this.params.push(`${key}=${encodeURIComponent(val)}`);
        }
        else {
            this.params.push(`${key}=`);
        }
    }
    send() {
        this.sendBeacon();
    }
    sendBeacon() {
        window.navigator.sendBeacon(this.getSourceUrl());
    }
    getSourceUrl() {
        return `${this.pixelEndpoint}?${this.params.join('&')}`;
    }
}
exports.Pixel = Pixel;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = require("./cookie");
const pixel_1 = require("./pixel");
const config_1 = require("./config");
const helper_1 = require("./helper");
const url_1 = require("./url");
const snippet_1 = require("./snippet");
// update the cookie if it exists, if it doesn't, create a new one, lasting 2 years
cookie_1.Cookie.exists('uid')
    ? cookie_1.Cookie.set('uid', cookie_1.Cookie.get('uid'), 2 * 365 * 24 * 60)
    : cookie_1.Cookie.set('uid', helper_1.Helper.guid(), 2 * 365 * 24 * 60);
// save any utms through as session cookies
cookie_1.Cookie.setUtms();
// process the queue and future incoming commands
snippet_1.PixelSetup.one.process = function (method, value, optional) {
    if (method === 'init') {
        config_1.Config.id = value;
    }
    else if (method === 'param') {
        config_1.Config.params[value] = () => optional;
    }
    else if (method === 'event') {
        if (value === 'pageload' && !config_1.Config.pageLoadOnce) {
            // Añadir evento de URL info
            config_1.Config.pageLoadOnce = true;
            new pixel_1.Pixel(value, snippet_1.PixelSetup.one.t, optional);
        }
        else if (value !== 'pageload' && value !== 'pageclose') {
            new pixel_1.Pixel(value, helper_1.Helper.now(), optional);
        }
    }
};
// run the queued calls from the snippet to be processed
let l;
for (var i = 0; l = snippet_1.PixelSetup.one.queue.length; i < l) {
    snippet_1.PixelSetup.one.process.apply(snippet_1.PixelFunc, snippet_1.PixelSetup.one.queue[i]);
    i++;
}
// https://github.com/GoogleChromeLabs/page-lifecycle/blob/master/src/Lifecycle.mjs
// Safari does not reliably fire the `pagehide` or `visibilitychange`
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var isPageHideSupported = 'onpageshow' in self;
// IE9-10 do not support the pagehide event, so we fall back to unload
// pagehide event is more reliable but less broad than unload event for mobile and modern browsers
var pageCloseEvent = isPageHideSupported && !isSafari ? 'pagehide' : 'unload';
window.addEventListener(pageCloseEvent, function () {
    if (!config_1.Config.pageCloseOnce) {
        config_1.Config.pageCloseOnce = true;
        new pixel_1.Pixel('pageclose', helper_1.Helper.now(), function () {
            // if a link was clicked in the last 5 seconds that goes to an external host, pass it through as event data
            const time = helper_1.Helper.now().getTime() - config_1.Config.externalHost.time.getTime();
            if (helper_1.Helper.isPresent(config_1.Config.externalHost) && time < 5 * 1000) {
                return config_1.Config.externalHost.link;
            }
        });
    }
});
window.onload = function () {
    var aTags = document.getElementsByTagName('a');
    for (var i = 0, l = aTags.length; i < l; i++) {
        aTags[i].addEventListener('click', function (_e) {
            if (url_1.Url.externalHost(aTags[i])) {
                config_1.Config.externalHost = {
                    link: aTags[i].href,
                    time: helper_1.Helper.now(),
                };
            }
        }.bind(aTags[i]));
    }
    var dataAttributes = document.querySelectorAll('[data-opix-event]');
    for (var i = 0, l = dataAttributes.length; i < l; i++) {
        dataAttributes[i].addEventListener('click', function (_e) {
            var event = dataAttributes[i].getAttribute('data-opix-event');
            if (event) {
                new pixel_1.Pixel(event, helper_1.Helper.now(), event);
            }
        }.bind(dataAttributes[i]));
    }
};
}(window, document, window["opix"], "opix", "/pixel.gif", 1));
