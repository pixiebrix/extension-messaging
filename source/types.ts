import { Asyncify, ValueOf } from "type-fest";
import { ErrorObject } from "serialize-error";

type WithTarget<Method> = Method extends (
  ...args: infer PreviousArguments
) => infer TReturnValue
  ? (target: Target | NamedTarget, ...args: PreviousArguments) => TReturnValue
  : never;

/* OmitThisParameter doesn't seem to do anything on pixiebrix-extension… */
type ActuallyOmitThisParameter<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T;

/** Removes the `this` type and ensure it's always Promised */
export type PublicMethod<Method extends ValueOf<MessengerMethods>> = Asyncify<
  ActuallyOmitThisParameter<Method>
>;

export type PublicMethodWithTarget<Method extends ValueOf<MessengerMethods>> =
  WithTarget<PublicMethod<Method>>;

export interface MessengerMeta {
  trace: browser.runtime.MessageSender[];
}

type RawMessengerResponse =
  | {
      value: unknown;
    }
  | {
      error: ErrorObject;
    };

export type MessengerResponse = RawMessengerResponse & {
  /** Guarantees that the message was handled by this library */
  __webext_messenger__: true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Unused, in practice
type Arguments = any[];
export type Method = (
  this: MessengerMeta,
  ...args: Arguments
) => Promise<unknown>;

export type Message<LocalArguments extends Arguments = Arguments> = {
  type: keyof MessengerMethods;
  args: LocalArguments;

  /** If the message is being sent to an intermediary receiver, also set the target */
  target?: Target | NamedTarget;

  /** If the message is being sent to an intermediary receiver, also set the options */
  options?: Target;
};

export type MessengerMessage = Message & {
  /** Guarantees that a message is meant to be handled by this library */
  __webext_messenger__: true;
};

export interface Target {
  tabId: number;
  frameId?: number;
}

export interface NamedTarget {
  /** If the id is missing, it will use the sender’s tabId instead */
  tabId?: number;
  name: string;
}
