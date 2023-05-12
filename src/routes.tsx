/*
  Protected Route and Authenticated Route not using in this project!
*/

import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router';

/* containers */
const SearchMap = React.lazy(() => import('./containers/SearchMap'));

const Router : FunctionComponent<any> = () => {
  return (
    <Switch>
      <Route path="/" exact={true} component={SearchMap} />
    </Switch>
  )
}

export default Router;