import { runTestServer } from "../../support/testUtils";

describe("tasklist", () => {
  before(() => {
    runTestServer()
  });

  it("should display the tasklist ", () => {
    cy.get("#welcome-screen").should("exist");

    cy.get(".message").should("have.length", 0);
    cy.get(".tasklist").should("have.length", 2);
    cy.get(".tasklist.tasklist-mobile").should("not.be.visible");
    cy.get(".tasklist.tasklist-mobile .task").should("not.be.visible");

    cy.get(".tasklist.tasklist-desktop").should("be.visible");
    cy.get(".tasklist.tasklist-desktop .task").should("have.length", 17);

    cy.get(".tasklist.tasklist-desktop .task.task-status-ready").should(
      "have.length",
      7
    );
    cy.get(".tasklist.tasklist-desktop .task.task-status-running").should(
      "have.length",
      0
    );
    cy.get(".tasklist.tasklist-desktop .task.task-status-failed").should(
      "have.length",
      1
    );
    cy.get(".tasklist.tasklist-desktop .task.task-status-done").should(
      "have.length",
      9
    );
  });
});
