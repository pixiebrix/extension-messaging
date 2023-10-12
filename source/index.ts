// Imports must use the .js extension because ESM requires it and TS refuses to rewrite .ts to .js

export * from "./receiver.js";
export * from "./sender.js";
export * from "./types.js";
export * from "./events.js";
export { getThisFrame, getTopLevelFrame } from "./thisTarget.js";
export { toggleLogging } from "./shared.js";

import { initPrivateApi } from "./thisTarget.js";

initPrivateApi();
