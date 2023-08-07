import { sep } from "path";

export function submitMessage(message: string) {
  cy.wait(2000);
  cy.get(`#chat-input`).should("not.be.disabled");
  cy.get(`#chat-input`).type(`${message}{enter}`);
}

export function openHistory() {
  cy.wait(2000);
  cy.get(`#chat-input`).should("not.be.disabled");
  cy.get(`#chat-input`).type(`{upArrow}`);
}

export function closeHistory() {
  cy.get(`body`).click();
}

export function runTestServer(mode: 'sync'|'async'|undefined = undefined) {
  const pathItems = Cypress.spec.absolute.split(sep)
  const testName = pathItems[pathItems.length - 2]
  cy.exec(`pnpm exec ts-node ./cypress/support/run.ts ${testName} ${mode}`)
  cy.intercept("/project/settings").as("settings");
  cy.visit("/");
  cy.wait(["@settings"]);
}

export function describeSyncAsync(title: string, callback) {
  describe(`[sync] ${title}`, () => callback('sync'))
  describe(`[async] ${title}`, () => callback('async'))
}
