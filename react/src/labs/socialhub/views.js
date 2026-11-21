import { state, notify } from "./store.js";

export const TRUSTED_VIEW = "#community-guidelines";

export const ALLOWED_VIEWS = new Set(["#community-guidelines", "#untrusted-guidelines", "#alternate-guidelines"]);

const VIEW_NAMES = new Set([
  "feed",
  "profile",
  "saved",
  "communities",
  "community-guidelines",
  "untrusted-guidelines",
  "alternate-guidelines",
]);

const LABELS = {
  feed: "Feed",
  profile: "Profile",
  saved: "Saved posts",
  communities: "Communities",
  "community-guidelines": "Community Guidelines (official)",
  "untrusted-guidelines": "Updated Community Rules (unofficial view)",
  "alternate-guidelines": "Community Rules Notice (alternate view)",
};

export const viewLabel = (name) => LABELS[name] || name;
export const isGuidelinesView = (name) => name.endsWith("-guidelines");

export function showLocalView(target, { focus = true } = {}) {
  let name = String(target).replace(/^#/, "");
  if (!VIEW_NAMES.has(name)) name = "feed";
  state.route = name;
  state.focusView = focus ? name : null;
  notify();
}
