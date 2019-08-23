import {
  Action,
  createBrowserHistory,
  createHashHistory,
  History,
  Location,
  LocationState,
  Path,
  UnregisterCallback,
} from 'history';
import pathToRegexp, { Key } from 'path-to-regexp';
import { ForgetRegisterError } from '@redux-model/web/core/exceptions/ForgetRegisterError';
import { Model } from '@redux-model/web';
import { getHistory, setHistory } from './history';

interface Data {
  location: Location,
  action: Action,
}

type UnsubscribeToken = string;

interface Subscriber {
  path: Path;
  reg: RegExp;
  keys: Key[];
  fn: (params: any, location: Location, action: Action) => void;
  token: UnsubscribeToken;
}

class RouterModel extends Model<Data> {
  protected isRegistered = false;

  protected unregister: UnregisterCallback | undefined;

  protected pathListeners: Array<Subscriber> = [];

  protected readonly changeHistory = this.actionNormal((_, payload: Data) => {
    return payload;
  });

  public push(path: Path, state?: LocationState) {
    this.getHistory().push(path, state);
  }

  public replace(path: Path, state?: LocationState) {
    this.getHistory().replace(path, state);
  }

  public go(index: number) {
    this.getHistory().go(index);
  }

  public goBack() {
    this.getHistory().goBack();
  }

  public goForward() {
    this.getHistory().goForward();
  }

  public subscribe<Params = any>(path: Path, fn: (params: Params, location: Location, action: Action) => void): UnsubscribeToken {
    const token = `un_${this.pathListeners.length}_${Math.random()}`;
    const keys: Key[] = [];
    const reg = pathToRegexp(path, keys);
    const subscriber = { path, fn, reg, keys, token };

    this.pathListeners.push(subscriber);

    if (this.isRegistered) {
      this.publishOne(subscriber, this.data.location, this.data.action);
    }

    return token;
  }

  public unsubscribe(token: string): void {
    this.pathListeners = this.pathListeners.filter((item) => {
      return item.token !== token;
    });
  }

  public registerBrowser(history?: History) {
    const originalHistory = getHistory();
    const newHistory = history || originalHistory || createBrowserHistory();
    setHistory(newHistory);

    if (originalHistory && originalHistory !== newHistory && this.unregister) {
      this.unregister();
    }

    return this.register();
  }

  public registerHash(history?: History) {
    const originalHistory = getHistory();
    const newHistory = history || originalHistory || createHashHistory();
    setHistory(newHistory);

    if (originalHistory && originalHistory !== newHistory && this.unregister) {
      this.unregister();
    }

    return this.register();
  }

  public register() {
    const history = getHistory();

    if (!history) {
      throw new ReferenceError('Use "registerBrowser()" or "registerHash()" for routerModel.');
    }

    if (!this.unregister) {
      this.unregister = history.listen((location, action) => {
        this.changeHistory({
          location,
          action,
        });
        this.publishAll(location, action);
      });
    }

    return super.register();
  }

  protected publishAll(location: Location, action: Action) {
    this.pathListeners.forEach((subscriber) => {
      this.publishOne(subscriber, location, action);
    });
  }

  protected publishOne({ fn, reg, keys }: Subscriber, location: Location, action: Action) {
    const result = reg.exec(location.pathname);

    if (result === null) {
      return;
    }

    const params: Record<string, string> = {};

    keys.forEach(({ name }, index) => {
      params[name] = result[index + 1];
    });

    fn(params, location, action);
  }

  protected getHistory(): History {
    const history = getHistory();

    if (!history) {
      throw new ForgetRegisterError('RouterModel');
    }

    return history;
  }

  protected initReducer(): Data | (() => Data) {
    return () => {
      const history = this.getHistory();

      setTimeout(() => {
        this.publishAll(history.location, history.action);
      }, 0);

      this.isRegistered = true;

      return {
        location: history.location,
        action: history.action,
      };
    };
  }
}

export const routerModel = new RouterModel();
