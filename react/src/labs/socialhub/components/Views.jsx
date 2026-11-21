// The main column: every local view is a <section data-view> that stays in the
// document and is hidden when inactive, so the feed (and any payload in it)
// stays mounted while another view is showing. Secondary views render
// ids-stripped copies, so a payload never exists twice.
import { useEffect } from "react";
import { state, useStore, getUser, ME } from "../store.js";
import { filterCommunity, nav } from "../actions.js";
import { viewLabel } from "../views.js";
import { Avatar } from "./ui.jsx";
import FeedView from "./Feed.jsx";
import PostCard from "./PostCard.jsx";

const newestFirst = (a, b) => b.createdAt - a.createdAt;

function SecondaryList({ posts, emptyText }) {
  if (!posts.length) return <p className="empty-note">{emptyText}</p>;
  return posts.map((p) => <PostCard key={p.id} post={p} ctx="secondary" />);
}

function ProfileView() {
  const user = getUser(state.profileUser) || getUser(ME);
  const mine = state.posts.filter((p) => p.authorId === user.id).sort(newestFirst);
  return (
    <>
      <h2 className="view-title" tabIndex={-1} data-view-title>
        {user.id === ME ? "My profile" : user.name}
      </h2>
      <div className="profile card">
        <Avatar user={user} size="large" />
        <div className="profile__info">
          <h2 className="profile__name">{user.name}</h2>
          <p className="profile__handle">
            @{user.handle}
            {user.id === ME ? " · you" : ""}
          </p>
          <p className="profile__bio">{user.bio}</p>
          <p className="profile__stats">
            <strong>{mine.length}</strong> posts
            {user.id === ME && (
              <>
                {" · "}
                <strong>{state.saved.size}</strong> saved
              </>
            )}
          </p>
        </div>
      </div>
      <div className="feed">
        <SecondaryList posts={mine} emptyText="No posts yet." />
      </div>
    </>
  );
}

function SavedView() {
  const saved = state.posts.filter((p) => state.saved.has(p.id)).sort(newestFirst);
  return (
    <>
      <h2 className="view-title" tabIndex={-1} data-view-title>
        Saved posts
      </h2>
      <div className="feed">
        <SecondaryList posts={saved} emptyText="Nothing saved yet. Use Save on any post and it appears here." />
      </div>
    </>
  );
}

function CommunitiesView() {
  return (
    <>
      <h2 className="view-title" tabIndex={-1} data-view-title>
        Communities
      </h2>
      <p className="muted">Pick a community to filter the feed.</p>
      <div className="community-grid">
        {state.communities.map((c) => {
          const count = state.posts.filter((p) => p.community === c.id).length;
          return (
            <button key={c.id} type="button" className="community-card" onClick={() => filterCommunity(c.id)}>
              <strong>{c.name}</strong>
              <span className="community-card__about">{c.about}</span>
              <span className="community-card__count">{count + (count === 1 ? " post" : " posts")}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

const BackToFeed = () => (
  <button type="button" className="btn btn--secondary" onClick={() => nav("feed")}>
    Back to feed
  </button>
);

export default function MainViews() {
  const s = useStore();

  // Move focus to the heading of a view opened with { focus: true }.
  useEffect(() => {
    if (!s.focusView) return;
    const view = s.focusView;
    s.focusView = null;
    document.querySelector(`[data-view="${view}"] [data-view-title]`)?.focus();
  });

  const hidden = (name) => s.route !== name;

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        Showing {viewLabel(s.route)}
      </p>

      <section data-view="feed" aria-label="Feed" hidden={hidden("feed")}>
        <h2 className="sr-only" tabIndex={-1} data-view-title>
          Feed
        </h2>
        <FeedView />
      </section>

      <section data-view="profile" aria-label="Profile" hidden={hidden("profile")}>
        {s.route === "profile" && <ProfileView />}
      </section>

      <section data-view="saved" aria-label="Saved posts" hidden={hidden("saved")}>
        {s.route === "saved" && <SavedView />}
      </section>

      <section data-view="communities" aria-label="Communities" hidden={hidden("communities")}>
        {s.route === "communities" && <CommunitiesView />}
      </section>

      <section data-view="community-guidelines" aria-label="Community Guidelines" hidden={hidden("community-guidelines")}>
        <article className="guidelines card" data-guidelines-kind="official">
          <p className="badge badge--ok">Official · SocialHub moderators</p>
          <h2 className="view-title" tabIndex={-1} data-view-title>
            Community Guidelines
          </h2>
          <ol className="rules">
            <li><strong>Be kind.</strong> Critique ideas, not people.</li>
            <li><strong>Credit your sources</strong> and the original authors of work you share.</li>
            <li><strong>No spam.</strong> Repeated self-promotion gets posts removed.</li>
            <li><strong>Keep it safe for work.</strong> Photos and posts should suit a campus lab.</li>
            <li><strong>Report, do not escalate.</strong> Moderators handle disputes.</li>
            <li><strong>Protect privacy.</strong> Ask before sharing anyone’s personal details.</li>
          </ol>
        </article>
      </section>

      {/* Unofficial views: reachable only through the flaw */}
      <section data-view="untrusted-guidelines" aria-label="Updated Community Rules" hidden={hidden("untrusted-guidelines")}>
        <article className="guidelines guidelines--unofficial card" data-guidelines-kind="untrusted">
          <p className="badge badge--warn">Unofficial · not from moderators</p>
          <h2 className="view-title" tabIndex={-1} data-view-title>
            Updated Community Rules
          </h2>
          <ol className="rules">
            <li><strong>Pre-approval.</strong> Every post waits for a moderator before it appears.</li>
            <li><strong>One photo a day.</strong> Extra photos are removed.</li>
            <li><strong>Quiet hours.</strong> Posting is paused from 9 pm to 7 am.</li>
            <li><strong>Verified comments.</strong> Only members with a Verified tag may comment.</li>
          </ol>
          <BackToFeed />
        </article>
      </section>

      <section data-view="alternate-guidelines" aria-label="Community Rules Notice" hidden={hidden("alternate-guidelines")}>
        <article className="guidelines guidelines--unofficial card" data-guidelines-kind="alternate">
          <p className="badge badge--warn">Unofficial · notice</p>
          <h2 className="view-title" tabIndex={-1} data-view-title>
            Community Rules Notice
          </h2>
          <p>The community rules are under review. Until further notice:</p>
          <ul className="rules rules--bullets">
            <li>Posting is limited to the Questions community.</li>
            <li>Comments are held for review.</li>
            <li>Saved posts may be cleared weekly.</li>
          </ul>
          <BackToFeed />
        </article>
      </section>
    </>
  );
}
