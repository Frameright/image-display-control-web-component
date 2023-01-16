export class Logger {
  constructor(id: string, level: string | undefined) {
    this._id = id;
    this._level = Logger._toValue(level);
  }

  setLevel(level: string | undefined) {
    this._level = Logger._toValue(level);
  }

  setId(id: string) {
    this._id = id;
  }

  debug(text: string) {
    if (this._level >= Logger._DEBUG) {
      // eslint-disable-next-line no-console
      console.log(this._consoleText(text));
    }
  }

  warn(text: string) {
    if (this._level >= Logger._WARN) {
      // eslint-disable-next-line no-console
      console.warn(this._consoleText(text));
    }
  }

  error(text: string) {
    if (this._level >= Logger._ERROR) {
      // eslint-disable-next-line no-console
      console.error(this._consoleText(text));
    }
  }

  private static readonly _OFF = 0;
  private static readonly _FATAL = 1;
  private static readonly _ERROR = 2;
  private static readonly _WARN = 3;
  private static readonly _INFO = 4;
  private static readonly _DEBUG = 5;

  private static _toValue(level: string | undefined): number {
    const loglevel = (level || '').toLowerCase();
    if (loglevel === 'debug') {
      return Logger._DEBUG;
    }
    if (loglevel === 'trace') {
      return Logger._DEBUG;
    }
    if (loglevel === 'notice') {
      return Logger._DEBUG;
    }
    if (loglevel === 'info') {
      return Logger._INFO;
    }
    if (loglevel.startsWith('warn')) {
      return Logger._WARN;
    }
    if (loglevel.startsWith('err')) {
      return Logger._ERROR;
    }
    if (loglevel === 'fatal') {
      return Logger._FATAL;
    }
    return Logger._OFF;
  }

  private _consoleText(text: string) {
    return this._id ? `[${this._id}] ${text}` : text;
  }

  private _id: string;
  private _level: number;
}
