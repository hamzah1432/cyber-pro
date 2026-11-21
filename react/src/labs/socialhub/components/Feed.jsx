// The feed view: composer, toolbar and the post list.
//
// Important for the lab: the main feed keeps ONE card per post for the whole
// session and only hides non-matching cards. That keeps a published payload
// mounted in the document, like a real page would.
import { useRef, useState } from "react";
import { state, useStore, getUser, notify, ME } from "../store.js";
import {
  PLAIN_MAX,
  setFormat,
  publishPlain,
  publishRich,
  previewRich,
  attachFile,
  removeAttachment,
  filterCommunity,
} from "../actions.js";
import { Avatar, Icon, RichBody, Seg } from "./ui.jsx";
import { Editor, EditorCount, Feedback } from "./Editor.jsx";
import PostCard from "./PostCard.jsx";

function Composer() {
  const s = useStore();
  const [plain, setPlain] = useState("");
  const file = useRef(null);
  const rich = s.format === "rich";

  const submit = (e) => {
    e.preventDefault();
    if (rich) publishRich();
    else if (publishPlain(plain)) setPlain("");
  };

  return (
    <form className="composer card" onSubmit={submit} noValidate>
      <div className="composer__top">
        <Avatar user={getUser(ME)} />
        <Seg label="Post format" value={s.format} onChange={setFormat} options={[["plain", "Text"], ["rich", "Rich HTML"]]} />
      </div>

      {rich ? (
        <div>
          <label className="field-label" htmlFor="composer-rich">
            HTML source <span className="muted">(p, strong, em, span, a, br)</span>
          </label>
          <Editor id="composer-rich" className="mono" rows={4} placeholder="<strong>Hello</strong> from a rich post" />
          <p className="field-meta">
            <EditorCount />
          </p>
          <Feedback />
        </div>
      ) : (
        <div>
          <label className="sr-only" htmlFor="composer-plain">
            What is on your mind?
          </label>
          <textarea
            id="composer-plain"
            rows={3}
            placeholder="What is on your mind, Sam?"
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
          />
          <p className="field-meta">
            {plain.length} / {PLAIN_MAX}
          </p>
        </div>
      )}

      {rich && s.previewSource !== null && (
        <div className="composer__preview">
          <p className="preview-label">Safe preview (ids are not mounted in previews)</p>
          <RichBody source={s.previewSource} keepIds={false} />
        </div>
      )}

      {s.pendingImage && (
        <div className="attach-preview">
          <img alt="Attachment preview" src={s.pendingImage.url} width="56" height="56" />
          <span>{s.pendingImage.name}</span>
          <button type="button" className="btn btn--ghost btn--small" onClick={removeAttachment}>
            Remove
          </button>
        </div>
      )}

      {s.composerError && (
        <p className="field-error" role="alert">
          {s.composerError}
        </p>
      )}

      <div className="composer__actions">
        <button type="button" className="btn btn--ghost btn--small" onClick={() => file.current.click()}>
          <Icon name="image" /> Photo
        </button>
        <input
          ref={file}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(e) => {
            attachFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <label className="sr-only" htmlFor="composer-community">
          Community
        </label>
        <select
          id="composer-community"
          value={s.composerCommunity}
          onChange={(e) => {
            state.composerCommunity = e.target.value;
            notify();
          }}
        >
          {s.communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="spacer" />
        {rich && (
          <button type="button" className="btn btn--secondary" onClick={previewRich}>
            Preview safe HTML
          </button>
        )}
        <button type="submit" className="btn btn--primary">
          Publish
        </button>
      </div>
    </form>
  );
}

function matches(post) {
  if (state.community && post.community !== state.community) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const author = getUser(post.authorId);
  return (post.searchText + " " + author.name + " " + author.handle).toLowerCase().includes(q);
}

function ordered() {
  const list = state.posts.slice();
  if (state.sort === "popular") list.sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
  else list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

function FilterChip({ label, onClear }) {
  return (
    <button type="button" className="chip" aria-label={"Clear filter: " + label} onClick={onClear}>
      {label} <span className="chip__x">×</span>
    </button>
  );
}

export default function FeedView() {
  const s = useStore();
  const posts = ordered();
  const visible = posts.filter(matches).length;
  const community = s.communities.find((c) => c.id === s.community);
  const clear = (patch) => {
    Object.assign(state, patch);
    notify();
  };

  return (
    <>
      <Composer />

      <div className="feed-toolbar">
        <Seg label="Sort posts" value={s.sort} onChange={(sort) => clear({ sort })} options={[["latest", "Latest"], ["popular", "Popular"]]} />
        <span className="muted" aria-live="polite">
          {visible + (visible === 1 ? " post" : " posts")}
        </span>
        <div className="chips">
          {s.query && <FilterChip label={"Search: " + s.query} onClear={() => clear({ query: "" })} />}
          {s.community && (
            <FilterChip label={"Community: " + (community ? community.name : s.community)} onClear={() => filterCommunity(s.community)} />
          )}
        </div>
      </div>

      <div className="feed" data-feed-list>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} ctx="main" hidden={!matches(post)} />
        ))}
      </div>

      {visible === 0 && (
        <div className="empty card">
          <p>{s.query ? `No posts match “${s.query}”.` : "No posts in this community yet."}</p>
          <button type="button" className="btn btn--secondary" onClick={() => clear({ query: "", community: null })}>
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
