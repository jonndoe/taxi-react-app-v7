const faker = require('faker');

const driverEmail = faker.internet.email();
const driverFirstName = faker.name.firstName();
const driverLastName = faker.name.lastName();
const riderEmail = faker.internet.email();
const riderFirstName = faker.name.firstName();
const riderLastName = faker.name.lastName();

describe('The rider dashboard', function () {

  before(function() {
    cy.addUser(riderEmail, riderFirstName, riderLastName, 'rider');
    cy.addUser(driverEmail, driverFirstName, driverLastName, 'driver');
  })

  it('Cannot be visited if the user is not a rider', function () {
    cy.server();
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.logIn(driverEmail);

    cy.visit('/#/rider');
    cy.hash().should('eq', '#/');
  })


  it('Can be visited if the user is a rider', function () {
    cy.server();
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.logIn(riderEmail);

    cy.visit('/#/rider');
    cy.hash().should('eq', '#/rider');
  })

  it('Displays messages for no trips', function () {
    cy.server();
    cy.route({
      method: 'GET',
      url: '**/api/trip/',
      status: 200,
      response: []
    }).as('getTrips');

    cy.logIn(riderEmail);

    cy.visit('/#/rider');
    cy.wait('@getTrips');

    // Current trips.
    cy.get('[data-cy=trip-card]')
      .eq(0)
      .contains('No trips.');

    // Completed trips.
    cy.get('[data-cy=trip-card]')
      .eq(1)
      .contains('No trips.');
  })

})



