## @redux-model/web-router

A redux router model based on [@redux-model/react](https://github.com/redux-model/redux-model) that support `react` and `vue`, it works in browser.

## Installation

```bash
npm install @redux-model/web-router
```

## Register

### Register Browser history

```typescript
import { BrowserRouterModel } from '@redux-model/web-router';

export routerModel = new BrowserRouterModel();
```

### Register Hash history

```typescript
import { HashRouterModel } from '@redux-model/web-router';

export routerModel = new HashRouterModel();
```

## Methods

`push`, `replace`, `go`, `goBack`, `goForward`

```typescript
routerModel.push('/user');
routerModel.goBack();
```

## Listeners

```typescript
class TestModel extends Model<Data> {
    protected onInit() {
        super.onInit();

        routerModel.listenPath('/user/:id', ({ id }, location, action) => {
           console.log(id);
        });
        
        routerModel.listenAll((localtion, action) => {
            // All history changes will be handle here
            // Do something...
        });
        
        const token = routerModel.listenPath('/article/:id/category/:cate', ({ id, cate }, location, action) => {
            console.log(id);
            console.log(cate);
        });
    
        // In some case, you don't want to listen it any more.
        routerModel.unlisten(token);
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

### In Class Component

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
