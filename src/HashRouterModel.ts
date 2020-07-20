import { createHashHistory } from 'history';
import { RouterModel } from './RouterModel';

export class HashRouterModel extends RouterModel {
  protected createHistory() {
    return createHashHistory();
  }
}