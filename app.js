const CACHE = new Map();
const DEFAULT_THEME = 'dark';
const PAGE_SIZE = 5;
const BASE_PATH = detectBasePath();

function detectBasePath() {
  const path = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  const match = path.match(/^(.*?)(?:\/(career|blog))?$/);
  const base = match?.[1] ?? path;
  return base === '/' ? '' : base;
}

function toAbsoluteRoute(route) {
  if (route === '/') {
    return `${BASE_PATH || ''}/`;
  }
  return `${BASE_PATH}${route}` || route;
}


const state = {
  route: '/',
  theme: DEFAULT_THEME,
  siteConfig: null,
  career: null,
  blogIndex: null,
  blogShown: PAGE_SIZE,
  selectedPostSlug: null,
  isNavigating: false,
};

const elements = {
  body: document.body,
  heroStage: document.getElementById('heroStage'),
  heroTitle: document.getElementById('heroTitle'),
  heroSubline: document.getElementById('heroSubline'),
  heroPanels: document.getElementById('heroPanels'),
  contentStage: document.getElementById('contentStage'),
  socials: document.getElementById('socials'),
  themeToggle: document.getElementById('themeToggle'),
  themeToggleLabel: document.querySelector('.theme-toggle-label'),
  brandHomeButton: document.getElementById('brandHomeButton'),
  viewport: document.getElementById('viewport'),
};

const iconPaths = {
  GitHub: 'M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.22 1.83 1.22 1.06 1.8 2.79 1.28 3.47.98.11-.76.41-1.28.75-1.57-2.67-.3-5.47-1.32-5.47-5.87 0-1.3.47-2.37 1.23-3.2-.12-.3-.53-1.52.12-3.16 0 0 1-.32 3.3 1.22a11.44 11.44 0 0 1 6 0c2.29-1.54 3.3-1.22 3.3-1.22.65 1.64.24 2.86.12 3.16.77.83 1.23 1.9 1.23 3.2 0 4.56-2.8 5.57-5.48 5.86.42.36.8 1.06.8 2.15v3.2c0 .32.21.69.82.58A12 12 0 0 0 12 .5Z',
  Mail: 'M2.5 5.5A2.5 2.5 0 0 1 5 3h14a2.5 2.5 0 0 1 2.5 2.5v13A2.5 2.5 0 0 1 19 21H5a2.5 2.5 0 0 1-2.5-2.5v-13Zm2.02-.5 7.48 6.14L19.48 5H4.52Zm14.98 2.25-6.53 5.35a1.5 1.5 0 0 1-1.9 0L4.5 7.25V18.5a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V7.25Z',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function fetchJSON(url) {
  if (CACHE.has(url)) return CACHE.get(url);
  const promise = fetch(url).then((response) => {
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return response.json();
  });
  CACHE.set(url, promise);
  return promise;
}

async function fetchText(url) {
  if (CACHE.has(url)) return CACHE.get(url);
  const promise = fetch(url).then((response) => {
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return response.text();
  });
  CACHE.set(url, promise);
  return promise;
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.decoding = 'async';
    image.src = url;
  });
}

function idle(callback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 1200 });
  } else {
    window.setTimeout(callback, 180);
  }
}

function getRouteFromLocation() {
  const redirectedPath = sessionStorage.getItem('phnx-spa-redirect');
  if (redirectedPath) {
    sessionStorage.removeItem('phnx-spa-redirect');
    const normalized = redirectedPath.replace(location.origin, '');
    history.replaceState({}, '', normalized);
  }

  const path = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  const normalized = BASE_PATH && path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) || '/' : path;
  if (normalized === '/career') return '/career';
  if (normalized === '/blog') return '/blog';
  return '/';
}

function setTheme(theme) {
  state.theme = theme;
  elements.body.dataset.theme = theme;
  elements.themeToggleLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  localStorage.setItem('phnx-theme', theme);
}

function loadStoredTheme() {
  const stored = localStorage.getItem('phnx-theme');
  if (stored === 'dark' || stored === 'light') {
    setTheme(stored);
  } else {
    setTheme(DEFAULT_THEME);
  }
}

function toDisplayDate(dateString) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

