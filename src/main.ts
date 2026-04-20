import './style.css';

type RouteKey = 'home' | 'career' | 'blog';
type Theme = 'dark' | 'light';

type CareerEntry = {
  period: string;
  title: string;
  meta: string;
  description: string;
  highlights?: string[];
};

type CareerData = {
  heroTag: string;
  title: string;
  intro: string;
  items: CareerEntry[];
  skills: string[];
};

type BlogPostMeta = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
};

type BlogData = {
  heroTag: string;
  title: string;
  intro: string;
  posts: BlogPostMeta[];
};

const SITE = {
  owner: 'Philipp',
  role: 'Code · Systems · Startup',
  summary:
    'Persönliche Website für Projekte, Karriere, technische Notizen und den Aufbau einer klaren, markanten PHNX-Präsenz.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/your-handle' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/your-handle' },
    { label: 'Mail', href: 'mailto:you@example.com' },
  ],
  nav: [
    { label: 'Career', route: 'career' as const },
    { label: 'Blog', route: 'blog' as const },
  ],
  pillars: ['C++', 'Python', 'TypeScript', 'Qt / PyQt', 'SQLite', 'System Design'],
  homeLead: 'Reduziert. Schnell. Klar strukturiert.',
} as const;

const state = {
  route: getRoute(),
  theme: getInitialTheme(),
  blogVisibleCount: 5,
  activePostSlug: null as string | null,
};

const dataCache = new Map<string, Promise<CareerData | BlogData>>();
const markdownCache = new Map<string, Promise<string>>();

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found.');
}

