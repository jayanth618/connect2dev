import { User, Post, NotificationItem, Community, CommunityMessage } from '../types';

// High quality Unsplash developer avatars
const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
];

const ROLES = [
  'Senior Frontend Architect',
  'Full Stack TypeScript Lead',
  'Systems Rust Engineer',
  'Cloud Infrastructure Specialist',
  'AI / ML Application Engineer',
  'DevOps & Platform Lead',
  'Core React Contributor',
  'Backend Microservices Developer',
  'Database Architect & DBA',
  'Security & Cryptography Lead',
  'iOS / Android React Native Lead',
  'Site Reliability Engineer (SRE)',
  'Open Source Maintainer',
  'Distributed Systems Lead',
  'Staff API Architect'
];

const BIOS = [
  'Building high performance web platforms with Next.js 15, Tailwind CSS, and WebGL.',
  'Focused on distributed systems, Rust concurrency, eBPF kernel instrumentation, and Tokio.',
  'Scaling Supabase & PostgreSQL backends to millions of daily active connections.',
  'Passionate about DX, type-safe APIs, GraphQL schemas, and clean code architecture.',
  'Integrating Gemini 1.5 LLMs into modern web runtimes, edge functions, and agentic workflows.',
  'DevOps enthusiast automating CI/CD pipelines with Kubernetes, Docker, and Terraform.',
  'Crafting responsive UI component libraries and accessible design systems.',
  'Security researcher and cryptography advocate. Zero-knowledge proof enthusiast.',
  'Building real-time collaborative canvases and audio synthesizers in WebAssembly.',
  'Full stack engineer exploring Go microservices, gRPC protocols, and Kafka streaming.'
];

const FIRST_NAMES = [
  'Sarah', 'Marcus', 'Elena', 'David', 'Aria', 'Lucas', 'Priya', 'Alex',
  'Kaito', 'Hannah', 'Liam', 'Zoe', 'Viktor', 'Camila', 'Julian', 'Nadia',
  'Gabriel', 'Fatima', 'Ethan', 'Mei-Ling', 'Oliver', 'Sophia', 'Noah', 'Isabella',
  'Benjamin', 'Emma', 'Mason', 'Ava', 'Logan', 'Mia', 'James', 'Charlotte',
  'Alexander', 'Amelia', 'Elijah', 'Harper', 'Daniel', 'Evelyn', 'Matthew', 'Abigail',
  'Henry', 'Emily', 'Sebastian', 'Elizabeth', 'Jack', 'Sofia', 'Owen', 'Avery',
  'Samuel', 'Ella', 'Leo', 'Scarlett', 'Wyatt', 'Victoria', 'John', 'Grace',
  'Luke', 'Chloe', 'Anthony', 'Nora', 'Dylan', 'Riley', 'Leo', 'Zoey',
  'Caleb', 'Penelope', 'Ryan', 'Layla', 'Nathan', 'Lillian', 'Isaac', 'Nora',
  'Andrew', 'Hazel', 'Joshua', 'Violet', 'Christopher', 'Aurora', 'Ezekiel', 'Savannah'
];

const LAST_NAMES = [
  'Jenkins', 'Vance', 'Rostova', 'Chen', 'Thorne', 'Meyer', 'Sharma', 'Rivera',
  'Tanaka', 'Abbott', 'O\'Connor', 'Martinez', 'Krum', 'Torres', 'Blake', 'Yilmaz',
  'Silva', 'Al-Sayed', 'Brooks', 'Zhou', 'Wright', 'Rossi', 'Kim', 'Garcia',
  'Hayes', 'Watson', 'Cooper', 'Reed', 'Sanders', 'Patel', 'Wilson', 'Evans',
  'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore',
  'Perez', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Scott', 'Nguyen'
];

// Generate 160 unique, realistic developer profiles
const generatedNames: string[] = [];
for (let i = 0; i < 160; i++) {
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
  generatedNames.push(`${fName} ${lName}`);
}

