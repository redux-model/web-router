import { History, Action, Location, LocationState, LocationDescriptorObject, Path } from 'history';
import { Model } from '@redux-model/web';
import { Reducers } from '@redux-model/web/core/utils/types';

interface Data {
    location: Location;
    action: Action;
}

declare class RouterModel extends Model<Data> {
    push(path: Path, state?: LocationState): void;
    push<S = LocationState>(location: LocationDescriptorObject<S>): void;
    replace(path: Path, state?: LocationState): void;
    replace<S = LocationState>(location: LocationDescriptorObject<S>): void;
    go(index: number): void;
    goBack(): void;
    goForward(): void;

    registerBrowser(history?: History): Reducers;
    registerHash(history?: History): Reducers;

    getHistory(): History;

    protected initReducer(): (() => Data) | Data;
}

export declare const routerModel: RouterModel;
