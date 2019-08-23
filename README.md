## redux-model-router

A model for router based on [@redux-model/web](https://github.com/fwh1990/redux-model-ts)

## installation

```bash
yarn add @redux-model/web-router

# or

npm install @redux-model/web-router
```

## Register

### Register Browser history

```typescript
import { routerModel } from '@redux-model/web-router';

const reducers = {
   ...routerModel.registerBrowser(),
};
```

### Register Hash history

```typescript
import { routerModel } from '@redux-model/web-router';

const reducers = {
   ...routerModel.registerHash(),
};
```

## Methods

`push`, `replace`, `go`, `goBack`, `goForward`

```typescript
import { routerModel } from '@redux-model/web-router';

routerModel.push('/user');
routerModel.goBack();
```

## Listeners

```typescript
import { Model } from '@redux-model/web';
import { routerModel } from '@redux-model/web-router';

class TestModel extends Model<Data> {
    protected onInit() {
        routerModel.subscribe('/user/:id', ({ id }, location, action) => {
           console.log(id);
        });
        
        const token = routerModel.subscribe('/article/:id/category/:cate', ({ id, cate }, location, action) => {
            console.log(id);
            console.log(cate);
        });
    
        // In some case, you don't want to listen it any more.
        routerModel.unsubscribe(token);
    }
}

export const testModel = new TestModel();
```

## Data

### In Hooks
```typescript jsx
import { routerModel } from '@redux-model/web-router';

const App = () => {
  const { location, action } = routerModel.useData();

  return <div />;
};
```

### In Component

```typescript jsx
import { routerModel } from '@redux-model/web-router';
import { connect } from 'react-redux';

type Props = ReturnType<typeof mapStateToProps>;

class App extends Component<Props> {
  render() {
    return <div />;
  }
}

const mapStateToProps = () => {
  return {
    location: routerModel.data.location,
    action: routerModel.data.action,
  };
};

export default connect(mapStateToProps)(App);
```
