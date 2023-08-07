import { describeSyncAsync, runTestServer } from "../../support/testUtils";

function testPlayground(index, shouldContain: string) {
  cy.get(".playground-button").eq(index).should("exist").click();

  cy.get("#playground")
    .should("exist")
    .get("[contenteditable=true]")
    .should("exist")
    .should("contain", shouldContain);

  cy.get("#playground").get("#close-playground").should("exist").click();
}

describeSyncAsync("Langchain Callback", (mode) => {
  before(() => {
    runTestServer(mode)
  });

  it("it should be able to send messages to the UI with prompts", () => {
    cy.get("#welcome-screen").should("exist");

    cy.get(".message").should("have.length", 1);

    cy.get("#testchain1-done").should("exist").click();

    cy.get(".message").should("have.length", 3);

    cy.get("#testtool1-done").should("exist").click();

    cy.get(".message").should("have.length", 4);

    testPlayground(0, "This is prompt of llm1\nThis is the response of tool1");
  });
});