export const INITIAL_USERS: User[] = generatedNames.map((fullName, index) => {
  if (index === 0) {
    return {
      id: 'usr_1',
      email: 'jayanth@connect2dev.dev',
      username: 'jayanth_dev',
      fullName: 'Jayanth',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Full Stack Architect & Tech Lead on Connect2Dev. Next.js 15, Rust, PostgreSQL & Cloud.',
      role: 'Lead Architect',
      website: 'https://jayanth.dev',
      githubUrl: 'https://github.com/jayanth_dev',
      followersCount: 10,
      followingCount: 10,
      followersIds: ['usr_2', 'usr_3', 'usr_4', 'usr_5', 'usr_6', 'usr_7', 'usr_8', 'usr_9', 'usr_10', 'usr_11'],
      followingIds: ['usr_2', 'usr_3', 'usr_4', 'usr_5', 'usr_6', 'usr_7', 'usr_8', 'usr_9', 'usr_10', 'usr_11'],
      createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    };
  }

  if (index === 1) {
    return {
      id: 'usr_2',
      email: 'sarah_jenkins@connecthub.dev',
      username: 'sarah_jenkins',
      fullName: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Principal Frontend Engineer & UI Specialist building design systems and React 19 apps.',
      role: 'Principal Engineer',
      website: 'https://sarahjenkins.dev',
      githubUrl: 'https://github.com/sarahjenkins',
      followersCount: 210,
      followingCount: 45,
      followersIds: [],
      followingIds: [],
      createdAt: new Date(Date.now() - 86400000 * 175).toISOString(),
    };
  }

  const username = fullName.toLowerCase().replace(/[^a-z]/g, '') + '_' + (index + 1);
  const id = `usr_${index + 1}`;
  const avatarUrl = AVATARS[index % AVATARS.length];
  const role = ROLES[index % ROLES.length];
  const bio = BIOS[index % BIOS.length];

  return {
    id,
    email: `${username}@connecthub.dev`,
    username,
    fullName,
    avatarUrl,
    bio,
    role,
    website: `https://${username}.dev`,
    githubUrl: `https://github.com/${username}`,
    followersCount: 0,
    followingCount: 0,
    followersIds: [],
    followingIds: [],
    createdAt: new Date(Date.now() - 86400000 * (50 + index * 2)).toISOString(),
  };
});

// Interlink real followers & following among all 160 users dynamically
INITIAL_USERS.forEach((user, i) => {
  if (user.id === 'usr_1') {
    const first10 = ['usr_2', 'usr_3', 'usr_4', 'usr_5', 'usr_6', 'usr_7', 'usr_8', 'usr_9', 'usr_10', 'usr_11'];
    user.followersIds = [...first10];
    user.followingIds = [...first10];
    user.followersCount = 10;
    user.followingCount = 10;
    return;
  }

  // Assign deterministic real connections from existing users
  const peerIds: string[] = [];
  for (let j = 1; j <= 5; j++) {
    const peerIdx = (i + j * 7) % INITIAL_USERS.length;
    if (peerIdx !== i) {
      peerIds.push(INITIAL_USERS[peerIdx].id);
    }
  }

  // Ensure 1-to-1 reciprocity with Jayanth for first 10 users (usr_2 to usr_11)
  if (i >= 1 && i <= 10) {
    if (!peerIds.includes('usr_1')) {
      peerIds[0] = 'usr_1';
    }
  }

  const uniquePeers = Array.from(new Set(peerIds));
  user.followersIds = [...uniquePeers];
  user.followingIds = [...uniquePeers];
  user.followersCount = uniquePeers.length;
  user.followingCount = uniquePeers.length;
});

