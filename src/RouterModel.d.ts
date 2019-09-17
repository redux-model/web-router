import { History, Action, Location, LocationState, LocationDescriptorObject, Path } from 'history';
import { Model } from '@redux-model/web';
import { Reducers } from '@redux-model/web/core/utils/types';

interface Data {
  location: Location;
  action: Action;
}

type UnsubscribeToken = string;

declare class RouterModel extends Model<Data> {
  // They are properties exactly.
  push(path: Path, state?: LocationState): void;
  push<S = LocationState>(location: LocationDescriptorObject<S>): void;
  replace(path: Path, state?: LocationState): void;
  replace<S = LocationState>(location: LocationDescriptorObject<S>): void;
  go(index: number): void;
  goBack(): void;
  goForward(): void;

  getHistory(): History;
  subscribe<Params = any>(path: Path, fn: (params: Params, location: Location, action: Action) => void): UnsubscribeToken;
  unsubscribe(token: string): void;
  registerBrowser(history?: History): Reducers;
  registerHash(history?: History): Reducers;

  /**
   * @deprecated Use registerBrowser() or registerHash()
   */
  register(): Reducers;

  protected initReducer(): (() => Data) | Data;
}

export declare const routerModel: RouterModel;
