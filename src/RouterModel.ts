import {
  History,
  createBrowserHistory,
  createHashHistory,
  Action,
  Location,
  LocationState,
  Path,
} from 'history';
import { getHistory, setHistory } from './history';
import { Model } from '@redux-model/web';
import { ForgetRegisterError } from '@redux-model/web/core/exceptions/ForgetRegisterError';

interface Data {
  location: Location,
  action: Action,
}

class RouterModel extends Model<Data> {
  protected readonly actionPush = this.actionNormal(() => {
    return {
      location: this.getHistory().location,
      action: this.getHistory().action,
    }
  });

  protected readonly actionReplace = this.actionNormal(() => {
    return {
      location: this.getHistory().location,
      action: this.getHistory().action,
    }
  });

  protected readonly actionGo = this.actionNormal(() => {
    return {
      location: this.getHistory().location,
      action: this.getHistory().action,
    }
  });

  protected readonly actionGoBack = this.actionNormal(() => {
    return {
      location: this.getHistory().location,
      action: this.getHistory().action,
    }
  });

  protected readonly actionGoForward = this.actionNormal(() => {
    return {
      location: this.getHistory().location,
      action: this.getHistory().action,
    }
  });

  public push(path: Path, state?: LocationState) {
    this.getHistory().push(path, state);
    this.actionPush();
  }

  public replace(path: Path, state?: LocationState) {
    this.getHistory().replace(path, state);
    this.actionReplace();
  }

  public go(index: number) {
    this.getHistory().go(index);
    this.actionGo();
  }

  public goBack() {
    this.getHistory().goBack();
    this.actionGoBack();
  }

  public goForward() {
    this.getHistory().goForward();
    this.actionGoForward();
  }

  public registerBrowser(history?: History) {
    setHistory(history || getHistory() || createBrowserHistory());

    return this.register();
  }

  public registerHash(history?: History) {
    setHistory(history || getHistory() || createHashHistory());

    return this.register();
  }

  public register() {
    if (!getHistory()) {
      throw new ReferenceError('Use "registerBrowser()" or "registerHash()" for routerModel.');
    }

    return super.register();
  }

  public getHistory(): History {
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