function compareByDateDesc(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function getLatestPost() {
  return [...(state.blogIndex?.entries ?? [])].sort(compareByDateDesc)[0] ?? null;
}

function getCurrentCareerItem() {
  return state.career?.items?.find((item) => item.current) ?? state.career?.items?.[0] ?? null;
}

function renderSocials() {
  const socials = state.siteConfig?.socials ?? [];
  elements.socials.innerHTML = socials
    .map((social) => {
      const icon = iconPaths[social.label] || iconPaths.Mail;
      return `
        <a class="social-link" href="${escapeHtml(social.href)}" target="_blank" rel="noreferrer noopener">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="${icon}"></path>
          </svg>
          <span class="social-link-label">${escapeHtml(social.label)}</span>
        </a>
      `;
    })
    .join('');
}

function renderHomePanels() {
  const latestPost = getLatestPost();
  const currentCareer = getCurrentCareerItem();
  const stack = state.siteConfig?.coreStack ?? [];
  const labels = state.siteConfig?.home ?? {};

  elements.heroPanels.innerHTML = `
    <article class="home-panel">
      <div>
        <p class="panel-eyebrow">${escapeHtml(labels.latestBlogLabel ?? 'Neuester Blog')}</p>
        <h2 class="panel-title">${escapeHtml(latestPost?.title ?? 'Kein Eintrag')}</h2>
        <p class="panel-body">${escapeHtml(latestPost?.excerpt ?? 'Noch keine Blogeinträge vorhanden.')}</p>
      </div>
      <button class="panel-link" type="button" data-route="/blog">Zum Blog</button>
    </article>

    <article class="home-panel">
      <div>
        <p class="panel-eyebrow">${escapeHtml(labels.careerLabel ?? 'Aktuelle Station')}</p>
        <h2 class="panel-title">${escapeHtml(currentCareer?.title ?? 'Noch keine Station')}</h2>
        <p class="panel-body">${escapeHtml(currentCareer?.subtitle ?? '')}</p>
      </div>
      <button class="panel-link" type="button" data-route="/career">Zur Career</button>
    </article>

    <article class="home-panel">
      <div>
        <p class="panel-eyebrow">${escapeHtml(labels.stackLabel ?? 'Core Stack')}</p>
        <h2 class="panel-title">Technischer Kern</h2>
        <div class="panel-stack">
          ${stack.map((item) => `<span class="stack-chip">${escapeHtml(item)}</span>`).join('')}
        </div>
      </div>
      <p class="panel-body">Werkzeuge, Sprachen und Kompetenzen von Philipp Wöhler</p>
    </article>
  `;
}

function renderHomeState() {
  elements.heroStage.classList.remove('is-folding');
  elements.contentStage.classList.remove('is-visible');
  elements.contentStage.innerHTML = '';
  updateNavState();
}

function createLoadingMarkup() {
  return `
    <div class="loading-shell">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  `;
}

function renderCareerPage() {
  const items = [...(state.career?.items ?? [])];
  const current = getCurrentCareerItem();
  const selected = items.find((item) => item.id === state.selectedCareerId) ?? current ?? items[0] ?? null;

  if (!state.selectedCareerId && selected) {
    state.selectedCareerId = selected.id;
  }

  elements.contentStage.innerHTML = `
    <div class="content-stage-inner career-page">
      <section class="page-hero">
        <p class="section-kicker">Karriere</p>
        <h2 class="section-title">Lebenslauf und wichtige Stationen</h2>
        <p class="section-body">${escapeHtml(state.career?.summary ?? '')}</p>
      </section>

      <section class="career-layout career-layout--timeline-only">
        <div class="career-list timeline-list">
          ${items
            .map(
              (item) => `
                <article class="career-list-item timeline-item ${state.selectedCareerId === item.id ? 'is-selected' : ''} ${item.current ? 'is-current' : ''}" data-career-id="${escapeHtml(item.id)}">
                  <div class="timeline-item-head">
                    <p class="timeline-period">${escapeHtml(item.period)}</p>
                    ${item.current ? '<span class="timeline-status">läuft aktuell</span>' : ''}
                  </div>
                  <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
                  <p class="timeline-body">${escapeHtml(item.subtitle)}</p>
                </article>
              `,
            )
            .join('')}
        </div>

        <div class="career-viewer" id="careerViewer">
          <div class="viewer-placeholder">Station wird geladen …</div>
        </div>
      </section>
    </div>
  `;

  renderCareerViewer(selected);
}

function renderCareerViewer(item) {
  const viewer = elements.contentStage.querySelector('#careerViewer');
  if (!viewer) return;

  if (!item) {
    viewer.innerHTML = `<div class="viewer-placeholder">Station nicht gefunden.</div>`;
    return;
  }

  viewer.innerHTML = `
    <article class="article-viewer career-viewer-card ${item.current ? 'is-current' : ''}">
      <div class="career-viewer-head">
        <div>
          <p class="viewer-meta">${escapeHtml(item.period)}</p>
          <h3 class="article-title">${escapeHtml(item.title)}</h3>
        </div>
        ${item.current ? '<span class="inline-chip is-live">Laufend</span>' : ''}
      </div>
      <p class="article-excerpt">${escapeHtml(item.subtitle)}</p>
      <div class="article-content">
        <p>${escapeHtml(item.body)}</p>
        ${(item.highlights ?? []).length ? `
          <ul class="card-list">
            ${(item.highlights ?? []).map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </article>
  `;
}

function renderMarkdown(markdown) {
  const normalized = markdown.replace(/\r\n?/g, '\n').trim();
  const codeBlocks = [];

  let working = normalized.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_, language = '', code = '') => {
    const token = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`
      <pre><code class="language-${escapeHtml(language)}">${escapeHtml(code.trimEnd())}</code></pre>
    `);
    return token;
  });

  const lines = working.split('\n');
  const blocks = [];
  let paragraphBuffer = [];
  let listBuffer = null;

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    blocks.push(`<p>${inlineMarkdown(paragraphBuffer.join(' '))}</p>`);
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer) return;
    const tag = listBuffer.type === 'ol' ? 'ol' : 'ul';
    blocks.push(`<${tag}>${listBuffer.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${tag}>`);
    listBuffer = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('__CODE_BLOCK_')) {
      flushParagraph();
      flushList();
      blocks.push(line);
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${inlineMarkdown(quoteMatch[1])}</blockquote>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList();
        listBuffer = { type: 'ul', items: [] };
      }
      listBuffer.items.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList();
        listBuffer = { type: 'ol', items: [] };
      }
      listBuffer.items.push(orderedMatch[1]);
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  let html = blocks.join('');
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return `<article class="markdown">${html}</article>`;
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
}

async function renderBlogViewer(slug) {
  const viewer = elements.contentStage.querySelector('#blogViewer');
  if (!viewer) return;

  const post = state.blogIndex.entries.find((entry) => entry.slug === slug);
  if (!post) {
    viewer.innerHTML = `<div class="viewer-placeholder">Beitrag nicht gefunden.</div>`;
    return;
  }

  viewer.innerHTML = createLoadingMarkup();
  const markdown = await fetchText(`./content/blog/${slug}.md`);

  viewer.innerHTML = `
    <article class="article-viewer">
      <p class="viewer-meta">${escapeHtml(toDisplayDate(post.date))}</p>
      ${renderMarkdown(markdown)}
    </article>
  `;
}

function renderBlogList() {
  const entries = [...(state.blogIndex?.entries ?? [])].sort(compareByDateDesc);
  const visibleEntries = entries.slice(0, state.blogShown);

  elements.contentStage.innerHTML = `
    <div class="content-stage-inner blog-page">
      <section class="page-hero">
        <p class="section-kicker">Blog</p>
        <h2 class="section-title">Markdown-basierte Einträge ohne Seitenreload</h2>
        <p class="section-body">Die Übersicht lädt standardmäßig nur die neuesten fünf Einträge. Weitere Beiträge werden schrittweise erweitert. Einzelne Artikel werden direkt in der bestehenden Shell nachgeladen.</p>
      </section>

      <section class="blog-layout">
        <div class="blog-list" id="blogList">
          ${visibleEntries
            .map(
              (entry) => `
                <article class="blog-list-item ${state.selectedPostSlug === entry.slug ? 'is-selected' : ''}" data-post-slug="${escapeHtml(entry.slug)}">
                  <div class="blog-list-item-header">
                    <div>
                      <p class="article-meta">${escapeHtml(toDisplayDate(entry.date))}</p>
                      <h3 class="article-title">${escapeHtml(entry.title)}</h3>
                    </div>
                  </div>
                  <p class="article-excerpt">${escapeHtml(entry.excerpt)}</p>
                  <div class="tag-row">
                    ${(entry.tags ?? []).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('')}
                  </div>
                </article>
              `,
            )
            .join('')}

          ${entries.length > state.blogShown ? '<button class="show-more" id="showMorePosts" type="button">Weitere Einträge laden</button>' : ''}
        </div>

        <div class="blog-viewer" id="blogViewer">
          <div class="viewer-placeholder">Artikel wird geladen …</div>
        </div>
      </section>
    </div>
  `;

  const firstVisible = visibleEntries[0];
  if (!state.selectedPostSlug || !visibleEntries.some((entry) => entry.slug === state.selectedPostSlug)) {
    state.selectedPostSlug = firstVisible?.slug ?? null;
  }

  renderBlogViewer(state.selectedPostSlug);
}

function waitForAnimation(element) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    const onEnd = () => resolve();
    element.addEventListener('animationend', onEnd, { once: true });
  });
}

function getSwipeTransition(fromRoute, toRoute) {
  if (fromRoute === '/career' && toRoute === '/blog') {
    return {
      outClass: 'is-swipe-out-left',
      inClass: 'is-swipe-in-right',
    };
  }

  if (fromRoute === '/blog' && toRoute === '/career') {
    return {
      outClass: 'is-swipe-out-right',
      inClass: 'is-swipe-in-left',
    };
  }

  return null;
}

async function renderCurrentRoute() {
  elements.contentStage.innerHTML = createLoadingMarkup();

  if (state.route === '/career') {
    renderCareerPage();
    elements.contentStage.classList.add('is-visible');
    updateNavState();
    return;
  }

  if (state.route === '/blog') {
    renderBlogList();
    elements.contentStage.classList.add('is-visible');
    updateNavState();
    return;
  }

  renderHomeState();
}

function updateNavState() {
  document.querySelectorAll('[data-route]').forEach((node) => {
    const route = node.getAttribute('data-route');
    if (!node.classList.contains('nav-link')) return;
    node.classList.toggle('is-active', route === state.route);
  });
}

async function navigate(nextRoute, { push = true } = {}) {
  if (state.isNavigating || nextRoute === state.route) return;
  state.isNavigating = true;

  const currentRoute = state.route;
  const leavingHome = currentRoute === '/' && nextRoute !== '/';
  const returningHome = currentRoute !== '/' && nextRoute === '/';
  const swipeTransition = getSwipeTransition(currentRoute, nextRoute);

  if (push) {
    history.pushState({ route: nextRoute }, '', toAbsoluteRoute(nextRoute));
  }

  if (leavingHome) {
    elements.heroStage.classList.add('is-folding');
    await wait(360);
  }

  if (returningHome) {
    elements.contentStage.classList.remove('is-visible');
    await wait(180);
    state.route = '/';
    renderHomeState();
    await wait(16);
    elements.heroStage.classList.remove('is-folding');
    state.isNavigating = false;
    return;
  }

  const currentInner = elements.contentStage.querySelector('.content-stage-inner');
  if (swipeTransition && currentInner) {
    currentInner.classList.add(swipeTransition.outClass);
    await waitForAnimation(currentInner);
  }

  state.route = nextRoute;
  await renderCurrentRoute();

  if (nextRoute !== '/') {
    elements.contentStage.classList.add('is-visible');
  }

  if (swipeTransition) {
    const nextInner = elements.contentStage.querySelector('.content-stage-inner');
    if (nextInner) {
      nextInner.classList.add(swipeTransition.inClass);
      await waitForAnimation(nextInner);
      nextInner.classList.remove(swipeTransition.inClass);
    }
  }

  updateNavState();
  state.isNavigating = false;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function attachEvents() {
  document.addEventListener('click', async (event) => {
    const routeTrigger = event.target.closest('[data-route]');
    if (routeTrigger) {
      event.preventDefault();
      const nextRoute = routeTrigger.getAttribute('data-route');
      await navigate(nextRoute);
      return;
    }

    const postTrigger = event.target.closest('[data-post-slug]');
    if (postTrigger) {
      const slug = postTrigger.getAttribute('data-post-slug');
      if (!slug || state.selectedPostSlug === slug) return;
      state.selectedPostSlug = slug;
      renderBlogList();
      return;
    }

    const showMore = event.target.closest('#showMorePosts');
    if (showMore) {
      state.blogShown += PAGE_SIZE;
      renderBlogList();
      return;
    }
  });

  elements.themeToggle.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  window.addEventListener('popstate', async () => {
    const nextRoute = getRouteFromLocation();
    if (nextRoute === state.route) return;

    const currentRoute = state.route;
    const swipeTransition = getSwipeTransition(currentRoute, nextRoute);

    if (nextRoute === '/') {
      elements.contentStage.classList.remove('is-visible');
      await wait(180);
      state.route = '/';
      renderHomeState();
      await wait(16);
      elements.heroStage.classList.remove('is-folding');
      return;
    }

    if (currentRoute === '/') {
      elements.heroStage.classList.add('is-folding');
      await wait(220);
    } else if (swipeTransition) {
      const currentInner = elements.contentStage.querySelector('.content-stage-inner');
      if (currentInner) {
        currentInner.classList.add(swipeTransition.outClass);
        await waitForAnimation(currentInner);
      }
    }

    state.route = nextRoute;
    await renderCurrentRoute();
    elements.contentStage.classList.add('is-visible');

    if (swipeTransition) {
      const nextInner = elements.contentStage.querySelector('.content-stage-inner');
      if (nextInner) {
        nextInner.classList.add(swipeTransition.inClass);
        await waitForAnimation(nextInner);
        nextInner.classList.remove(swipeTransition.inClass);
      }
    }
  });
}

async function prefetchContent() {
  const tasks = [
    fetchJSON('./content/site.config.json'),
    fetchJSON('./content/career.json'),
    fetchJSON('./content/blog/index.json'),
    preloadImage('./assets/hero-ambient.webp'),
    preloadImage('./assets/logo-512.webp'),
  ];

  const [siteConfig, career, blogIndex] = await Promise.all(tasks);
  state.siteConfig = siteConfig;
  state.career = career;
  state.blogIndex = blogIndex;
  state.blogIndex.entries.sort(compareByDateDesc);
  state.selectedPostSlug = state.blogIndex.entries[0]?.slug ?? null;

  elements.heroTitle.textContent = siteConfig.siteTitle ?? 'Philipp';
  elements.heroSubline.textContent = siteConfig.subline ?? elements.heroSubline.textContent;

  renderSocials();
  renderHomePanels();

  idle(() => {
    state.blogIndex.entries.slice(0, PAGE_SIZE).forEach((entry) => {
      fetchText(`./content/blog/${entry.slug}.md`).catch(() => undefined);
    });
  });
}

async function bootstrap() {
  loadStoredTheme();
  attachEvents();

  elements.contentStage.innerHTML = createLoadingMarkup();
  await prefetchContent();

  state.route = getRouteFromLocation();

  if (state.route === '/') {
    renderHomeState();
  } else {
    elements.heroStage.classList.add('is-folding');
    await renderCurrentRoute();
    elements.contentStage.classList.add('is-visible');
  }
}

bootstrap().catch((error) => {
  console.error(error);
  elements.contentStage.innerHTML = `
    <div class="content-stage-inner">
      <div class="empty-state">
        <div>
          <p class="section-kicker">Fehler</p>
          <h2 class="section-title">Die Inhalte konnten nicht geladen werden.</h2>
          <p class="section-body">Prüfe, ob die Seite über einen lokalen Server läuft. Direkte file://-Zugriffe blockieren die Fetch-Aufrufe für JSON und Markdown.</p>
        </div>
      </div>
    </div>
  `;
});
