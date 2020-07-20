import { createBrowserHistory } from 'history';
import { RouterModel } from './RouterModel';

export class BrowserRouterModel extends RouterModel {   
  protected createHistory() {
    return createBrowserHistory();
  }
}