const SAMPLE_POST_CONTENTS = [
  "Just migrated our main API gateway to Rust using Axum and Tokio. Memory footprint dropped from 1.2GB down to 45MB while throughput doubled! Compile-time type safety gives us immense confidence during production deployments. #Rust #Tokio #Performance #SOLID_Principles",
  "Pro Tip for Next.js 15: Server Actions combined with optimistic UI hooks make form submissions feel instantaneous. Always pair `useOptimistic` with graceful rollback state when handling cloud mutations. #NextJS15 #React19 #WebDev",
  "Deep dive into PostgreSQL indexing today: B-Tree vs BRIN indexes for time-series logs. BRIN indexes saved us over 80% storage space on tables exceeding 100M rows with minimal query latency trade-offs. #PostgreSQL #Database #SupabaseEdge",
  "Clean Architecture Rule: Never expose internal database schema models directly to your client components. Use dedicated Data Transfer Objects (DTOs) or type wrappers to prevent tight coupling. #SOLID_Principles #CleanCode #TypeScript_5_8",
  "Automated zero-downtime blue/green deployments using Kubernetes and Nginx ingress today. Rolling updates are completely seamless now with zero dropped requests during load testing. #DevOps #Kubernetes #Docker",
  "Exploring Gemini 1.5 Flash for automated code review summaries in pull requests. Streaming token responses directly into GitHub check runs gives instant feedback to developers! #AI_Gemini #LLM #Automation",
  "Type-safe environment variables in Vite: Always use Zod to validate `import.meta.env` at startup. Saves hours of runtime debugging caused by missing client-side environment keys. #TypeScript_5_8 #Vite #DX",
  "Building a custom real-time collaboration canvas using Canvas API and WebSockets. Delta compression algorithm reduced binary payload sizes by 70%. #WebSockets #Realtime #Canvas",
  "Why we chose Supabase Edge Functions & Row Level Security (RLS) over custom API middleware: RLS policies execute directly at the PostgreSQL layer, making data access controls bulletproof. #SupabaseEdge #PostgreSQL #Security",
  "Micro-frontend architecture using Module Federation in 2026: The key is shared dependency singletons and isolated state scopes. What is your team's strategy for sub-app routing? #Frontend #React19 #Architecture",
  "Refactoring 5,000 lines of legacy JavaScript to strict TypeScript 5.8 with zero `any` types! Strict null checks caught 14 subtle edge case bugs before reaching production. #TypeScript_5_8 #Refactoring #Quality",
  "Drizzle ORM vs Prisma in high-concurrency Node environments: Drizzle's lightweight SQL generator generated queries with 3x lower latency during our stress tests. #NextJS15 #ORM #NodeJS",
  "Understanding SOLID Principles in Modern Frontend Engineering: Dependency Inversion makes React components modular, testable, and completely decoupled from specific HTTP client implementations. #SOLID_Principles #React19 #WebDev",
  "Supabase Edge Functions are insane for low-latency serverless workloads! We moved our JWT validation and geofencing pipeline to Edge workers with sub-10ms response times. #SupabaseEdge #Serverless #CloudArchitecture",
  "Next.js 15 Partial Prerendering (PPR) in practice: Combining static shell generation with dynamic server streaming gives the best of both worlds for fast initial paint and live user metrics. #NextJS15 #Performance #Frontend",
  "Designing distributed locks with Redis Redlock algorithm for distributed task scheduling. Prevents race conditions during high-volume cron processing. #Redis #DistributedSystems #Backend",
  "GraphQL vs REST in modern microservice architectures: Schema stitching & federated gateways allow frontend teams to iterate independently while sharing unified data graphs. #GraphQL #API #Microservices",
  "WebAssembly (Wasm) in the browser: Running C++ physics engines directly inside web workers at 60fps without blocking the main browser thread! #WebAssembly #Wasm #Performance",
  "Tailwind CSS v4 engine performance benchmark: Zero-config CSS builds run 10x faster with the Rust-powered Lightning CSS compiler core. #TailwindCSS #CSS #Frontend",
  "Securing JWT auth in single-page apps: Storing refresh tokens in HTTP-only SameSite cookies and access tokens in memory eliminates XSS token exfiltration risks! #Security #JWT #WebDev"
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1000&auto=format&fit=crop&q=80',
];

// Generate initial posts authored by various users in INITIAL_USERS
export const INITIAL_POSTS: Post[] = [];

for (let i = 0; i < 60; i++) {
  // Rotate authors across existing users (usr_2 to usr_30)
  const authorIdx = (i % 29) + 1; // Skips 0 so feed is rich with posts from Sarah, Alex, Marcus, Elena, Priya, David, etc.
  const author = INITIAL_USERS[authorIdx];
  const content = SAMPLE_POST_CONTENTS[i % SAMPLE_POST_CONTENTS.length];
  const hasImage = i % 3 === 0;

  // Build EXACTLY 50 real liker profiles from INITIAL_USERS for EVERY post
  const likers: User[] = [];
  for (let k = 0; k < 50; k++) {
    const likerIdx = (i * 3 + k) % INITIAL_USERS.length;
    if (!likers.some((l) => l.id === INITIAL_USERS[likerIdx].id)) {
      likers.push(INITIAL_USERS[likerIdx]);
    }
  }

  // Build EXACTLY 5 real commenter profiles from INITIAL_USERS
  const commentTexts = [
    "Awesome write-up! What was the biggest architecture trade-off you encountered during this migration?",
    "Great insights! We implemented a similar pattern last month and saw huge latency and memory reductions.",
    "Thanks for sharing this code snippet! Bookmarked and shared with our frontend engineering team.",
    "Subscribed for more updates! Are you planning a follow-up benchmarking article on this topic?",
    "Very clean implementation! The compile-time type safety here is super reassuring for production."
  ];

  const comments = [];
  for (let c = 0; c < 5; c++) {
    const commenter = INITIAL_USERS[(i * 3 + c * 7 + 2) % INITIAL_USERS.length];
    comments.push({
      id: `cmt_${i + 1}_${c + 1}`,
      postId: `post_${i + 1}`,
      userId: commenter.id,
      user: commenter,
      content: commentTexts[c],
      createdAt: new Date(Date.now() - (3600000 * (i + 1) + c * 900000)).toISOString(),
    });
  }

  INITIAL_POSTS.push({
    id: `post_${i + 1}`,
    userId: author.id,
    user: author,
    content,
    imageUrl: hasImage ? SAMPLE_IMAGES[i % SAMPLE_IMAGES.length] : undefined,
    likesCount: likers.length,
    commentsCount: comments.length,
    isLiked: i % 2 === 0,
    isSaved: i % 4 === 0,
    likedByUsers: likers,
    comments,
    createdAt: new Date(Date.now() - 3600000 * (i * 2 + 1)).toISOString(),
  });
}

