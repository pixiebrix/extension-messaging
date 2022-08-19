import { JsonObject } from "type-fest";

type ErrorObject = {
  name?: string;
  stack?: string;
  message?: string;
  code?: string;
} & JsonObject;

const logging = (() => {
  try {
    // @ts-expect-error it would break Webpack
    return process.env.WEBEXT_MESSENGER_LOGGING === "true";
  } catch {
    return false;
  }
})();

function noop() {
  /* */
}

export const __webextMessenger = true;
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export class MessengerError extends Error {
  override name = "MessengerError";
}

// .bind preserves the call location in the console
export const debug = logging ? console.debug.bind(console, "Messenger:") : noop;
export const warn = logging ? console.warn.bind(console, "Messenger:") : noop;

export function isErrorObject(error: unknown): error is ErrorObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is a type guard function and it uses ?.
  return typeof (error as any)?.message === "string";
}

export async function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
