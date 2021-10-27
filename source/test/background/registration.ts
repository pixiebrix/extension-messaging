import { isBackgroundPage } from "webext-detect-page";
import { registerMethods } from "../..";

import { sum } from "./sum";
import { throws } from "./throws";
import { sumIfMeta } from "./sumIfMeta";
import { getExtensionId } from "./getExtensionId";
import { backgroundOnly } from "./backgroundOnly";
import { notRegistered } from "./notRegistered";
import { getSelf } from "./getSelf";
import { openTab, getAllFrames, ensureScripts, closeTab } from "./testingApi";

declare global {
  interface MessengerMethods {
    sum: typeof sum;
    throws: typeof throws;
    sumIfMeta: typeof sumIfMeta;
    notRegistered: typeof notRegistered;
    getExtensionId: typeof getExtensionId;
    backgroundOnly: typeof backgroundOnly;
    getSelf: typeof getSelf;
    openTab: typeof openTab;
    getAllFrames: typeof getAllFrames;
    ensureScripts: typeof ensureScripts;
    closeTab: typeof closeTab;
  }
}

if (!isBackgroundPage()) {
  throw new Error(
    "This file must only be run in the background page, which is the receiving end"
  );
}

registerMethods({
  backgroundOnly,
  getExtensionId,
  sum,
  sumIfMeta,
  throws,
  getSelf,
  openTab,
  getAllFrames,
  ensureScripts,
  closeTab,
});
