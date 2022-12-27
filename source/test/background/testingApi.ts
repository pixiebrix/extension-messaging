import chromeP from "webext-polyfill-kinda";
import { executeFunction } from "webext-content-scripts";

export async function ensureScripts(tabId: number): Promise<void> {
  await chromeP.tabs.executeScript(tabId, {
    file: "contentscript/registration.js",
  });
}

type Targets = {
  tabId: number;
  parentFrame: number;
  iframe: number;
};

export async function createTargets(): Promise<Targets> {
  const tabId = await openTab(
    "https://fregante.github.io/pixiebrix-testing-ground/Will-receive-CS-calls/Parent?iframe=./Child"
  );

  // Append local page iframe
  await executeFunction(tabId, () => {
    const iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("iframe.html");
    document.body.append(iframe);
  });

  let limit = 100;
  let frames;
  while (limit--) {
    // eslint-disable-next-line no-await-in-loop -- It's a retry loop
    frames = await chromeP.webNavigation.getAllFrames({
      tabId,
    });

    if (frames.length >= 2) {
      // The local frame won't appear in Chrome 🤷‍♂️ but it will in Firefox
      return {
        tabId,
        parentFrame: frames[0]!.frameId,
        iframe: frames.find(
          (frame) => frame.frameId > 0 && frame.url.startsWith("http")
        )!.frameId,
      };
    }

    // eslint-disable-next-line no-await-in-loop -- It's a retry loop
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  console.error({ frames });
  throw new Error("The expected frames were not found");
}

export async function openTab(url: string): Promise<number> {
  const tab = await chromeP.tabs.create({
    active: false,
    url,
  });
  return tab.id!;
}

export async function closeTab(tabId: number): Promise<void> {
  await chromeP.tabs.remove(tabId);
}
