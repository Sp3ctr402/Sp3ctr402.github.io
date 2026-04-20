(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function i(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=i(n);fetch(n.href,s)}})();const r={owner:"Philipp",role:"Code • Systems • Products",summary:"Persönliche Website mit Fokus auf performante Software, saubere Architektur und eine reduzierte, markante Brand-Ästhetik.",socials:[{label:"GitHub",href:"https://github.com/your-handle"},{label:"LinkedIn",href:"https://linkedin.com/in/your-handle"},{label:"Mail",href:"mailto:you@example.com"}],homeCards:[{eyebrow:"Systems",title:"Robuste technische Strukturen.",text:"Architektur vor Zufall. Komponenten, Datenflüsse und Zustände sollen klar und dauerhaft wartbar bleiben."},{eyebrow:"Performance",title:"Schnelle Oberflächen ohne Ballast.",text:"Minimale Laufzeit, frühes Preloading und kontrollierte Assets statt unnötiger Framework-Schichten."},{eyebrow:"Product",title:"Technik im Dienst eines Produkts.",text:"Nicht nur bauen, sondern bewusst entscheiden, was eine Oberfläche, ein Tool oder ein Workflow wirklich leisten muss."}],pillars:["C++","Python","TypeScript","UI Systems","Data Tools","Startup Thinking"]},d=new Map,f=document.querySelector("#app");if(!f)throw new Error("App root not found.");f.innerHTML=`
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
        <h1 class="hero__title">${r.owner}</h1>
        <p class="hero__subtitle">${r.role}</p>
        <p class="hero__summary">${r.summary}</p>
      </section>

      <section class="content-host container">
        <div class="content-panel" id="content-panel" aria-live="polite"></div>
      </section>
    </main>
  </div>
`;const v=document.querySelector("#content-panel"),g=document.querySelector("#social-links"),w=document.querySelector("#nav-links"),k=document.querySelector("#theme-toggle"),b=document.querySelector("#theme-toggle-state");if(!v||!g||!w||!k||!b)throw new Error("Required UI nodes are missing.");const y=v,$=g,T=w,L=k,S=b;function P(e,t,i="text-link"){return`<a class="${i}" href="${e}">${t}</a>`}function C(e){$.innerHTML=r.socials.map(i=>P(i.href,i.label,"social-link")).join("");const t=[{label:"Career",route:"career"},{label:"Blog",route:"blog"}];T.innerHTML=t.map(({label:i,route:a})=>`<a class="${e===a?"nav-link is-active":"nav-link"}" data-route-link="${a}" href="#/${a}">${i}</a>`).join("")}function u(){const e=window.location.hash.replace(/^#\/?/,"").trim().toLowerCase();return e==="career"||e==="blog"?e:"home"}async function E(e){const t=await fetch(e,{credentials:"same-origin"});if(!t.ok)throw new Error(`Failed to load content: ${e}`);return await t.json()}function I(e){const t=new Image;t.decoding="async",t.src=e}function o(e){const t=`./content/${e}.json`,i=d.get(t);if(i)return i;const a=E(t);return d.set(t,a),a}function c(e){return e.map(t=>`<li class="chip">${t}</li>`).join("")}function N(){return`
    <div class="view" data-view="home">
      <div class="panel-head">
        <div>
          <div class="panel-kicker">Overview</div>
          <h2 class="panel-title">Reduziert, schnell, erweiterbar.</h2>
        </div>
        <a class="button button--primary" href="mailto:you@example.com">Kontakt</a>
      </div>

      <div class="card-grid">
        ${r.homeCards.map(e=>`
              <article class="card">
                <div class="card-eyebrow">${e.eyebrow}</div>
                <h3 class="card-title">${e.title}</h3>
                <p class="card-copy">${e.text}</p>
              </article>
            `).join("")}
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
            ${c([...r.pillars])}
          </ul>
        </section>
      </div>
    </div>
  `}function x(e){return`
    <div class="view" data-view="career">
      <div class="panel-head panel-head--stacked">
        <div class="panel-kicker">${e.heroTag}</div>
        <h2 class="panel-title">${e.title}</h2>
        <p class="panel-intro">${e.intro}</p>
      </div>

      <div class="timeline">
        ${e.items.map(t=>`
              <article class="timeline-item">
                <div class="timeline-period">${t.period}</div>
                <div class="timeline-body">
                  <h3 class="card-title">${t.title}</h3>
                  <p class="timeline-meta">${t.meta}</p>
                  <p class="card-copy">${t.description}</p>
                </div>
              </article>
            `).join("")}
      </div>

      <section class="card card--dense">
        <div class="card-eyebrow">Skills</div>
        <ul class="chip-list">
          ${c(e.skills)}
        </ul>
      </section>
    </div>
  `}function _(e){return new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(e))}function q(e){return`
    <div class="view" data-view="blog">
      <div class="panel-head panel-head--stacked">
        <div class="panel-kicker">${e.heroTag}</div>
        <h2 class="panel-title">${e.title}</h2>
        <p class="panel-intro">${e.intro}</p>
      </div>

      <div class="post-list">
        ${e.posts.map(t=>`
              <article class="post-card">
                <div class="post-date">${_(t.date)}</div>
                <h3 class="card-title">${t.title}</h3>
                <p class="card-copy">${t.excerpt}</p>
                <ul class="chip-list chip-list--compact">
                  ${c(t.tags)}
                </ul>
              </article>
            `).join("")}
      </div>
    </div>
  `}function h(){return document.documentElement.dataset.theme==="light"?"light":"dark"}function m(e){document.documentElement.dataset.theme=e,localStorage.setItem("phnx-theme",e),S.textContent=e==="dark"?"Dark":"Light"}async function D(e){switch(e){case"career":{const t=await o("career");return x(t)}case"blog":{const t=await o("blog");return q(t)}case"home":default:return N()}}async function p(e){C(e);const t=await D(e),i=()=>{y.innerHTML=t,document.body.dataset.route=e};if("startViewTransition"in document){document.startViewTransition?.(i);return}i()}function H(e){if("requestIdleCallback"in window){window.requestIdleCallback?.(()=>e());return}globalThis.setTimeout(e,180)}function M(){const e=t=>{o(t)};document.addEventListener("pointerenter",t=>{const i=t.target;if(!(i instanceof Element))return;const n=i.closest("[data-route-link]")?.dataset.routeLink;(n==="career"||n==="blog")&&e(n)},!0),document.addEventListener("focusin",t=>{const i=t.target;if(!(i instanceof Element))return;const n=i.closest("[data-route-link]")?.dataset.routeLink;(n==="career"||n==="blog")&&e(n)},!0)}function O(){m(h()),L.addEventListener("click",()=>{m(h()==="dark"?"light":"dark")})}function j(){if(window.addEventListener("hashchange",()=>{p(u())}),!window.location.hash){window.location.hash="#/";return}p(u())}O();M();j();I("./hero-ambient.webp");H(()=>{o("career"),o("blog")});
