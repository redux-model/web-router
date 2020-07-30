import { createHashHistory, Path } from 'history';
import { RouterModel } from './RouterModel';

export class HashRouterModel extends RouterModel {
  public push = (path: Path) => {
    if (this.data.location.pathname !== path) {
      this.getHistory().push(path);
    }
  };

  public replace = (path: Path) => {
    this.getHistory().replace(path);
  };

  protected createHistory() {
    return createHashHistory();
  }
}
