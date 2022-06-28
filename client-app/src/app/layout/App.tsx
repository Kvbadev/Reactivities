import React from 'react';
import {Container, } from 'semantic-ui-react';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import HomePage from '../../features/home/HomePage';
import { Route, useLocation } from 'react-router-dom';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetails';

function App() {
  const location = useLocation();

  return (
    <>
      <Route exact path='/' component={HomePage} />
      <Route
        path={'/(.+)'} //everything that matches '/(+anything)'
        render={() => (
          <>
            <NavBar />
            <Container style={{marginTop: '7em'}}>
              <Route exact path='/activities' component={ActivityDashboard} />
              <Route path='/activities/:id' component={ActivityDetails} />
              <Route key={location.key} path={['/createActivity', '/manage/:id']} component={ActivityForm} />
            </Container>
          </>
        )}
      />
    </> //fragment (or <> as it's shorter version) instead of div to get rid of useless div in html
  );
}

export default observer(App);
