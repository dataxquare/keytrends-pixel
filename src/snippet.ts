export class PixelFunc {
  private window;
  private document: Document;
  private script: string;
  private http: string;
  private opix: string;
  private cacheTime: number;
  public  one;
  private two;
  private three;

  constructor(
    script: string,
    http: string,
    opix: string,
    cacheTime: number,
    one?,
    two?,
    three?
  ) {
    this.window = window;
    this.document = document;
    this.script = script;
    this.http = http;
    this.opix = opix;
    this.cacheTime = cacheTime;
    this.one = one;
    this.two = two;
    this.three = three;
  }

  public pixelFunc() {
    if (this.window[this.opix]) return;

    this.window[this.opix] = function () {
      this.one.process
        // eslint-disable-next-line prefer-spread, prefer-rest-params
        ? this.one.process.apply(this.one, arguments)
        // eslint-disable-next-line prefer-rest-params
        : this.one.queue.push(arguments);
    };

    this.one = this.window[this.opix];

    this.one.queue = [];
    this.one.t = new Date().getTime();

    this.two = document.createElement(this.script);
    this.two.async = 1;
    this.two.src =
      this.http +
      '?t=' +
      Math.ceil(new Date().getTime() / this.cacheTime) * this.cacheTime;

    this.three = document.getElementsByTagName(this.script)[0];
    this.three.parentNode.insertBefore(this.two, this.three);
  }
}

export const PixelSetup = new PixelFunc('script', 'JS_URL', 'OPIX_FUNC', 24 * 60 * 60 * 1000);

PixelSetup.pixelFunc();