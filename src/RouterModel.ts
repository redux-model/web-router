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

export type RouterLocation = Location;
export type RouterAction = Action;

interface Data {
  location: RouterLocation,
  action: RouterAction,
}

type Subscriber = {
  path: Path | object;
  reg?: RegExp;
  keys?: Key[];
  fn: Function;
  token: string;
}

const LISTEN_ALL = {};

class RouterModel extends Model<Data> {
  protected isInitialized = false;

  protected unregister: UnregisterCallback | undefined;

  protected pathListeners: Array<Subscriber> = [];

  protected readonly changeHistory = this.actionNormal((_, payload: Data) => {
    return payload;
  });

  public push = (path: Path, state?: LocationState) => {
    this.getHistory().push(path, state);
  };

  public replace = (path: Path, state?: LocationState) => {
    this.getHistory().replace(path, state);
  };

  public go = (index: number) => {
    this.getHistory().go(index);
  };

  public goBack = () => {
    this.getHistory().goBack();
  };

  public goForward = () => {
    this.getHistory().goForward();
  };

  public listenPath<Params = Record<string, string>>(
    path: Path,
    fn: (params: Params, location: RouterLocation, action: RouterAction) => void
  ): string {
    const token = `un_${this.pathListeners.length}_${Math.random()}`;
    const keys: Key[] = [];
    const reg = pathToRegexp(path, keys);
    const subscriber: Subscriber = { path, fn, reg, keys, token };

    this.pathListeners.push(subscriber);

    if (this.isInitialized) {
      this.publishOne(subscriber, this.data.location, this.data.action);
    }

    return token;
  }

  public listenAll(fn: (location: RouterLocation, action: RouterAction) => void): string {
    const token = `un_${this.pathListeners.length}_${Math.random()}`;
    const subscriber: Subscriber = { path: LISTEN_ALL, fn, token };

    this.pathListeners.push(subscriber);

    if (this.isInitialized) {
      this.publishOne(subscriber, this.data.location, this.data.action);
    }

    return token;
  }

  public unlisten(token?: string): void {
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

  public getHistory(): History {
    const history = getHistory();

    if (!history) {
      throw new ForgetRegisterError('RouterModel');
    }

    return history;
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

  protected publishAll(location: RouterLocation, action: RouterAction) {
    this.pathListeners.forEach((subscriber) => {
      this.publishOne(subscriber, location, action);
    });
  }

  protected publishOne(subscriber: Subscriber, location: RouterLocation, action: RouterAction) {
    if (subscriber.path === LISTEN_ALL) {
      return subscriber.fn(location, action);
    }

    const result = subscriber.reg!.exec(location.pathname);

    if (result === null) {
      return;
    }

    const params: Record<string, string> = {};

    subscriber.keys!.forEach(({ name }, index) => {
      params[name] = result[index + 1];
    });

    subscriber.fn(params, location, action);
  }

  protected onReducerCreated(store): void {
    super.onReducerCreated(store);
    this.publishAll(this.data.location, this.data.action);
    this.isInitialized = true;
  }

  protected initReducer(): Data {
    const history = this.getHistory();

    return {
      location: history.location,
      action: history.action,
    };
  }
}

export const routerModel = new RouterModel();
