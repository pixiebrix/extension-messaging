import { isContentScript } from "webext-detect-page";
import { type AnyTarget, type Sender } from "./types.js";
import { type Entries } from "type-fest";

export function compareTargets(to: AnyTarget, thisTarget: AnyTarget): boolean {
  for (const [key, value] of Object.entries(to) as Entries<typeof to>) {
    if (thisTarget[key] === value) {
      continue;
    }

    if (key !== "page") {
      return false;
    }

    const toUrl = new URL(to.page!, location.origin);
    const thisUrl = new URL(thisTarget.page!, location.origin);
    if (toUrl.pathname !== thisUrl.pathname) {
      return false;
    }

    for (const [parameterKey, parameterValue] of toUrl.searchParams) {
      if (thisUrl.searchParams.get(parameterKey) !== parameterValue) {
        return false;
      }
    }
  }

  return true;
}

export function getActionForMessage(
  from: Sender,
  target: AnyTarget,
  thisTarget: AnyTarget,
): "respond" | "forward" | "ignore" {
  // Clone object because we're editing it
  const to: AnyTarget = { ...target };
  if (to.page === "any") {
    return "respond";
  }

  // Content scripts only receive messages that are meant for them. In the future
  // they'll also forward them, but that still means they need to be handled here.
  if (isContentScript()) {
    return "respond";
  }

  // We're in an extension page, but the target is not one.
  if (!to.page) {
    return "forward";
  }

  // Set "this" tab to the current tabId
  if (to.tabId === "this" && thisTarget.tabId === from.tab?.id) {
    to.tabId = thisTarget.tabId;
  }

  // Every `target` key must match `thisTarget`
  const isThisTarget = compareTargets(to, thisTarget);
  return isThisTarget ? "respond" : "ignore";
}
