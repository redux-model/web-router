import { createBrowserHistory, LocationState, Path } from 'history';
import { RouterModel } from './RouterModel';

export class BrowserRouterModel extends RouterModel {
  public push = (path: Path, state?: LocationState) => {
    this.getHistory().push(path, state);
  };

  public replace = (path: Path, state?: LocationState) => {
    this.getHistory().replace(path, state);
  };

  protected createHistory() {
    return createBrowserHistory();
  }
}
