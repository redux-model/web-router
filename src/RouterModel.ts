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

class RouterModel extends Model<Data> {
  protected unregister: UnregisterCallback | undefined;

  protected pathListeners: Array<{
    path: Path;
    reg: RegExp;
    keys: Key[];
    fn: (params: any, location: Location, action: Action) => void;
  }> = [];

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

  public addListener<Params = any>(path: Path, fn: (params: Params, location: Location, action: Action) => void): void {
    const keys: Key[] = [];
    const reg = pathToRegexp(path, keys);
    this.pathListeners.push({ path, fn, reg, keys });
  }

  public removeListener<Params = any>(path: Path, fn: (params: Params, location: Location, action: Action) => void): void {
    this.pathListeners = this.pathListeners.filter((item) => {
      return path !== item.path || fn !== item.fn;
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
      this.unregister = history.listen(this.onHistoryChange.bind(this));
    }

    return super.register();
  }

  protected onHistoryChange(location: Location, action: Action) {
    this.changeHistory({
      location,
      action,
    });

    this.pathListeners.forEach(({ fn, reg, keys }) => {
      const result = reg.exec(location.pathname);

      if (result === null) {
        return;
      }

      const params: Record<string, string> = {};

      keys.forEach(({ name }, index) => {
        params[name] = result[index + 1];
      });

      fn(params, location, action);
    });
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
      return {
        location: this.getHistory().location,
        action: this.getHistory().action,
      };
    };
  }
}

export const routerModel = new RouterModel();
