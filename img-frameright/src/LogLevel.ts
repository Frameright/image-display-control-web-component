export class LogLevel {
  constructor(description: string) {
    this._value = LogLevel._toValue(description);
  }

  valueOf(): number {
    return this._value;
  }

  toString(): string {
    return `LogLevel(${this._value})`;
  }

  private static readonly _FATAL = 0;
  private static readonly _ERROR = 1;
  private static readonly _WARN = 2;
  private static readonly _INFO = 3;
  private static readonly _DEBUG = 4;

  private static _toValue(description: string) {
    const loglevel = description.toLowerCase();
    if (loglevel === 'debug') {
      return LogLevel._DEBUG;
    }
    if (loglevel === 'trace') {
      return LogLevel._DEBUG;
    }
    if (loglevel === 'notice') {
      return LogLevel._DEBUG;
    }
    if (loglevel === 'info') {
      return LogLevel._INFO;
    }
    if (loglevel.startsWith('warn')) {
      return LogLevel._WARN;
    }
    if (loglevel.startsWith('err')) {
      return LogLevel._ERROR;
    }
    return LogLevel._FATAL;
  }

  private _value: number;
}

export const DEBUG = new LogLevel('debug');
export const INFO = new LogLevel('info');
export const WARN = new LogLevel('warn');
export const ERROR = new LogLevel('error');
export const FATAL = new LogLevel('fatal');
