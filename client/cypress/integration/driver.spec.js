const faker = require('faker');

const randomEmailDriver = faker.internet.email();
const randomEmailRider = faker.internet.email();

describe('The driver dashboard', function () {
  it('Cannot be visited if the user is not a driver', function () {
    cy.server();
    cy.route('POST', '**/api/sign_up/**').as('signUp');
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.visit('/#/sign-up');
    cy.get('input#username').type(randomEmailRider);
    cy.get('input#firstName').type('Gary');
    cy.get('input#lastName').type('Cole');
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('select#group').select('rider');

    // Handle file upload
    cy.get('input#photo').readFile('images/photo.jpg');

    cy.get('button').contains('Sign up').click();
    cy.wait('@signUp');
    cy.hash().should('eq', '#/log-in');

    // Log in.
    cy.visit('/#/log-in')
    cy.get('input#username').type(randomEmailRider);
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('button').contains('Log in').click();
    cy.hash().should('eq', '#/');
    cy.get('button').contains('Log out');
    cy.wait('@logIn');

    cy.visit('/#/driver');
    cy.hash().should('eq', '#/');
  })

  it('Can be visited if the user is a driver', function () {
    cy.server();
    cy.route('POST', '**/api/sign_up/**').as('signUp');
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.visit('/#/sign-up');
    cy.get('input#username').type(randomEmailDriver);
    cy.get('input#firstName').type('Gary');
    cy.get('input#lastName').type('Cole');
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('select#group').select('driver');

    // Handle file upload
    cy.get('input#photo').readFile('images/photo.jpg');

    cy.get('button').contains('Sign up').click();
    cy.wait('@signUp');
    cy.hash().should('eq', '#/log-in');

    // Log in.
    cy.visit('/#/log-in');
    cy.get('input#username').type(randomEmailDriver);
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('button').contains('Log in').click();
    cy.hash().should('eq', '#/');
    cy.get('button').contains('Log out');
    cy.wait('@logIn');

    cy.visit('/#/driver');
    cy.hash().should('eq', '#/driver');
  })

})