// Initial Communities
export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm_nextjs',
    name: 'r/nextjs_experts',
    slug: 'nextjs_experts',
    description: 'Master Next.js App Router, Server Components, Caching strategies, and Turbopack performance.',
    color: 'bg-orange-500',
    subscribersCount: '14.2k',
    topics: ['App Router', 'Server Actions', 'SSR', 'Middleware', 'Caching'],
  },
  {
    id: 'comm_ts',
    name: 'r/typescript_tips',
    slug: 'typescript_tips',
    description: 'Advanced TypeScript generics, type guards, template literal types, and compiler optimization.',
    color: 'bg-blue-500',
    subscribersCount: '22.8k',
    topics: ['Generics', 'Utility Types', 'Strict Mode', 'AST', 'Type Safety'],
  },
  {
    id: 'comm_supabase',
    name: 'r/supabase_hacks',
    slug: 'supabase_hacks',
    description: 'PostgreSQL optimization, Row Level Security, Supabase Edge Functions, and Realtime sync.',
    color: 'bg-emerald-500',
    subscribersCount: '8.5k',
    topics: ['PostgreSQL', 'RLS', 'Edge Functions', 'Storage', 'Realtime'],
  },
  {
    id: 'comm_rust',
    name: 'r/rust_performance',
    slug: 'rust_performance',
    description: 'Systems programming with Rust, async runtime, Tokio, WebAssembly compilation, and memory safety.',
    color: 'bg-amber-500',
    subscribersCount: '6.1k',
    topics: ['Tokio', 'Wasm', 'Cargo', 'Zero-Cost Abstractions', 'Concurrency'],
  },
  {
    id: 'comm_ai',
    name: 'r/ai_engineers',
    slug: 'ai_engineers',
    description: 'Integrating LLMs, Gemini 1.5, Vector Databases, RAG pipelines, and agentic workflows into production apps.',
    color: 'bg-purple-500',
    subscribersCount: '18.9k',
    topics: ['Gemini API', 'Vector Embeddings', 'RAG', 'Prompt Engineering', 'LangChain'],
  }
];

// Pre-populated initial community discussion chat messages
export const INITIAL_COMMUNITY_MESSAGES: CommunityMessage[] = [
  {
    id: 'msg_1',
    communityId: 'comm_nextjs',
    userId: INITIAL_USERS[0].id,
    user: INITIAL_USERS[0],
    content: 'Welcome to r/nextjs_experts! Post your questions regarding App Router, caching patterns, or Next.js 15 upgrades here.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'msg_2',
    communityId: 'comm_nextjs',
    userId: INITIAL_USERS[1].id,
    user: INITIAL_USERS[1],
    content: 'Has anyone benchmarked Server Actions vs API routes under high concurrent load? Here is our performance telemetry chart:',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'msg_3',
    communityId: 'comm_ts',
    userId: INITIAL_USERS[2].id,
    user: INITIAL_USERS[2],
    content: 'Sharing a useful utility type today: `DeepReadonly<T>` to make nested objects completely immutable without runtime overhead.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg_4',
    communityId: 'comm_supabase',
    userId: INITIAL_USERS[3].id,
    user: INITIAL_USERS[3],
    content: 'Pro tip for Supabase RLS: Always index foreign key columns used inside `auth.uid() = user_id` checks to speed up query execution by 10x!',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

// Notifications linked to real users & real posts
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: INITIAL_USERS[0].id,
    actor: INITIAL_USERS[1],
    type: 'like',
    postSummary: 'Just migrated our main API gateway to Rust using Axum...',
    postId: 'post_1',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    isRead: false,
  },
  {
    id: 'notif_2',
    userId: INITIAL_USERS[0].id,
    actor: INITIAL_USERS[2],
    type: 'comment',
    postSummary: 'Pro Tip for Next.js 15: Server Actions combined with optimistic UI...',
    postId: 'post_2',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    isRead: false,
  },
  {
    id: 'notif_3',
    userId: INITIAL_USERS[0].id,
    actor: INITIAL_USERS[3],
    type: 'follow',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: false,
  },
  {
    id: 'notif_4',
    userId: INITIAL_USERS[0].id,
    actor: INITIAL_USERS[4],
    type: 'like',
    postSummary: 'Deep dive into PostgreSQL indexing today...',
    postId: 'post_3',
    createdAt: new Date(Date.now() - 1000 * 3600 * 20).toISOString(),
    isRead: true,
  },
  {
    id: 'notif_5',
    userId: INITIAL_USERS[0].id,
    actor: INITIAL_USERS[5],
    type: 'mention',
    postSummary: 'Clean Architecture Rule: Never expose internal database schema...',
    postId: 'post_4',
    createdAt: new Date(Date.now() - 1000 * 3600 * 36).toISOString(),
    isRead: true,
  }
];
