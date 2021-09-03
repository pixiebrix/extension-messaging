// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Unused, in practice
type Arguments = any[];
type Method = (
  this: browser.runtime.MessageSender,
  ...args: Arguments
) => Promise<unknown>;

type PublicMethod<TMethod = Method> = OmitThisParameter<TMethod> & {
  type: string;
};

// TODO: It may include additional meta, like information about the original sender
type Message<TArguments extends Arguments = Arguments> = {
  type: string;
  args: TArguments;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMessage(value: unknown): value is Message {
  // TODO: Add library-specific key to safely catch non-handled messages
  //  https://github.com/pixiebrix/extension-messaging/pull/8#discussion_r700095639
  return (
    isObject(value) &&
    typeof value["type"] === "string" &&
    Array.isArray(value["args"])
  );
}

const handlers = new Map<string, Method>();

// MUST NOT be `async` or Promise-returning-only
function onMessageListener(
  message: unknown,
  sender: browser.runtime.MessageSender
): Promise<unknown> | void {
  if (!isMessage(message)) {
    return;
  }

  const handler = handlers.get(message.type);
  if (handler) {
    return handler.call(sender, ...message.args);
  }

  throw new Error("No handler registered for " + message.type);
}

// The original Method might have `this` (sender) specified, but this isn't applicable here
/**
 * Replicates the original method, including its types.
 * To be called in the sender’s end.
 */
export function getMethod<TMethod extends Method>(
  type: string
): PublicMethod<TMethod> {
  const method: Method = async (...args) =>
    browser.runtime.sendMessage({
      type,
      args,
    });
  return Object.assign(method, { type }) as PublicMethod<TMethod>;
}

export function registerMethods(...methods: PublicMethod[]): void {
  for (const method of methods) {
    if (handlers.has(method.type)) {
      throw new Error(`Handler already set for ${method.type}`);
    }

    handlers.set(method.type, method);
  }

  browser.runtime.onMessage.addListener(onMessageListener);
}
