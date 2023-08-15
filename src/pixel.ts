import { Helper } from './helper';
import { Config } from './config';
import { Cookie } from './cookie';
import { Browser } from './browser';

export class Pixel {
  public params: string[] = [];
  public event: string;
  public timestamp: Date;
  public optional: string;
  public pixelEndpoint: string;

  constructor(
    event: string,
    timestamp: Date,
    optional: string | object | Function | number | boolean,
    endpoint?: string
  ) {
    this.params = [];
    this.event = event;
    this.timestamp = timestamp;
    this.optional = Helper.optionalData(optional);
    this.pixelEndpoint = endpoint || 'https://pixel.keytrends.com';
    this.buildParams();
    this.send();
  }

  buildParams() {
    const attr = this.getAttribute();
    for (const index in attr) {
      if (attr[index]) {
        this.setParam(index, attr[index](index));
      }
    }
  }

  getAttribute(): Record<string, Function> {
    return {
      id: () => Config.id, // website Id
      uid: () => Cookie.get('uid'), // user Id
      ev: () => this.event, // event being triggered
      ed: () => this.optional, // any event data to pass along
      v: () => Config.version, // openpixel.js version
      dl: () => window.location.href, // document location
      rl: () => document.referrer, // referrer location
      ts: () => this.timestamp, // timestamp when event was triggered
      de: () => document.characterSet, // document encoding
      sr: () => window.screen.width + 'x' + window.screen.height, // screen resolution
      vp: () => window.innerWidth + 'x' + window.innerHeight, // viewport size
      cd: () => window.screen.colorDepth, // color depth
      dt: () => document.title, // document title
      bn: () => Browser.nameAndVersion(), // browser name and version number
      md: () => Browser.isMobile(), // is a mobile device?
      ua: () => Browser.userAgent(), // user agent
      tz: () => new Date().getTimezoneOffset(), // timezone
      utm_source: (key: string) => Cookie.getUtm(key), // get the utm source
      utm_medium: (key: string) => Cookie.getUtm(key), // get the utm medium
      utm_term: (key: string) => Cookie.getUtm(key), // get the utm term
      utm_content: (key: string) => Cookie.getUtm(key), // get the utm content
      utm_campaign: (key: string) => Cookie.getUtm(key), // get the utm campaign
      utm_source_platform: (key: string) => Cookie.getUtm(key), // get the utm source platform
      utm_creative_format: (key: string) => Cookie.getUtm(key), // get the utm creative format
      utm_marketing_tactic: (key: string) => Cookie.getUtm(key), // get the utm marketing tactic
      ...Config.params,
    };
  }

  setParam(key: string, val?: string) {
    if (Helper.isPresent(val) && val) {
      this.params.push(`${key}=${encodeURIComponent(val)}`);
    } else {
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
