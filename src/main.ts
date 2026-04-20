import './style.css';

type RouteKey = 'home' | 'career' | 'blog';
type Theme = 'dark' | 'light';

type CareerData = {
  heroTag: string;
  title: string;
  intro: string;
  items: Array<{
    period: string;
    title: string;
    meta: string;
    description: string;
  }>;
  skills: string[];
};

type BlogData = {
  heroTag: string;
  title: string;
  intro: string;
  posts: Array<{
    date: string;
    title: string;
    excerpt: string;
    tags: string[];
  }>;
};

const SITE = {
  name: 'PHNX',
  owner: 'Philipp',
  role: 'Code • Systems • Products',
  summary:
    'Persönliche Website mit Fokus auf performante Software, saubere Architektur und eine reduzierte, markante Brand-Ästhetik.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/your-handle' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/your-handle' },
    { label: 'Mail', href: 'mailto:you@example.com' },
  ],
  homeCards: [
    {
      eyebrow: 'Systems',
      title: 'Robuste technische Strukturen.',
      text: 'Architektur vor Zufall. Komponenten, Datenflüsse und Zustände sollen klar und dauerhaft wartbar bleiben.',
    },
    {
      eyebrow: 'Performance',
      title: 'Schnelle Oberflächen ohne Ballast.',
      text: 'Minimale Laufzeit, frühes Preloading und kontrollierte Assets statt unnötiger Framework-Schichten.',
    },
    {
      eyebrow: 'Product',
      title: 'Technik im Dienst eines Produkts.',
      text: 'Nicht nur bauen, sondern bewusst entscheiden, was eine Oberfläche, ein Tool oder ein Workflow wirklich leisten muss.',
    },
  ],
  pillars: ['C++', 'Python', 'TypeScript', 'UI Systems', 'Data Tools', 'Startup Thinking'],
} as const;

const contentCache = new Map<string, Promise<CareerData | BlogData>>();

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found.');
}

app.innerHTML = `
  <div class="site-shell">
    <div class="hero-backdrop" aria-hidden="true"></div>
    <header class="site-header">
      <nav class="header-strip container" aria-label="Primäre Navigation">
        <div class="header-left" id="social-links"></div>
        <a class="logo-link" href="#/" aria-label="Zur Startseite">
          <img class="brand-logo" src="./phnx-logo.png" alt="PHNX Logo" width="72" height="72" />
        </a>
        <div class="header-right">
          <button class="theme-toggle" type="button" id="theme-toggle" aria-label="Theme wechseln">
            <span class="theme-toggle__label">Theme</span>
            <span class="theme-toggle__state" id="theme-toggle-state">Dark</span>
          </button>
          <div class="nav-links" id="nav-links"></div>
        </div>
      </nav>
    </header>

    <main class="page-main">
      <section class="hero container">
        <div class="hero__eyebrow">Personal Site</div>
        <h1 class="hero__title">${SITE.owner}</h1>
        <p class="hero__subtitle">${SITE.role}</p>
        <p class="hero__summary">${SITE.summary}</p>
      </section>

      <section class="content-host container">
        <div class="content-panel" id="content-panel" aria-live="polite"></div>
      </section>
    </main>
  </div>
`;

const contentPanelNode = document.querySelector<HTMLElement>('#content-panel');
const socialLinksNode = document.querySelector<HTMLElement>('#social-links');
const navLinksNode = document.querySelector<HTMLElement>('#nav-links');
const themeToggleNode = document.querySelector<HTMLButtonElement>('#theme-toggle');
const themeToggleStateNode = document.querySelector<HTMLElement>('#theme-toggle-state');

if (!contentPanelNode || !socialLinksNode || !navLinksNode || !themeToggleNode || !themeToggleStateNode) {
  throw new Error('Required UI nodes are missing.');
}

const contentPanel = contentPanelNode;
const socialLinks = socialLinksNode;
const navLinks = navLinksNode;
const themeToggle = themeToggleNode;
const themeToggleState = themeToggleStateNode;

function createLink(href: string, label: string, className = 'text-link'): string {
  return `<a class="${className}" href="${href}">${label}</a>`;
}

function renderHeaderLinks(activeRoute: RouteKey): void {
  socialLinks.innerHTML = SITE.socials
    .map((social) => createLink(social.href, social.label, 'social-link'))
    .join('');

  const routes: Array<{ label: string; route: RouteKey }> = [
    { label: 'Career', route: 'career' },
    { label: 'Blog', route: 'blog' },
  ];

  navLinks.innerHTML = routes
    .map(({ label, route }) => {
      const activeClass = activeRoute === route ? 'nav-link is-active' : 'nav-link';
      return `<a class="${activeClass}" data-route-link="${route}" href="#/${route}">${label}</a>`;
    })
    .join('');
}

