import {
  Action,
  History,
  Location,
  UnregisterCallback,
} from 'history';
import { Store } from 'redux';
import { Key, pathToRegexp, Path as RegPath } from 'path-to-regexp';
import { Model } from '@redux-model/react';
import { getHistory, setHistory } from './history';

export type RouterLocation = Location;
export type RouterAction = Action;

interface Data {
  location: RouterLocation,
  action: RouterAction,
}

type Subscriber = {
  path: RegPath | object;
  reg?: RegExp;
  keys?: Key[];
  fn: Function;
  token: string;
}

const LISTEN_ALL = {};

export abstract class RouterModel extends Model<Data> {
  protected isInitialized = false;

  protected unregister: UnregisterCallback | undefined;

  protected pathListeners: Array<Subscriber> = [];

  protected readonly customHistory?: History;

  constructor(history?: History, alias: string = '') {
    super(alias);
    this.customHistory = history;
  }

  protected readonly changeHistory = this.action((_, payload: Data) => {
    return payload;
  });

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
    path: RegPath,
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

  public getHistory(): History {
    const history = getHistory();

    return history!;
  }

  public register() {
    const originalHistory = getHistory();
    const newHistory = this.customHistory || originalHistory || this.createHistory();
    setHistory(newHistory);

    if (originalHistory && originalHistory !== newHistory && this.unregister) {
      this.unregister();
    }

    if (!this.unregister) {
      this.unregister = newHistory.listen((location, action) => {
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

  protected onStoreCreated(store: Store): void {
    super.onStoreCreated(store);
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

  protected abstract createHistory(): History;
}
