// A post card. Plain text and comments are rendered as text; rich bodies go
// through the sanitizer. Only the main feed ('main') keeps ids.
import { useEffect, useRef, useState } from "react";
import { state, useStore, getUser, ME, toggleLike, toggleSave, addComment, notify } from "../store.js";
import { openProfile, toast } from "../actions.js";
import { Avatar, Icon, RichBody, timeAgo } from "./ui.jsx";

function ActionButton({ icon, label, count, ...rest }) {
  return (
    <button type="button" className="post__action" {...rest}>
      <Icon name={icon} />
      <span className="post__action-label">{label}</span>
      <span className="post__count">{count > 0 ? count : ""}</span>
    </button>
  );
}

export default function PostCard({ post, ctx, hidden }) {
  useStore();
  const author = getUser(post.authorId);
  const community = state.communities.find((c) => c.id === post.community);
  const saved = state.saved.has(post.id);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const input = useRef(null);

  useEffect(() => {
    if (open) input.current.focus();
  }, [open]);

  const like = () => {
    toggleLike(post.id);
    notify();
  };
  const save = () => {
    toggleSave(post.id);
    notify();
    toast(state.saved.has(post.id) ? "Saved" : "Removed from saved");
  };
  const comment = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) {
      setError("Write a comment first.");
      input.current.focus();
      return;
    }
    setError("");
    if (addComment(post.id, text)) {
      setDraft("");
      notify();
    }
  };

  return (
    <article className="post" data-post-id={post.id} data-ctx={ctx} hidden={hidden}>
      <header className="post__head">
        <button
          type="button"
          className="post__author"
          onClick={() => openProfile(author.id)}
          aria-label={"Open profile of " + author.name}
        >
          <Avatar user={author} />
          <span className="post__names">
            <span className="post__name">{author.name}</span>
            <span className="post__handle">@{author.handle}</span>
          </span>
        </button>
        <span className="post__meta">
          <time dateTime={new Date(post.createdAt).toISOString()}>{timeAgo(post.createdAt)}</time>
          {community && <span className="tag">{community.name}</span>}
        </span>
      </header>

      {post.kind === "rich" ? (
        <RichBody source={post.body} keepIds={ctx === "main"} />
      ) : (
        <div className="post__body">{post.body}</div>
      )}

      {post.imageUrl && (
        <figure className="post__figure">
          <img src={post.imageUrl} alt={"Photo attached by " + author.name} />
        </figure>
      )}

      <div className="post__actions">
        <ActionButton
          icon="heart"
          label={post.liked ? "Liked" : "Like"}
          count={post.likes}
          aria-pressed={post.liked}
          aria-label={(post.liked ? "Unlike" : "Like") + ", " + post.likes + " likes"}
          onClick={like}
        />
        <ActionButton
          icon="comment"
          label="Comment"
          count={post.comments.length}
          aria-expanded={open}
          aria-label={"Comments, " + post.comments.length}
          onClick={() => setOpen((o) => !o)}
        />
        <ActionButton icon="bookmark" label={saved ? "Saved" : "Save"} aria-pressed={saved} onClick={save} />
      </div>

      <div className="comments" hidden={!open}>
        <ul className="comments__list">
          {post.comments.map((c) => {
            const u = getUser(c.authorId);
            return (
              <li key={c.id} className="comment">
                <Avatar user={u} size="small" />
                <div className="comment__bubble">
                  <strong className="comment__name">{u.id === ME ? "You" : u.name}</strong>
                  <span className="comment__text">{c.text}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <form className="comments__form" onSubmit={comment}>
          <input
            ref={input}
            type="text"
            maxLength={200}
            placeholder="Write a comment"
            aria-label={"Write a comment on " + author.name + "’s post"}
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="btn btn--secondary btn--small">
            Post
          </button>
        </form>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
