// Fictional seed data. Every person, post and number below is invented demo content.
// Timestamps are expressed as "minutes ago" and resolved when the seed is created.

export const ME = 'sam';

const USERS = [
  { id: 'sam',    name: 'Sam Rahal',      handle: 'sam',     tone: 1, bio: 'Cadet at a coding school. Breaks things in C, repairs them in JavaScript. Currently reading about browsers.' },
  { id: 'lina',   name: 'Lina Haddad',    handle: 'linaframes', tone: 2, bio: 'Street and rooftop photography. Shoots film on weekends and complains about dust on the sensor.' },
  { id: 'omar',   name: 'Omar Khoury',    handle: 'omarbugs', tone: 3, bio: 'Backend tinkerer. Believes every outage is a story about an assumption.' },
  { id: 'dana',   name: 'Dana Nasser',    handle: 'danadesigns', tone: 4, bio: 'Interface designer learning to code. Spacing scales, focus rings, and strong coffee.' },
  { id: 'yusuf',  name: 'Yusuf Barakat',  handle: 'yusufalgo', tone: 5, bio: 'Algorithms club organizer. Will explain Dijkstra with a map of the campus cafeteria.' },
  { id: 'maya',   name: 'Maya Salem',     handle: 'mayasalem', tone: 6, bio: 'Campus events and community tools. Fan of tidy spreadsheets and long walks.' },
  { id: 'kareem', name: 'Kareem Fakhoury', handle: 'kfakhoury', tone: 7, bio: 'Embedded systems and soldering. Has opinions about breadboards.' },
  { id: 'reem',   name: 'Reem Dabbas',    handle: 'reemoss', tone: 8, bio: 'Open source contributor. Writes docs first, code second, apologizes to future readers.' }
];

const COMMUNITIES = [
  { id: 'coding',      name: 'Coding',      about: 'Projects, snippets and language debates.' },
  { id: 'campus',      name: 'Campus',      about: 'Events, study groups and logistics.' },
  { id: 'photography', name: 'Photography', about: 'Frames, gear and light.' },
  { id: 'debugging',   name: 'Debugging',   about: 'Bugs hunted, lessons kept.' },
  { id: 'questions',   name: 'Questions',   about: 'Ask anything, answer anything.' }
];

// kind: 'plain' renders with textContent. 'rich' goes through the restricted sanitizer.
const POSTS = [
  { id: 'p-1',  authorId: 'dana',   community: 'coding',      minutesAgo: 14,   likes: 12, kind: 'rich',
    body: '<strong>Spacing scale update.</strong> I replaced my random paddings with a 4/8/12/16/24/32 scale.<br>The layout stopped feeling <em>fiddly</em> in about ten minutes. #design #css' },
  { id: 'p-2',  authorId: 'omar',   community: 'debugging',   minutesAgo: 47,   likes: 31, kind: 'plain',
    body: 'Spent two hours on a bug that turned out to be a cached response from last Tuesday.\nThe code was never wrong. My assumption about the cache was. #debugging' },
  { id: 'p-3',  authorId: 'lina',   community: 'photography', minutesAgo: 95,   likes: 44, kind: 'plain',
    body: 'Golden hour from the rooftop of the old library. Shot on 35mm, 1/250, f/5.6. The grain is a feature. #photography' },
  { id: 'p-4',  authorId: 'yusuf',  community: 'campus',      minutesAgo: 160,  likes: 18, kind: 'plain',
    body: 'Algorithms club meets Thursday at 6 pm in the quiet lab. Bring a laptop and one problem that annoyed you this week. #campus' },
  { id: 'p-5',  authorId: 'reem',   community: 'coding',      minutesAgo: 230,  likes: 27, kind: 'rich',
    body: '<p><strong>Docs tip:</strong> write the README example <em>before</em> the feature.</p><p>If the example feels awkward, the API is awkward. #opensource</p>' },
  { id: 'p-6',  authorId: 'kareem', community: 'questions',   minutesAgo: 340,  likes: 9,  kind: 'plain',
    body: 'Question for anyone who has done this: how do you keep a sensor reading stable when the power supply is noisy? Capacitors only got me halfway. #hardware' },
  { id: 'p-7',  authorId: 'maya',   community: 'campus',      minutesAgo: 520,  likes: 22, kind: 'rich',
    body: '<strong>Study room booking</strong> now has a shared sheet.<br>Please add your name <em>before</em> you sit down, not after. Thank you!' },
  { id: 'p-8',  authorId: 'omar',   community: 'coding',      minutesAgo: 760,  likes: 16, kind: 'plain',
    body: 'Hot take: a well named function beats a clever comment. If I need the comment, I should rename the function. #coding' },
  { id: 'p-9',  authorId: 'lina',   community: 'photography', minutesAgo: 1440, likes: 36, kind: 'plain',
    body: 'Rainy-day reflections near the bus station. Puddles are free wide-angle lenses. #photography #street' },
  { id: 'p-10', authorId: 'dana',   community: 'questions',   minutesAgo: 2000, likes: 14, kind: 'plain',
    body: 'Do you test your focus order by tabbing through the whole page, or do you trust the markup? I keep finding surprises. #accessibility' },
  { id: 'p-11', authorId: 'yusuf',  community: 'debugging',   minutesAgo: 2900, likes: 21, kind: 'plain',
    body: 'Off-by-one errors are the only bugs I enjoy. They have a shape. #debugging #algorithms' }
];

const SEED_COMMENTS = {
  'p-2': [{ authorId: 'reem', text: 'Cache invalidation strikes again.', minutesAgo: 30 }],
  'p-3': [{ authorId: 'dana', text: 'That warm light on the brick is lovely.', minutesAgo: 60 },
          { authorId: 'kareem', text: 'Which film stock?', minutesAgo: 40 }],
  'p-6': [{ authorId: 'omar', text: 'Try a ferrite bead plus a small RC filter before the ADC.', minutesAgo: 200 }]
};

export function createSeed(now = Date.now()) {
  const min = 60 * 1000;
  let commentCounter = 0;
  const posts = POSTS.map((p) => ({
    id: p.id,
    authorId: p.authorId,
    kind: p.kind,
    body: p.body,
    searchText: '', // filled by feed.js using the sanitizer for rich posts
    community: p.community,
    createdAt: now - p.minutesAgo * min,
    likes: p.likes,
    liked: false,
    comments: (SEED_COMMENTS[p.id] || []).map((c) => ({
      id: 'c-seed-' + (++commentCounter),
      authorId: c.authorId,
      text: c.text,
      createdAt: now - c.minutesAgo * min
    })),
    imageUrl: null,
    seed: true
  }));
  return {
    users: USERS.map((u) => ({ ...u })),
    communities: COMMUNITIES.map((c) => ({ ...c })),
    posts,
    nextPostNumber: POSTS.length + 1
  };
}
