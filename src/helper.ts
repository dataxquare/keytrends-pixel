import { Config } from './config';

export class Helper {
  static isPresent(variable) {
    return (
      typeof variable !== 'undefined' && variable !== null && variable !== ''
    );
  }

  static now() {
    return new Date();
  }

  static guid() {
    return (
      Config.version +
      '-xxxxxxxx-'.replace(/[x]/g, function (c) {
        const r = (Math.random() * 36) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(36);
      }) +
      new Date().toString()
    );
  }

  // reduces all optional data down to a string
  static optionalData(data: string | object | Function | number | boolean): string{
    if (Helper.isPresent(data) === false) {
      return '';
    } else if (typeof data === 'object') {
      // runs Helper.optionalData again to reduce to string in case something else was returned
      return Helper.optionalData(JSON.stringify(data));
    } else if (typeof data === 'function') {
      // runs the function and calls Helper.optionalData again to reduce further if it isn't a string
      return Helper.optionalData(data());
    } else {
      return String(data);
    }

    return '';
  }
}
