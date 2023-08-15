import { Cookie } from './cookie';
import { Pixel } from './pixel';
import { Config } from './config';
import { Helper } from './helper';
import { Url } from './url';
import { PixelFunc, PixelSetup } from './snippet';

// update the cookie if it exists, if it doesn't, create a new one, lasting 2 years
Cookie.exists('uid')
  ? Cookie.set('uid', Cookie.get('uid'), 2 * 365 * 24 * 60)
  : Cookie.set('uid', Helper.guid(), 2 * 365 * 24 * 60);
// save any utms through as session cookies
Cookie.setUtms();

// process the queue and future incoming commands
PixelSetup.one.process = function (
  method: 'init' | 'param' | 'event',
  value: string,
  optional: string | object | Function | number | boolean
) {
  if (method === 'init') {
    Config.id = value;
  } else if (method === 'param') {
    Config.params[value] = () => optional;
  } else if (method === 'event') {
    if (value === 'pageload' && !Config.pageLoadOnce) {
      // Añadir evento de URL info
      Config.pageLoadOnce = true;
      new Pixel(value, PixelSetup.one.t, optional);
    } else if (value !== 'pageload' && value !== 'pageclose') {
      new Pixel(value, Helper.now(), optional);
    }
  }
};

// run the queued calls from the snippet to be processed
const l: number = PixelSetup.one.queue.length;
for (let i = 0; i < l; i++) {
  PixelSetup.one.process.apply(PixelFunc, PixelSetup.one.queue[i]);
  i++;
}

// https://github.com/GoogleChromeLabs/page-lifecycle/blob/master/src/Lifecycle.mjs
// Safari does not reliably fire the `pagehide` or `visibilitychange`
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isPageHideSupported = 'onpageshow' in self;

// IE9-10 do not support the pagehide event, so we fall back to unload
// pagehide event is more reliable but less broad than unload event for mobile and modern browsers
const pageCloseEvent = isPageHideSupported && !isSafari ? 'pagehide' : 'unload';

window.addEventListener(pageCloseEvent, function () {
  if (!Config.pageCloseOnce) {
    Config.pageCloseOnce = true;
    new Pixel('pageclose', Helper.now(), function () {
      // if a link was clicked in the last 5 seconds that goes to an external host, pass it through as event data
      const time = Helper.now().getTime() - Config.externalHost.time.getTime();
      if (Helper.isPresent(Config.externalHost) && time < 5 * 1000) {
        return Config.externalHost.link;
      }
    });
  }
});

window.onload = function () {
  const aTags = document.getElementsByTagName('a');
  for (let i = 0, l = aTags.length; i < l; i++) {
    aTags[i].addEventListener(
      'click',
      function () {
        if (Url.externalHost(aTags[i])) {
          Config.externalHost = {
            link: aTags[i].href,
            time: Helper.now(),
          };
        }
      }.bind(aTags[i])
    );
  }

  const dataAttributes = document.querySelectorAll('[data-OPIX_FUNC-event]');
  for (let i = 0, l = dataAttributes.length; i < l; i++) {
    dataAttributes[i].addEventListener(
      'click',
      function () {
        const event = dataAttributes[i].getAttribute('data-OPIX_FUNC-event');
        if (event) {
          new Pixel(event, Helper.now(), event);
        }
      }.bind(dataAttributes[i])
    );
  }
};
