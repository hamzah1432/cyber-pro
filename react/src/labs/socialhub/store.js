// store.js — the single owner of lab state (from state.js), plus the UI state
// several components share. Mutations change `state` in place and call
// notify(); components re-render through useStore().
import { useSyncExternalStore } from "react";
import { createSeed, ME } from "./seed-data.js";
import { sanitizedText } from "./safe-html.js";

export { ME };

export const WIDE = "(min-width: 1280px)";

const listeners = new Set();
let version = 0;

export const state = {};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  version += 1;
  listeners.forEach((fn) => fn());
}

export function useStore() {
  useSyncExternalStore(subscribe, () => version);
  return state;
}

export function logEvent(kind, text) {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  state.history.push({ kind, text, time });
  if (state.history.length > 60) state.history.shift();
}

export const getPost = (id) => state.posts.find((p) => p.id === id);
export const getUser = (id) => state.users.find((u) => u.id === id);

function revoke(url) {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* already revoked */
  }
}

export function loadSeed() {
  const seed = createSeed();
  seed.posts.forEach((p) => {
    p.searchText = p.kind === "rich" ? sanitizedText(p.body) : p.body;
  });
  Object.assign(state, seed);
}

/** A fresh lab on every visit: seed data plus default UI. */
export function initStore() {
  releaseImages();
  Object.assign(state, {
    mode: "vulnerable", // 'vulnerable' | 'fixed'
    route: "feed", // one of the local views
    profileUser: ME,
    saved: new Set(),
    query: "",
    community: null,
    sort: "latest", // 'latest' | 'popular'
    editorText: "", // exact bytes of the shared HTML editor
    pendingImage: null, // {url, name} for the composer attachment
    history: [], // observed events only
    lastRun: null, // result of the most recent Guidelines press
    // shared UI
    format: "plain",
    composerCommunity: "coding",
    composerError: "",
    feedback: { lines: [], kind: "info" },
    previewSource: null,
    presetKey: null,
    wbOpen: window.matchMedia(WIDE).matches,
    tab: "mission",
    codeView: "vulnerable",
    hintsShown: 0,
    toast: { text: "", n: 0 },
    focusView: null,
  });
  loadSeed();
}

/** Revoke every object URL the lab created (leaving the page, or a fresh visit). */
export function releaseImages() {
  revoke(state.pendingImage?.url);
  state.posts?.forEach((p) => revoke(p.imageUrl));
}

export function toggleLike(id) {
  const post = getPost(id);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
}

export function toggleSave(id) {
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
}

export function addComment(id, text) {
  const post = getPost(id);
  if (!post) return false;
  post.comments.push({ id: "c-" + Date.now() + "-" + post.comments.length, authorId: ME, text, createdAt: Date.now() });
  return true;
}

export function addPost({ kind, body, searchText, community, imageUrl = null }) {
  const post = {
    id: "p-" + state.nextPostNumber++,
    authorId: ME,
    kind,
    body,
    searchText,
    community,
    createdAt: Date.now(),
    likes: 0,
    liked: false,
    comments: [],
    imageUrl,
    seed: false,
  };
  state.posts.unshift(post);
  return post;
}

/** Removes every user-created post (and with it any attacker-controlled DOM). */
export function removeUserPosts() {
  state.posts = state.posts.filter((p) => {
    if (p.seed) return true;
    revoke(p.imageUrl);
    state.saved.delete(p.id);
    return false;
  });
}

/** Mode switch: wipe attack state, keep the payload editor and event history. */
export function resetAttackState() {
  removeUserPosts();
  state.route = "feed";
  state.query = "";
  state.community = null;
  state.profileUser = ME;
  state.lastRun = null;
}

/** Full reset: baseline data, empty history. Editor bytes and mode are preserved. */
export function resetEnvironment() {
  releaseImages();
  const keep = { mode: state.mode, editorText: state.editorText };
  loadSeed();
  Object.assign(state, {
    route: "feed",
    profileUser: ME,
    saved: new Set(),
    query: "",
    community: null,
    sort: "latest",
    history: [],
    lastRun: null,
    pendingImage: null,
    ...keep,
  });
}

export function setPendingImage(img) {
  revoke(state.pendingImage?.url);
  state.pendingImage = img;
}
