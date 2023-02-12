import { createBrowserHistory } from "history";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers";

const history = createBrowserHistory();
const middleware = [thunk];

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const store = createStore(
  combineReducers({
    ...reducers,
  }),
  composeEnhancers(applyMiddleware(...middleware))
);

export { store, history };
