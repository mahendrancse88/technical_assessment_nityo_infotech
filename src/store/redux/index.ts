import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import history from '@common/history';
import thunk from 'redux-thunk';

import searchMapReducer from '@containers/SearchMap/reducer';

declare global {
  interface Window { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any; }
}

const reducers = {
  router: connectRouter(history),
  searchMapReducer
}

const rootState = combineReducers(reducers);

const composeEnhancers = (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(
  rootState,
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk
    )
  )
);

export type RootState = ReturnType<typeof rootState>;
export { store };