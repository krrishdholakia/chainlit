import { runTestServer, submitMessage } from "../../support/testUtils";

describe("Delete Message", () => {
  before(() => {
    runTestServer()
  });

  it("should be able to delete a message", () => {
    cy.get(".message").should("have.length", 2);
    cy.get(".message").eq(0).should("contain", "Message 1");
    cy.get(".message").eq(1).should("contain", "Message 2");
    cy.get(".message").should("have.length", 1);
    cy.get(".message").eq(0).should("contain", "Message 2");
    cy.get(".message").should("have.length", 0);

    cy.get(".message").should("have.length", 1);
    cy.get(".message").eq(0).should("contain", "Message 3");

    submitMessage("foo");

    cy.get(".message").should("have.length", 1);
    cy.get(".message").eq(0).should("contain", "foo");
  });
});
