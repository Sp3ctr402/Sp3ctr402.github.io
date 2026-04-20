(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function s(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=s(i);fetch(i.href,n)}})();const d={owner:"Philipp",role:"Code · Systems · Startup",summary:"Persönliche Website für Projekte, Karriere, technische Notizen und den Aufbau einer klaren, markanten PHNX-Präsenz.",socials:[{label:"GitHub",href:"https://github.com/your-handle"},{label:"LinkedIn",href:"https://linkedin.com/in/your-handle"},{label:"Mail",href:"mailto:you@example.com"}],nav:[{label:"Career",route:"career"},{label:"Blog",route:"blog"}],pillars:["C++","Python","TypeScript","Qt / PyQt","SQLite","System Design"],homeLead:"Reduziert. Schnell. Klar strukturiert."},r={route:x(),theme:O(),blogVisibleCount:5,activePostSlug:null},y=new Map,_=new Map,S=document.querySelector("#app");if(!S)throw new Error("App root not found.");S.innerHTML=`
  <div class="site-shell" id="site-shell" data-route="${r.route}">
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
            <span class="theme-toggle__state" id="theme-toggle-state">${r.theme==="dark"?"Dark":"Light"}</span>
          </button>
          <div class="nav-links" id="nav-links"></div>
        </div>
      </nav>
    </header>

    <main class="page-main">
      <section class="hero container" id="hero-block" aria-label="Hero">
        <div class="hero__eyebrow">PHNX Personal Site</div>
        <h1 class="hero__title">${d.owner}</h1>
        <p class="hero__subtitle">${d.role}</p>
        <p class="hero__summary">${d.summary}</p>
      </section>

      <section class="content-host container">
        <div class="content-panel" id="content-panel" aria-live="polite"></div>
      </section>
    </main>
  </div>
`;const P=document.querySelector("#site-shell"),m=document.querySelector("#content-panel"),L=document.querySelector("#social-links"),C=document.querySelector("#nav-links"),T=document.querySelector("#theme-toggle"),E=document.querySelector("#theme-toggle-state");if(!P||!m||!L||!C||!T||!E)throw new Error("Required UI nodes are missing.");function x(){const e=window.location.hash.replace(/^#\/?/,"").trim().toLowerCase();return e==="career"||e==="blog"?e:"home"}function O(){const e=window.localStorage.getItem("phnx-theme");return e==="light"||e==="dark"?e:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function H(e){document.documentElement.dataset.theme=e,E.textContent=e==="dark"?"Dark":"Light"}function N(e,t,s){return`<a class="${s}" href="${e}">${t}</a>`}function M(e){L.innerHTML=d.socials.map(t=>N(t.href,t.label,"social-link")).join(""),C.innerHTML=d.nav.map(({label:t,route:s})=>`<a class="${e===s?"nav-link is-active":"nav-link"}" href="#/${s}" data-route-link="${s}">${t}</a>`).join("")}function F(e){r.route=e,P.dataset.route=e,M(e)}async function R(e){const t=await fetch(e,{credentials:"same-origin"});if(!t.ok)throw new Error(`Failed to load content: ${e}`);return await t.json()}async function V(e){const t=await fetch(e,{credentials:"same-origin"});if(!t.ok)throw new Error(`Failed to load markdown: ${e}`);return await t.text()}function j(e){const t=new Image;t.decoding="async",t.src=e}function D(e){const t=`./content/${e}.json`,s=y.get(t);if(s)return s;const a=R(t);return y.set(t,a),a}function I(e){const t=`./content/blog/${e}.md`,s=_.get(t);if(s)return s;const a=V(t);return _.set(t,a),a}async function b(){return await D("career")}async function w(){return await D("blog")}function v(e){return new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(e))}function u(e,t=!1){return`<ul class="chip-list${t?" chip-list--compact":""}">${e.map(a=>`<li class="chip">${a}</li>`).join("")}</ul>`}function k(e,t,s,a){return`
    <div class="view" data-view="${r.route}">
      <div class="panel-head panel-head--stacked">
        <div class="panel-kicker">${e}</div>
        <h2 class="panel-title">${t}</h2>
        <p class="panel-intro">${s}</p>
      </div>
      ${a}
    </div>
  `}function z(e,t){const s=t.posts[0],a=e.items[0];return`
    <div class="view view--home" data-view="home">
      <div class="home-lead">
        <div>
          <div class="panel-kicker">Overview</div>
          <h2 class="home-lead__title">${d.homeLead}</h2>
        </div>
      </div>

      <div class="home-grid">
        <article class="card card--interactive home-card">
          <div class="card-eyebrow">Neuester Blog</div>
          <p class="post-date">${v(s.date)} · ${s.readTime}</p>
          <h3 class="card-title">${s.title}</h3>
          <p class="card-copy">${s.excerpt}</p>
          ${u(s.tags,!0)}
          <div class="card-actions">
            <a class="button button--ghost" href="#/blog">Zum Blog</a>
          </div>
        </article>

        <article class="card card--interactive home-card">
          <div class="card-eyebrow">Aktuelle Station</div>
          <p class="post-date">${a.period}</p>
          <h3 class="card-title">${a.title}</h3>
          <p class="timeline-meta">${a.meta}</p>
          <p class="card-copy">${a.description}</p>
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
          ${u([...d.pillars])}
        </article>
      </div>
    </div>
  `}function Z(e){const t=e.items.slice(0,2),s=e.items.slice(2);return k(e.heroTag,e.title,e.intro,`
      <div class="feature-grid">
        ${t.map(a=>`
              <article class="card card--interactive card--feature">
                <div class="card-eyebrow">${a.period}</div>
                <h3 class="card-title">${a.title}</h3>
                <p class="timeline-meta">${a.meta}</p>
                <p class="card-copy">${a.description}</p>
                ${a.highlights?u(a.highlights,!0):""}
              </article>
            `).join("")}
      </div>

      <section class="timeline-panel">
        <div class="timeline-panel__head">
          <div class="card-eyebrow">Zeitstrahl</div>
          <h3 class="card-title">Stationen und Fokusverschiebungen.</h3>
        </div>

        <div class="timeline">
          ${s.map(a=>`
                <article class="timeline-item card--interactive">
                  <div class="timeline-marker" aria-hidden="true"></div>
                  <div class="timeline-period">${a.period}</div>
                  <div class="timeline-body card timeline-card">
                    <h3 class="card-title">${a.title}</h3>
                    <p class="timeline-meta">${a.meta}</p>
                    <p class="card-copy">${a.description}</p>
                    ${a.highlights?u(a.highlights,!0):""}
                  </div>
                </article>
              `).join("")}
        </div>
      </section>

      <section class="card card--interactive card--dense">
        <div class="card-eyebrow">Skills</div>
        <h3 class="card-title">Technischer Schwerpunkt</h3>
        ${u(e.skills)}
      </section>
    `)}function q(e){const t=e.posts.slice(0,r.blogVisibleCount),s=e.posts.length>r.blogVisibleCount;return k(e.heroTag,e.title,e.intro,`
      <div class="post-list">
        ${t.map(a=>`
              <article class="post-card card--interactive">
                <div class="post-meta-row">
                  <p class="post-date">${v(a.date)}</p>
                  <span class="post-readtime">${a.readTime}</span>
                </div>
                <h3 class="card-title">${a.title}</h3>
                <p class="card-copy">${a.excerpt}</p>
                ${u(a.tags,!0)}
                <div class="card-actions">
                  <button class="button button--ghost" type="button" data-post-open="${a.slug}">Eintrag öffnen</button>
                </div>
              </article>
            `).join("")}
      </div>

      <div class="list-actions">
        ${s?'<button class="button button--secondary" type="button" data-post-more>Weitere Einträge laden</button>':'<span class="list-actions__hint">Alle Einträge geladen.</span>'}
      </div>
    `)}async function W(e,t){const s=e.posts.find(n=>n.slug===t);if(!s)return r.activePostSlug=null,q(e);const a=await I(t),i=K(a);return k("Blog",s.title,`${v(s.date)} · ${s.readTime}`,`
      <div class="article-shell">
        <div class="article-shell__actions">
          <button class="button button--ghost" type="button" data-post-back>Zurück zur Übersicht</button>
        </div>

        <article class="article card">
          <div class="article-meta">
            <p class="post-date">${v(s.date)}</p>
            ${u(s.tags,!0)}
          </div>
          <div class="markdown-content">${i}</div>
        </article>
      </div>
    `)}function f(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function p(e){const t=[];let s=f(e);return s=s.replace(/`([^`]+)`/g,(a,i)=>{const n=`__CODE_${t.length}__`;return t.push(`<code>${f(i)}</code>`),n}),s=s.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/__(.+?)__/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/_(.+?)_/g,"<em>$1</em>").replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noreferrer">$1</a>'),t.forEach((a,i)=>{s=s.replace(`__CODE_${i}__`,a)}),s}function K(e){const t=e.replace(/\r\n/g,`
`).split(`
`),s=[];let a=0;const i=c=>{c.length!==0&&(s.push(`<p>${p(c.join(" "))}</p>`),c.length=0)},n=[];for(;a<t.length;){const l=t[a].trim();if(!l){i(n),a+=1;continue}const $=/^(#{1,6})\s+(.*)$/.exec(l);if($){i(n);const o=$[1].length;s.push(`<h${o}>${p($[2])}</h${o}>`),a+=1;continue}if(/^```/.test(l)){i(n);const o=l.replace(/^```/,"").trim(),h=[];for(a+=1;a<t.length&&!/^```/.test(t[a].trim());)h.push(t[a]),a+=1;a+=1;const A=o?` class="language-${f(o)}"`:"";s.push(`<pre><code${A}>${f(h.join(`
`))}</code></pre>`);continue}if(/^>\s?/.test(l)){i(n);const o=[];for(;a<t.length&&/^>\s?/.test(t[a].trim());)o.push(t[a].trim().replace(/^>\s?/,"")),a+=1;s.push(`<blockquote><p>${p(o.join(" "))}</p></blockquote>`);continue}if(/^[-*]\s+/.test(l)){i(n);const o=[];for(;a<t.length&&/^[-*]\s+/.test(t[a].trim());)o.push(t[a].trim().replace(/^[-*]\s+/,"")),a+=1;s.push(`<ul>${o.map(h=>`<li>${p(h)}</li>`).join("")}</ul>`);continue}if(/^\d+\.\s+/.test(l)){i(n);const o=[];for(;a<t.length&&/^\d+\.\s+/.test(t[a].trim());)o.push(t[a].trim().replace(/^\d+\.\s+/,"")),a+=1;s.push(`<ol>${o.map(h=>`<li>${p(h)}</li>`).join("")}</ol>`);continue}if(/^---+$/.test(l)){i(n),s.push("<hr />"),a+=1;continue}n.push(l),a+=1}return i(n),s.join("")}async function g(){m.innerHTML=`
    <div class="loading-state">
      <span class="loading-state__pulse"></span>
      <span>Inhalt wird vorbereitet ...</span>
    </div>
  `;try{let e="";if(r.route==="home"){const[t,s]=await Promise.all([b(),w()]);e=z(t,s)}if(r.route==="career"){const t=await b();e=Z(t)}if(r.route==="blog"){const t=await w();e=r.activePostSlug?await W(t,r.activePostSlug):q(t)}m.innerHTML=e}catch(e){console.error(e),m.innerHTML=`
      <div class="error-state card">
        <div class="card-eyebrow">Fehler</div>
        <h2 class="card-title">Inhalt konnte nicht geladen werden.</h2>
        <p class="card-copy">Prüfe, ob alle Dateien vollständig hochgeladen wurden und die Pfade stimmen.</p>
      </div>
    `}}async function B(){const e=x();e!=="blog"&&(r.activePostSlug=null,r.blogVisibleCount=5),F(e),await g()}m.addEventListener("click",async e=>{const t=e.target;if(!t)return;const s=t.closest("[data-post-open]");if(s){r.activePostSlug=s.dataset.postOpen??null,await g();return}if(t.closest("[data-post-back]")){r.activePostSlug=null,await g();return}t.closest("[data-post-more]")&&(r.blogVisibleCount+=5,await g())});T.addEventListener("click",()=>{r.theme=r.theme==="dark"?"light":"dark",window.localStorage.setItem("phnx-theme",r.theme),H(r.theme)});window.addEventListener("hashchange",()=>{B()});H(r.theme);M(r.route);j("./hero-ambient.webp");j("./phnx-logo.png");Promise.all([b(),w()]).then(([e,t])=>{t.posts.slice(0,5).forEach(s=>{I(s.slug)})});B();