app.innerHTML = `
  <div class="site-shell" id="site-shell" data-route="${state.route}">
    <div class="hero-backdrop" aria-hidden="true"></div>

    <header class="site-header">
      <nav class="header-strip container" aria-label="Primäre Navigation">
        <div class="header-left" id="social-links"></div>

        <a class="logo-link" href="#/" aria-label="Zur Startseite">
          <img class="brand-logo" src="./phnx-logo.png" alt="PHNX Logo" width="72" height="72" />
        </a>

        <div class="header-right">
          <button class="theme-toggle" type="button" id="theme-toggle" aria-label="Theme wechseln">
            <span class="theme-toggle__label">Mode</span>
            <span class="theme-toggle__state" id="theme-toggle-state">${state.theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
          <div class="nav-links" id="nav-links"></div>
        </div>
      </nav>
    </header>

    <main class="page-main">
      <section class="hero container" id="hero-block" aria-label="Hero">
        <div class="hero__eyebrow">PHNX Personal Site</div>
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

const siteShell = document.querySelector<HTMLElement>('#site-shell');
const contentPanel = document.querySelector<HTMLElement>('#content-panel');
const socialLinks = document.querySelector<HTMLElement>('#social-links');
const navLinks = document.querySelector<HTMLElement>('#nav-links');
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
const themeToggleState = document.querySelector<HTMLElement>('#theme-toggle-state');

if (!siteShell || !contentPanel || !socialLinks || !navLinks || !themeToggle || !themeToggleState) {
  throw new Error('Required UI nodes are missing.');
}

function getRoute(): RouteKey {
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash === 'career' || hash === 'blog') {
    return hash;
  }
  return 'home';
}

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem('phnx-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  themeToggleState.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

function createHeaderLink(href: string, label: string, className: string): string {
  return `<a class="${className}" href="${href}">${label}</a>`;
}

function renderHeaderLinks(activeRoute: RouteKey): void {
  socialLinks.innerHTML = SITE.socials
    .map((social) => createHeaderLink(social.href, social.label, 'social-link'))
    .join('');

  navLinks.innerHTML = SITE.nav
    .map(({ label, route }) => {
      const activeClass = activeRoute === route ? 'nav-link is-active' : 'nav-link';
      return `<a class="${activeClass}" href="#/${route}" data-route-link="${route}">${label}</a>`;
    })
    .join('');
}

function setRouteState(route: RouteKey): void {
  state.route = route;
  siteShell.dataset.route = route;
  renderHeaderLinks(route);
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to load content: ${path}`);
  }
  return (await response.json()) as T;
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to load markdown: ${path}`);
  }
  return await response.text();
}

function preloadImage(src: string): void {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

function primeData(route: 'career' | 'blog'): Promise<CareerData | BlogData> {
  const path = `./content/${route}.json`;
  const existing = dataCache.get(path);
  if (existing) {
    return existing;
  }

  const promise = fetchJson<CareerData | BlogData>(path);
  dataCache.set(path, promise);
  return promise;
}

function primeMarkdown(slug: string): Promise<string> {
  const path = `./content/blog/${slug}.md`;
  const existing = markdownCache.get(path);
  if (existing) {
    return existing;
  }

  const promise = fetchText(path);
  markdownCache.set(path, promise);
  return promise;
}

async function getCareerData(): Promise<CareerData> {
  return (await primeData('career')) as CareerData;
}

async function getBlogData(): Promise<BlogData> {
  return (await primeData('blog')) as BlogData;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function renderTagList(items: string[], compact = false): string {
  const modifier = compact ? ' chip-list--compact' : '';
  return `<ul class="chip-list${modifier}">${items.map((item) => `<li class="chip">${item}</li>`).join('')}</ul>`;
}

function renderViewFrame(kicker: string, title: string, intro: string, body: string): string {
  return `
    <div class="view" data-view="${state.route}">
      <div class="panel-head panel-head--stacked">
        <div class="panel-kicker">${kicker}</div>
        <h2 class="panel-title">${title}</h2>
        <p class="panel-intro">${intro}</p>
      </div>
      ${body}
    </div>
  `;
}

function renderHome(career: CareerData, blog: BlogData): string {
  const latestPost = blog.posts[0];
  const currentCareer = career.items[0];

  return `
    <div class="view view--home" data-view="home">
      <div class="home-lead">
        <div>
          <div class="panel-kicker">Overview</div>
          <h2 class="home-lead__title">${SITE.homeLead}</h2>
        </div>
      </div>

      <div class="home-grid">
        <article class="card card--interactive home-card">
          <div class="card-eyebrow">Neuester Blog</div>
          <p class="post-date">${formatDate(latestPost.date)} · ${latestPost.readTime}</p>
          <h3 class="card-title">${latestPost.title}</h3>
          <p class="card-copy">${latestPost.excerpt}</p>
          ${renderTagList(latestPost.tags, true)}
          <div class="card-actions">
            <a class="button button--ghost" href="#/blog">Zum Blog</a>
          </div>
        </article>

        <article class="card card--interactive home-card">
          <div class="card-eyebrow">Aktuelle Station</div>
          <p class="post-date">${currentCareer.period}</p>
          <h3 class="card-title">${currentCareer.title}</h3>
          <p class="timeline-meta">${currentCareer.meta}</p>
          <p class="card-copy">${currentCareer.description}</p>
          <div class="card-actions">
            <a class="button button--ghost" href="#/career">Zur Career-Seite</a>
          </div>
        </article>

        <article class="card card--interactive home-card">
          <div class="card-eyebrow">Core Stack</div>
          <h3 class="card-title">Werkzeuge und Schwerpunkte.</h3>
          <p class="card-copy">
            Fokus auf performante native Systeme, praktische Tooling-Workflows und eine saubere Verbindung
            aus Produktdenken, Architektur und UI.
          </p>
          ${renderTagList([...SITE.pillars])}
        </article>
      </div>
    </div>
  `;
}

function renderCareer(career: CareerData): string {
  const featuredCards = career.items.slice(0, 2);
  const timelineCards = career.items.slice(2);

  return renderViewFrame(
    career.heroTag,
    career.title,
    career.intro,
    `
      <div class="feature-grid">
        ${featuredCards
          .map(
            (item) => `
              <article class="card card--interactive card--feature">
                <div class="card-eyebrow">${item.period}</div>
                <h3 class="card-title">${item.title}</h3>
                <p class="timeline-meta">${item.meta}</p>
                <p class="card-copy">${item.description}</p>
                ${item.highlights ? renderTagList(item.highlights, true) : ''}
              </article>
            `,
          )
          .join('')}
      </div>

      <section class="timeline-panel">
        <div class="timeline-panel__head">
          <div class="card-eyebrow">Zeitstrahl</div>
          <h3 class="card-title">Stationen und Fokusverschiebungen.</h3>
        </div>

        <div class="timeline">
          ${timelineCards
            .map(
              (item) => `
                <article class="timeline-item card--interactive">
                  <div class="timeline-marker" aria-hidden="true"></div>
                  <div class="timeline-period">${item.period}</div>
                  <div class="timeline-body card timeline-card">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="timeline-meta">${item.meta}</p>
                    <p class="card-copy">${item.description}</p>
                    ${item.highlights ? renderTagList(item.highlights, true) : ''}
                  </div>
                </article>
              `,
            )
            .join('')}
        </div>
      </section>

      <section class="card card--interactive card--dense">
        <div class="card-eyebrow">Skills</div>
        <h3 class="card-title">Technischer Schwerpunkt</h3>
        ${renderTagList(career.skills)}
      </section>
    `,
  );
}

function renderBlogList(blog: BlogData): string {
  const visiblePosts = blog.posts.slice(0, state.blogVisibleCount);
  const hasMore = blog.posts.length > state.blogVisibleCount;

  return renderViewFrame(
    blog.heroTag,
    blog.title,
    blog.intro,
    `
      <div class="post-list">
        ${visiblePosts
          .map(
            (post) => `
              <article class="post-card card--interactive">
                <div class="post-meta-row">
                  <p class="post-date">${formatDate(post.date)}</p>
                  <span class="post-readtime">${post.readTime}</span>
                </div>
                <h3 class="card-title">${post.title}</h3>
                <p class="card-copy">${post.excerpt}</p>
                ${renderTagList(post.tags, true)}
                <div class="card-actions">
                  <button class="button button--ghost" type="button" data-post-open="${post.slug}">Eintrag öffnen</button>
                </div>
              </article>
            `,
          )
          .join('')}
      </div>

      <div class="list-actions">
        ${
          hasMore
            ? `<button class="button button--secondary" type="button" data-post-more>Weitere Einträge laden</button>`
            : `<span class="list-actions__hint">Alle Einträge geladen.</span>`
        }
      </div>
    `,
  );
}

async function renderBlogDetail(blog: BlogData, slug: string): Promise<string> {
  const post = blog.posts.find((entry) => entry.slug === slug);
  if (!post) {
    state.activePostSlug = null;
    return renderBlogList(blog);
  }

  const markdown = await primeMarkdown(slug);
  const html = markdownToHtml(markdown);

  return renderViewFrame(
    'Blog',
    post.title,
    `${formatDate(post.date)} · ${post.readTime}`,
    `
      <div class="article-shell">
        <div class="article-shell__actions">
          <button class="button button--ghost" type="button" data-post-back>Zurück zur Übersicht</button>
        </div>

        <article class="article card">
          <div class="article-meta">
            <p class="post-date">${formatDate(post.date)}</p>
            ${renderTagList(post.tags, true)}
          </div>
          <div class="markdown-content">${html}</div>
        </article>
      </div>
    `,
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(value: string): string {
  const codeSpans: string[] = [];
  let output = escapeHtml(value);

  output = output.replace(/`([^`]+)`/g, (_, code: string) => {
    const token = `__CODE_${codeSpans.length}__`;
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  output = output
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  codeSpans.forEach((markup, index) => {
    output = output.replace(`__CODE_${index}__`, markup);
  });

  return output;
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let index = 0;

  const flushParagraph = (buffer: string[]): void => {
    if (buffer.length === 0) {
      return;
    }
    html.push(`<p>${renderInlineMarkdown(buffer.join(' '))}</p>`);
    buffer.length = 0;
  };

  const paragraph: string[] = [];

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraph);
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph(paragraph);
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      flushParagraph(paragraph);
      const language = trimmed.replace(/^```/, '').trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      const languageClass = language ? ` class="language-${escapeHtml(language)}"` : '';
      html.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushParagraph(paragraph);
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      html.push(`<blockquote><p>${renderInlineMarkdown(quoteLines.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph(paragraph);
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(paragraph);
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ol>`);
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph(paragraph);
      html.push('<hr />');
      index += 1;
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph(paragraph);
  return html.join('');
}

async function renderCurrentRoute(): Promise<void> {
  contentPanel.innerHTML = `
    <div class="loading-state">
      <span class="loading-state__pulse"></span>
      <span>Inhalt wird vorbereitet ...</span>
    </div>
  `;

  try {
    let nextMarkup = '';

    if (state.route === 'home') {
      const [career, blog] = await Promise.all([getCareerData(), getBlogData()]);
      nextMarkup = renderHome(career, blog);
    }

    if (state.route === 'career') {
      const career = await getCareerData();
      nextMarkup = renderCareer(career);
    }

    if (state.route === 'blog') {
      const blog = await getBlogData();
      nextMarkup = state.activePostSlug ? await renderBlogDetail(blog, state.activePostSlug) : renderBlogList(blog);
    }

    contentPanel.innerHTML = nextMarkup;
  } catch (error) {
    console.error(error);
    contentPanel.innerHTML = `
      <div class="error-state card">
        <div class="card-eyebrow">Fehler</div>
        <h2 class="card-title">Inhalt konnte nicht geladen werden.</h2>
        <p class="card-copy">Prüfe, ob alle Dateien vollständig hochgeladen wurden und die Pfade stimmen.</p>
      </div>
    `;
  }
}

async function syncRoute(): Promise<void> {
  const nextRoute = getRoute();
  if (nextRoute !== 'blog') {
    state.activePostSlug = null;
    state.blogVisibleCount = 5;
  }
  setRouteState(nextRoute);
  await renderCurrentRoute();
}

contentPanel.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement | null;
  if (!target) {
    return;
  }

  const openButton = target.closest<HTMLElement>('[data-post-open]');
  if (openButton) {
    state.activePostSlug = openButton.dataset.postOpen ?? null;
    await renderCurrentRoute();
    return;
  }

  const backButton = target.closest<HTMLElement>('[data-post-back]');
  if (backButton) {
    state.activePostSlug = null;
    await renderCurrentRoute();
    return;
  }

  const moreButton = target.closest<HTMLElement>('[data-post-more]');
  if (moreButton) {
    state.blogVisibleCount += 5;
    await renderCurrentRoute();
  }
});

themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  window.localStorage.setItem('phnx-theme', state.theme);
  applyTheme(state.theme);
});

window.addEventListener('hashchange', () => {
  void syncRoute();
});

applyTheme(state.theme);
renderHeaderLinks(state.route);
preloadImage('./hero-ambient.webp');
preloadImage('./phnx-logo.png');
void Promise.all([getCareerData(), getBlogData()]).then(([_, blog]) => {
  blog.posts.slice(0, 5).forEach((post) => {
    void primeMarkdown(post.slug);
  });
});
void syncRoute();
