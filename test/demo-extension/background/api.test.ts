import * as test from "fresh-tape";
import {
  backgroundOnly,
  getExtensionId,
  notRegistered,
  sum,
  sumIfMeta,
  throws,
  getSelf,
} from "./api";

test("send message and get response", async (t) => {
  t.equal(await getExtensionId(), chrome.runtime.id);
});

test("support parameters", async (t) => {
  t.equal(await sum(1, 2, 3, 4), 10);
});

test("should receive information from the caller", async (t) => {
  t.equal(await sumIfMeta(1, 2, 3, 4), 10);
});

test("handler must be executed in the background script", async (t) => {
  t.equal(await backgroundOnly(), true);
});

test("should receive error from a background handler", async (t) => {
  try {
    await throws();
    t.fail("throws() should have thrown but did not");
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      t.fail("The error is not an instance of Error");
      return;
    }

    if (!error.stack) {
      t.fail("The error has no stack");
      return;
    }

    t.equal(error.message, "This my error");
    t.true(
      error.stack.includes("/background/registration.js"),
      "The stacktrace must come from the background page"
    );
    t.true(
      // Chrome format || Firefox format
      error.stack.includes("at Object.throws") ||
        error.stack.includes("throws@moz-"),
      "The stacktrace must include the original name of the method"
    );
  }
});

test("should receive error from the background if it’s not registered", async (t) => {
  try {
    await notRegistered();
    t.fail("notRegistered() should have thrown but did not");
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      t.fail("The error is not an instance of Error");
      return;
    }

    t.equal(error.message, "No handler registered for notRegistered");
  }
});

test("should receive echo", async (t) => {
  const self = await getSelf();
  t.true(self instanceof Object);
  t.equals(self.trace[0]!.id, chrome.runtime.id);
  t.equals(self.trace[0]!.url, location.href);
});
