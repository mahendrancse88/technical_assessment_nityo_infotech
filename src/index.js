import 'core-js/es';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from '@common/history';
// import Playground from './containers/Playground';
import Routes from './routes';
import { store } from '@store/redux';
import { CircularProgress, ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import orange from '@material-ui/core/colors/orange';

const theme = createMuiTheme({
  palette: {
    action: {
      hover: orange[100]
    }
  }
});

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <React.Suspense fallback={<CircularProgress />}>
          <Routes/>
        </React.Suspense>
      </ThemeProvider>
    </ConnectedRouter>
    {/* <Playground /> */}
  </Provider>
, document.getElementById('root'));