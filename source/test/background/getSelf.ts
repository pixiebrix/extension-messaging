import { type MessengerMeta, type Sender } from "webext-messenger";

export async function getSelf(
  this: MessengerMeta
): Promise<Sender | undefined> {
  return this.trace[0];
}