function getRoute(): RouteKey {
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash === 'career' || hash === 'blog') {
    return hash;
  }
  return 'home';
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to load content: ${path}`);
  }
  return (await response.json()) as T;
}

function preloadImage(src: string): void {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

function primeContent(route: Exclude<RouteKey, 'home'>): Promise<CareerData | BlogData> {
  const path = `./content/${route}.json`;
  const existing = contentCache.get(path);
  if (existing) {
    return existing;
  }

  const promise = fetchJson<CareerData | BlogData>(path);
  contentCache.set(path, promise);
  return promise;
}

function renderTagList(items: string[]): string {
  return items.map((item) => `<li class="chip">${item}</li>`).join('');
}

function renderHome(): string {
  return `
    <div class="view" data-view="home">
      <div class="panel-head">
        <div>
          <div class="panel-kicker">Overview</div>
          <h2 class="panel-title">Reduziert, schnell, erweiterbar.</h2>
        </div>
        <a class="button button--primary" href="mailto:you@example.com">Kontakt</a>
      </div>

      <div class="card-grid">
        ${SITE.homeCards
          .map(
            (card) => `
              <article class="card">
                <div class="card-eyebrow">${card.eyebrow}</div>
                <h3 class="card-title">${card.title}</h3>
                <p class="card-copy">${card.text}</p>
              </article>
            `,
          )
          .join('')}
      </div>

      <div class="split-layout">
        <section class="card card--dense">
          <div class="card-eyebrow">Approach</div>
          <h3 class="card-title">Eine Seite, mehrere Inhalte, keine Reloads.</h3>
          <p class="card-copy">
            Career und Blog laufen in derselben Shell. Navigation wechselt nur die zentrale View,
            der Header, das Hero-Layout und die Brand-Atmosphäre bleiben stabil. Das reduziert Reflows,
            spart Netzwerkkosten und fühlt sich unmittelbarer an.
          </p>
        </section>

        <section class="card card--dense">
          <div class="card-eyebrow">Core Stack</div>
          <ul class="chip-list">
            ${renderTagList([...SITE.pillars])}
          </ul>
        </section>
      </div>
    </div>
  `;
}

function renderCareer(data: CareerData): string {
  return `
    <div class="view" data-view="career">
      <div class="panel-head panel-head--stacked">
        <div class="panel-kicker">${data.heroTag}</div>
        <h2 class="panel-title">${data.title}</h2>
        <p class="panel-intro">${data.intro}</p>
      </div>

      <div class="timeline">
        ${data.items
          .map(
            (item) => `
              <article class="timeline-item">
                <div class="timeline-period">${item.period}</div>
                <div class="timeline-body">
                  <h3 class="card-title">${item.title}</h3>
                  <p class="timeline-meta">${item.meta}</p>
                  <p class="card-copy">${item.description}</p>
                </div>
              </article>
            `,
          )
          .join('')}
      </div>

      <section class="card card--dense">
        <div class="card-eyebrow">Skills</div>
        <ul class="chip-list">
          ${renderTagList(data.skills)}
        </ul>
      </section>
    </div>
  `;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function renderBlog(data: BlogData): string {
  return `
    <div class="view" data-view="blog">
      <div class="panel-head panel-head--stacked">
        <div class="panel-kicker">${data.heroTag}</div>
        <h2 class="panel-title">${data.title}</h2>
        <p class="panel-intro">${data.intro}</p>
      </div>

      <div class="post-list">
        ${data.posts
          .map(
            (post) => `
              <article class="post-card">
                <div class="post-date">${formatDate(post.date)}</div>
                <h3 class="card-title">${post.title}</h3>
                <p class="card-copy">${post.excerpt}</p>
                <ul class="chip-list chip-list--compact">
                  ${renderTagList(post.tags)}
                </ul>
              </article>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('phnx-theme', theme);
  themeToggleState.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

async function getRouteMarkup(route: RouteKey): Promise<string> {
  switch (route) {
    case 'career': {
      const data = (await primeContent('career')) as CareerData;
      return renderCareer(data);
    }
    case 'blog': {
      const data = (await primeContent('blog')) as BlogData;
      return renderBlog(data);
    }
    case 'home':
    default:
      return renderHome();
  }
}

async function updateView(route: RouteKey): Promise<void> {
  renderHeaderLinks(route);
  const markup = await getRouteMarkup(route);

  const commit = () => {
    contentPanel.innerHTML = markup;
    document.body.dataset.route = route;
  };

  if ('startViewTransition' in document) {
    const documentWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<void> };
    };
    documentWithTransition.startViewTransition?.(commit);
    return;
  }

  commit();
}

function scheduleIdle(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    (window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback) => number;
    }).requestIdleCallback?.(() => callback());
    return;
  }
  globalThis.setTimeout(callback, 180);
}

function setupPrefetch(): void {
  const prefetch = (route: Exclude<RouteKey, 'home'>) => {
    void primeContent(route);
  };

  document.addEventListener(
    'pointerenter',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const link = target.closest<HTMLElement>('[data-route-link]');
      const route = link?.dataset.routeLink;
      if (route === 'career' || route === 'blog') {
        prefetch(route);
      }
    },
    true,
  );

  document.addEventListener(
    'focusin',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const link = target.closest<HTMLElement>('[data-route-link]');
      const route = link?.dataset.routeLink;
      if (route === 'career' || route === 'blog') {
        prefetch(route);
      }
    },
    true,
  );
}

function setupTheme(): void {
  applyTheme(getTheme());
  themeToggle.addEventListener('click', () => {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}

function setupRouting(): void {
  window.addEventListener('hashchange', () => {
    void updateView(getRoute());
  });

  if (!window.location.hash) {
    window.location.hash = '#/';
    return;
  }

  void updateView(getRoute());
}

setupTheme();
setupPrefetch();
setupRouting();
preloadImage('./hero-ambient.webp');
scheduleIdle(() => {
  void primeContent('career');
  void primeContent('blog');
});
