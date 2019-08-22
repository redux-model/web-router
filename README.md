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
