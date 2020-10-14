import React, { useState } from 'react';
import axios from 'axios';

import { Button, Form, Container, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Route, Link, Switch, Redirect } from 'react-router-dom';

import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import Driver from './components/Driver.js';
import Rider from './components/Rider.js';
import { isDriver, isRider, getUser } from "./services/AuthService";

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
      <Navbar bg='dark' expand='lg' variant='dark'>
        <LinkContainer to='/'>
          <Navbar.Brand className='logo'>Taxiyy</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse>

          {
            isLoggedIn &&
            <Container inline className='ml-auto'>
              <ul className='navbar-nav mr-autom'>
                <li className="nav-item active">
                  <div className="nav-link" >{ user.username } is {group}<span className="sr-only">(current)</span></div>
                </li>
              </ul>
            </Container>
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
    </div>
  );
}

export default App;
