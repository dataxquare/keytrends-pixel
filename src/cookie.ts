import { Helper } from './helper';
import { Url } from './url';

export class Cookie {
  static pixelFuncName = 'keytrends_pixel';

  static prefix() {
    return `__${this.pixelFuncName}_`;
  }

  static set(name: string, value: string, minutes: number, path = '/') {
    let expires = '';
    if (Helper.isPresent(minutes)) {
      const date = new Date();
      date.setTime(date.getTime() + minutes * 60 * 1000);
      expires = `expires=${date.toDateString()}; `;
    }
    document.cookie = `${this.prefix()}${name}=${value}; ${expires}path=${path}; SameSite=Lax`;
  }

  static get(name: string) {
    const formatedName = `${this.prefix()}${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(formatedName) == 0)
        return c.substring(formatedName.length, c.length);
    }

    return '';
  }

  static delete(name: string) {
    this.set(name, '', -100);
  }

  static exists(name: string) {
    return Helper.isPresent(this.get(name));
  }

  static setUtms() {
    const utmArray: string[] = [
      'utm_source',
      'utm_medium',
      'utm_term',
      'utm_content',
      'utm_campaign',
      'utm_source_platform',
      'utm_creative_format',
      'utm_marketing_tactic',
    ];
    let exists = false;
    for (let i = 0, l = utmArray.length; i < l; i++) {
      if (Helper.isPresent(Url.getParameterByName(utmArray[i]))) {
        exists = true;
        break;
      }
    }
    if (exists) {
      let val: string;
      const save: Record<string, string> = {};
      for (let i = 0, l = utmArray.length; i < l; i++) {
        val = Url.getParameterByName(utmArray[i]) || '';
        if (Helper.isPresent(val)) {
          save[utmArray[i]] = val;
        }
      }
      this.set('utm', JSON.stringify(save), 30);
    }
  }

  static getUtm(name: string): string {
    if (this.exists('utm')) {
      const utms = JSON.parse(this.get('utm'));
      
      return name in utms ? utms[name] : '';
    }

    return '';
  }
}
