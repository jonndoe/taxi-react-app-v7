import React, { useState } from 'react';
import axios from 'axios';

import { Button, Form, Container, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Route, Link, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import Driver from './components/Driver.js';
import Rider from './components/Rider.js';
import { isDriver, isRider, getUser } from "./services/AuthService";


import 'react-toastify/dist/ReactToastify.css';
import './App.css';





function App () {

  const [isLoggedIn, setLoggedIn] = useState(() => { // changed
      return window.localStorage.getItem('taxi.auth') !== null;
  });

  const logOut = () => {
    window.localStorage.removeItem('taxi.auth');
    setLoggedIn(false);
  };


  const logIn = async (username, password) => { // changed
    const url = `${process.env.REACT_APP_BASE_URL}/api/log_in/`;
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem(
        'taxi.auth', JSON.stringify(response.data)
      );
      setLoggedIn(true);
      return { response, isError: false };
    }
    catch (error) {
      console.error(error);
      return { response: error, isError: true };
    }
  };

  const group = isRider()? 'rider': 'driver';
  const user = getUser();

  return (
    <div>
      <Navbar bg='light' expand='lg' variant='light'>
        <LinkContainer to='/'>
          <Navbar.Brand className='logo'>Taxiyy</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse>

          {
            isLoggedIn &&
            <Nav className='mr-auto'>
                <Nav.Link className="nav-item active">
                  { user.username } is {group}<span className="sr-only">(current)</span>
                </Nav.Link>
            </Nav>
          }

          {
            isRider() && (
              <Nav className='mr-auto'>
                <LinkContainer to='/rider/request'>
                  <Button type='button'>Request a trip</Button>
                </LinkContainer>
              </Nav>
            )
          }

          {
            isRider() && (
              <Nav className='mr-auto'>
                <LinkContainer to='/rider/request'>
                  <Nav.Link>Request a trip</Nav.Link>
                </LinkContainer>
              </Nav>
            )
          }

          {
            isLoggedIn &&
            <Form inline className='ml-auto'>
              <Button type='button' onClick={() => logOut()}>Log out</Button>
            </Form>
          }
        </Navbar.Collapse>
      </Navbar>
      <Container className='pt-3'>
        <Switch>
          <Route exact path='/' render={() => (
            <div className='middle-center'>
              <h1 className='landing logo'>Taxi</h1>
              {
                !isLoggedIn && (
                  <>
                    <Link
                      id='signUp'
                      className='btn btn-primary'
                      to='/sign-up'
                    >Sign up</Link>
                    <Link
                      id='logIn'
                      className='btn btn-primary'
                      to='/log-in'
                    >Log in</Link>
                  </>
                )
              }
              {
                isRider() && (
                  <Link
                    className='btn btn-primary'
                    to='/rider'
                  >Dashboard</Link>
                )
              }
              {
                isDriver() && (
                  <Link
                    className='btn btn-primary'
                    to='/driver'
                  >Dashboard</Link>
                )
              }
            </div>
          )} />
          <Route path='/sign-up' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
              <SignUp />
            )
          )} />
          <Route path='/log-in' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
              <LogIn logIn={logIn} />
            )
          )} />
          <Route path='/driver' render={() => (
            <Driver />
          )} />
          <Route path='/rider' render={() => (
            <Rider />
          )} />
        </Switch>
      </Container>

      <ToastContainer />

    </div>
  );
}

export default App;
