/* PROAME v2 prototype - shared core: state, helpers, chrome, dialogs, router, delegated events.
   Page modules register into window.PROAME_V2.pub (public, Persuade) and .admin (Operate).
   Plain script, no build step, works from file://. */
(function () {
  'use strict';

  var S = window.PROAME_V2_SEED;
  var MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var PROJECT_STATUS = { draft: 'Rascunho', published: 'Publicado', closed: 'Encerrado' };
  var EDITAL_STATUS = { draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado' };
  var SIGNUP_STATUS = ['Nova', 'Confirmada', 'Lista de espera', 'Recusada'];
  var OFFER_STATUS = ['Nova', 'Em contato', 'Concluída'];
  var STATUS_CLASS = {
    'Nova': 'chip-nova', 'Confirmada': 'chip-confirmada', 'Lista de espera': 'chip-espera', 'Recusada': 'chip-recusada',
    'Em contato': 'chip-espera', 'Concluída': 'chip-confirmada'
  };
  var MAX_PDF_BYTES = 2 * 1024 * 1024;
  var MAX_PHOTO_BYTES = 1024 * 1024;
  var CURRENT_ADMIN_ID = 'adm-1';
  var ADMIN_LINKS = [
    ['painel', 'Painel'], ['paginas', 'Páginas'], ['projetos', 'Projetos'], ['inscricoes', 'Inscrições'],
    ['ofertas', 'Ofertas'], ['editais', 'Editais'], ['administradores', 'Administradores'],
    ['configuracoes', 'Configurações'], ['auditoria', 'Auditoria'], ['ajuda', 'Ajuda'], ['novidades', 'Novidades']
  ];
  var PUBLIC_LINKS = [
    ['home', 'Início'], ['quem-somos', 'Quem somos'], ['servicos', 'O que realizamos'],
    ['projetos', 'O que temos'], ['colaborar', 'Como posso colaborar'], ['transparencia', 'Transparência']
  ];

  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  var currentPath = null;
  var drawerRoot = document.getElementById('drawer-root');
  /* Navigation state: open = drawer visible; opener = the toggle that opened it (focus returns there). */
  var nav = { open: false, opener: null };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /* The single mutable state object. Restoring seed data replaces its keys in place. */
  var st = clone(S);
  st.filters = { type: 'all', date: 'all', cover: 'all', signupProject: 'all', q: '', status: '', project: '' };
  st.draft = null;
  st.session = false;
  st.loginStep = 'password';
  st.loginRecovery = false;
  st.flash = null;

  var V = window.PROAME_V2 = {
    S: S, st: st, pub: {}, admin: {}, forms: {}, actions: {}, changes: {},
    MONTHS: MONTHS, PROJECT_STATUS: PROJECT_STATUS, EDITAL_STATUS: EDITAL_STATUS,
    SIGNUP_STATUS: SIGNUP_STATUS, OFFER_STATUS: OFFER_STATUS, MAX_PDF_BYTES: MAX_PDF_BYTES,
    MAX_PHOTO_BYTES: MAX_PHOTO_BYTES, ADMIN_LINKS: ADMIN_LINKS, PUBLIC_LINKS: PUBLIC_LINKS
  };

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(value) {
    var s = String(value || '').slice(0, 10).split('-');
    return s.length === 3 && s[0] ? s[2] + '/' + s[1] + '/' + s[0] : '';
  }
  function fmtDT(value) {
    var s = String(value || '');
    return s ? fmtDate(s) + ' às ' + s.slice(11, 16) : '';
  }
  function fmtStamp(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function dayMonth(iso) {
    return { d: String(iso).slice(8, 10), m: MONTHS[Number(String(iso).slice(5, 7)) - 1] };
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function daysFromNow(iso) {
    var a = new Date(String(iso).slice(0, 10) + 'T00:00:00');
    var b = new Date(today() + 'T00:00:00');
    return Math.round((a - b) / 86400000);
  }
  function findById(list, id) {
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
    return null;
  }
  function projectTitle(id) { var p = findById(st.projects, id); return p ? p.title : ''; }
  function typeName(id) { var t = findById(st.projectTypes, id); return t ? t.name : ''; }
  function publishedProjects() {
    return st.projects.filter(function (p) { return p.status === 'published'; })
      .sort(function (a, b) { return a.startsAt > b.startsAt ? 1 : -1; });
  }
  function activeServices() {
    return st.services.filter(function (s) { return s.active; }).sort(function (a, b) { return a.sort - b.sort; });
  }
  function countSignups(projectId) {
    return st.signups.filter(function (s) { return s.projectId === projectId; }).length;
  }
  function answerOf(signup, key) {
    for (var i = 0; i < signup.answers.length; i++) { if (signup.answers[i].key === key) { return signup.answers[i].value; } }
    return '';
  }
  function maskCad(value) {
    value = String(value || '');
    return value ? '•••' + value.slice(-3) : '—';
  }
  function opts(list, selected, placeholder) {
    var head = placeholder ? '<option value="">' + esc(placeholder) + '</option>' : '';
    return head + list.map(function (o) {
      var value = typeof o === 'object' ? o.value : o;
      var label = typeof o === 'object' ? o.label : o;
      return '<option value="' + esc(value) + '"' + (String(value) === String(selected) ? ' selected' : '') + '>' + esc(label) + '</option>';
    }).join('');
  }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function brandImg() {
    var o = S.org;
    return '<img class="logo-std" src="' + o.logoBase + '@2x.png" srcset="' + o.logoBase + '@1x.png 1x, ' +
      o.logoBase + '@2x.png 2x" width="107" height="40" alt="PROAME">' +
      '<img class="logo-dark" src="' + o.logoLightBase + '@2x.png" srcset="' + o.logoLightBase + '@1x.png 1x, ' +
      o.logoLightBase + '@2x.png 2x" width="107" height="40" alt="">';
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }
  function audit(event) {
    st.auditLog.unshift({ at: new Date().toISOString(), actor: ACTOR_NAME(), event: event });
  }
  function ACTOR_NAME() {
    var a = findById(st.admins, CURRENT_ADMIN_ID);
    return a ? a.name : 'Administrador';
  }
  function currentAdmin() { return findById(st.admins, CURRENT_ADMIN_ID); }
  function activeRootCount() {
    return st.admins.filter(function (a) { return a.active && a.role === 'Root'; }).length;
  }

  /* ---------- dialogs (native <dialog>, built per use and removed on close) ---------- */
  function closeDialog() {
    var d = document.getElementById('dlg');
    if (d) { if (d.open) { d.close(); } d.remove(); }
  }
  function openDialog(title, bodyHtml, focusSel) {
    closeDialog();
    var d = document.createElement('dialog');
    d.id = 'dlg';
    d.className = 'dlg';
    d.setAttribute('aria-labelledby', 'dlg-title');
    d.innerHTML = '<h2 id="dlg-title">' + esc(title) + '</h2>' + bodyHtml;
    document.body.appendChild(d);
    d.showModal();
    var target = focusSel ? d.querySelector(focusSel) : d.querySelector('input,select,textarea,button');
    if (target) { target.focus(); }
  }
  function helpButton(key, title) {
    return '<button type="button" class="btn btn-quiet help-btn" data-action="help" data-key="' + esc(key) +
      '" data-title="' + esc(title) + '" aria-haspopup="dialog" aria-label="Ajuda sobre ' + esc(title) + '">?</button>';
  }
  function helpFor(key) {
    return S.pageHelp[key] || '';
  }

  /* ---------- chrome ---------- */
  /* Icon paths (24 px grid). Phone, WhatsApp, e-mail, Instagram, YouTube and copy are the v1 paths. */
  var ICON = {
    phone: 'M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z',
    whatsapp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.2z',
    email: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
    instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
    youtube: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3-5.2 3z',
    copy: 'M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z',
    place: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
    menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
  };
  function svgIcon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + ICON[name] + '"/></svg>';
  }

  /* Contact helpers (shared by the global footer and the Quem somos page). */
  function digitsOnly(v) { return String(v || '').replace(/\D/g, ''); }
  function withDdi(v) { var d = digitsOnly(v); return d.length <= 11 ? '55' + d : d; }
  function fmtWhatsapp(v) {
    var d = withDdi(v);
    var m = d.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
    return m ? '+' + m[1] + ' (' + m[2] + ') ' + m[3] + '-' + m[4] : '+' + d;
  }
  function mapsLink(address) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(String(address || '').trim());
  }
  var LINKS = {
    phone: function (v) { return 'tel:+' + withDdi(v); },
    whatsapp: function (v) { return 'https://wa.me/' + withDdi(v); },
    email: function (v) { return 'mailto:' + String(v || '').trim(); },
    instagram: function (v) {
      v = String(v || '').trim();
      return /^https?:\/\//.test(v) ? v : 'https://www.instagram.com/' + v.replace(/^@/, '') + '/';
    },
    youtube: function (v) {
      v = String(v || '').trim();
      return /^https?:\/\//.test(v) ? v : 'https://www.youtube.com/@' + v.replace(/^@/, '');
    }
  };
  /* One entry per public channel. label = name shown and used in pt-BR button labels; copy = text copied. */
  function contactChannels() {
    var c = S.contact;
    var list = [
      { kind: 'phone', label: 'Telefone', text: c.phone, href: LINKS.phone(c.phone), copy: c.phone },
      { kind: 'whatsapp', label: 'WhatsApp', text: fmtWhatsapp(c.whatsapp), href: LINKS.whatsapp(c.whatsapp), copy: fmtWhatsapp(c.whatsapp), external: true },
      { kind: 'email', label: 'E-mail', text: c.email, href: LINKS.email(c.email), copy: c.email },
      { kind: 'instagram', label: 'Instagram', text: c.instagram, href: LINKS.instagram(c.instagram), copy: LINKS.instagram(c.instagram), external: true },
      { kind: 'youtube', label: 'YouTube', text: c.youtube, href: LINKS.youtube(c.youtube), copy: LINKS.youtube(c.youtube), external: true },
      { kind: 'place', label: 'Endereço', text: c.address, href: mapsLink(c.address), copy: c.address, external: true }
    ];
    return list.filter(function (ch) { return String(ch.text || '').trim(); });
  }
  /* Name used in pt-BR button labels and the "Copiado" message. Brand names keep their capitals. */
  function copyName(ch) {
    return ['whatsapp', 'instagram', 'youtube'].indexOf(ch.kind) >= 0 ? ch.label : ch.label.toLowerCase();
  }
  function contactList() {
    return '<ul class="contact-list">' + contactChannels().map(function (ch) {
      return '<li class="contact-item"><a class="contact-link" href="' + esc(ch.href) + '"' +
        (ch.external ? ' target="_blank" rel="noopener"' : '') + '>' + svgIcon(ch.kind) +
        '<span class="contact-text"><span class="contact-kind">' + esc(ch.label) + '</span>' +
        '<span class="contact-value">' + esc(ch.text) + '</span></span>' +
        (ch.external ? '<span class="sr-only"> (abre em nova aba)</span>' : '') + '</a>' +
        '<button type="button" class="copy-btn" data-action="copy" data-copy="' + esc(ch.copy) + '" data-label="' + esc(copyName(ch)) +
        '" aria-label="Copiar ' + esc(copyName(ch)) + '">' + svgIcon('copy') + '</button></li>';
    }).join('') + '</ul>';
  }

  /* Navigation: one link list, rendered inline (header) and inside the drawer (menu mode). */
  function navItems(admin, path) {
    var links = admin ? ADMIN_LINKS.map(function (l) {
      return ['/admin' + (l[0] === 'painel' ? '' : '/' + l[0]), l[1]];
    }) : PUBLIC_LINKS.map(function (l) { return ['/' + l[0], l[1]]; });
    return links.map(function (l) {
      var current = path === l[0] || (admin && l[0] === '/admin' && path === '/admin/');
      return '<a href="#' + l[0] + '"' + (current ? ' aria-current="page"' : '') + '>' + esc(l[1]) + '</a>';
    }).join('');
  }
  function navExtra(admin) {
    return admin ? '<a href="#/home">Ver site</a><button type="button" class="nav-btn" data-action="logout">Sair</button>' : '';
  }

  function header(admin, path) {
    var label = admin ? 'Área do admin' : 'Principal';
    return '<a class="skip" href="#main">Pular para o conteúdo</a>' +
      '<div class="utility"><div class="wrap">' +
      '<a href="../index.html">Voltar ao protótipo v1</a>' +
      '<button type="button" class="btn-ghost-sm" data-action="theme" aria-pressed="' + isDark() + '">Tema escuro</button>' +
      '</div></div>' +
      '<header class="site-header" data-nav="inline"><div class="wrap">' +
      '<a class="brand" href="' + (admin ? '#/admin' : '#/home') + '" aria-label="PROAME, ' + (admin ? 'painel do admin' : 'página inicial') + '">' + brandImg() + '</a>' +
      '<nav class="nav" id="site-nav" aria-label="' + label + '">' + navItems(admin, path) + navExtra(admin) + '</nav>' +
      '<button type="button" class="nav-toggle" data-action="drawer-open" aria-expanded="false" aria-controls="site-drawer" aria-label="Abrir menu">' +
      svgIcon('menu') + '</button>' +
      '</div></header>';
  }

  /* Modal navigation drawer (menu mode). Rendered outside #app so #app can be made inert while it is open. */
  function drawerHtml(admin, path) {
    var label = admin ? 'Menu do admin' : 'Menu';
    return '<div class="drawer-scrim" data-action="drawer-close" hidden></div>' +
      '<aside id="site-drawer" class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" hidden>' +
      '<div class="drawer-head"><h2 id="drawer-title">' + label + '</h2>' +
      '<button type="button" class="drawer-close" data-action="drawer-close" aria-label="Fechar menu">' + svgIcon('close') + '</button></div>' +
      '<nav aria-label="' + label + '"><ul class="drawer-list">' + navItems(admin, path).replace(/<a /g, '<li><a ').replace(/<\/a>/g, '</a></li>') +
      (admin ? '<li><a href="#/home">Ver site</a></li><li><button type="button" class="nav-btn" data-action="logout">Sair</button></li>' : '') +
      '</ul></nav></aside>';
  }

  function footer(admin) {
    var o = S.org;
    return '<footer class="footer" id="contato" tabindex="-1" aria-labelledby="contato-titulo"><div class="wrap">' +
      '<div><a class="brand" href="#/home" aria-label="PROAME, página inicial">' + brandImg() + '</a>' +
      '<p>' + esc(o.fullName) + ', Gama (DF)</p>' +
      '<div class="footer-links"><a href="#/admin">Área do admin</a><a href="../index.html">Protótipo v1</a></div>' +
      '<p class="hint">Versão ' + esc(S.releases[0].version) + ' do protótipo v2. Os dados são fictícios.</p></div>' +
      '<div><h2 id="contato-titulo">Contato</h2>' + contactList() + '</div>' +
      '</div></footer>';
  }

  function notFound() {
    return '<div class="narrow section"><h1>Página não encontrada</h1>' +
      '<p><a href="#/home">Voltar para o início</a></p></div>';
  }

  /* ---------- router ---------- */
  function parts() {
    return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  }

  function route() {
    var p = parts();
    var admin = p[0] === 'admin';
    var handler, args;
    if (admin) {
      var sub = p[1] || 'painel';
      if (sub === 'login') { handler = V.admin.login; args = []; }
      else if (sub === 'projeto') { handler = V.admin.projeto; args = [p[2] || 'novo']; }
      else { handler = V.admin[sub]; args = p.slice(2); }
    } else {
      handler = V.pub[p[0] || 'home'];
      args = p.slice(1);
    }
    var path = '/' + p.join('/');
    var sameRoute = path === currentPath;
    currentPath = path;
    /* The project builder keeps its draft while the admin stays on a projeto route; leaving it discards the draft. */
    if (!(admin && p[1] === 'projeto')) { st.draft = null; }
    var main = handler ? handler.apply(null, args) : notFound();
    document.body.className = admin ? 'mode-operate' : 'mode-persuade';
    var wasOpen = nav.open;
    nav.open = false;
    app.inert = false;
    app.innerHTML = header(admin, path) + '<main id="main" tabindex="-1">' + main + '</main>' + footer(admin);
    drawerRoot.innerHTML = drawerHtml(admin, path);
    setupNav();
    if (wasOpen) { app.querySelector('#main').focus(); }
    if (!sameRoute) { window.scrollTo(0, 0); }
  }

  /* Re-renders the current route and returns focus to a control that still exists. */
  function rerender(focusSel) {
    route();
    if (focusSel) {
      var el = app.querySelector(focusSel);
      if (el) { el.focus(); }
    }
  }
  V.route = route;
  V.rerender = rerender;
  V.helpFor = helpFor;
  V.helpButton = helpButton;
  V.openDialog = openDialog;
  V.closeDialog = closeDialog;
  V.toast = toast;
  V.audit = audit;
  V.esc = esc;
  V.fmtDate = fmtDate;
  V.fmtDT = fmtDT;
  V.fmtStamp = fmtStamp;
  V.dayMonth = dayMonth;
  V.today = today;
  V.daysFromNow = daysFromNow;
  V.findById = findById;
  V.projectTitle = projectTitle;
  V.typeName = typeName;
  V.publishedProjects = publishedProjects;
  V.activeServices = activeServices;
  V.countSignups = countSignups;
  V.answerOf = answerOf;
  V.maskCad = maskCad;
  V.opts = opts;
  V.clone = clone;
  V.isDark = isDark;
  V.currentAdmin = currentAdmin;
  V.activeRootCount = activeRootCount;
  V.notFound = notFound;
  V.STATUS_CLASS = STATUS_CLASS;
  V.restoreSeed = function () {
    var fresh = clone(S);
    Object.keys(fresh).forEach(function (k) { st[k] = fresh[k]; });
    st.filters = { type: 'all', date: 'all', cover: 'all', signupProject: 'all', q: '', status: '', project: '' };
    st.draft = null;
  };

  /* ---------- adaptive navigation: inline links <-> menu drawer ---------- */
  /* Decided by measuring, not by a breakpoint. The header row is observed with ResizeObserver.
     Inline -> menu when the links' natural width exceeds the room left beside the logo and the toggle.
     Menu -> inline only when they fit with NAV_HYSTERESIS px to spare, so the layout does not flicker. */
  var NAV_HYSTERESIS = 24;
  var navNaturalWidth = 0;
  var navRO = null;

  function fitNav() {
    var header = app.querySelector('.site-header');
    if (!header) { return; }
    var row = header.querySelector('.wrap');
    var navEl = header.querySelector('#site-nav');
    var brandEl = header.querySelector('.brand');
    var toggle = header.querySelector('.nav-toggle');
    var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    var avail = row.clientWidth - brandEl.offsetWidth - toggle.offsetWidth - 2 * gap;
    if (header.getAttribute('data-nav') === 'inline') {
      var items = Array.prototype.slice.call(navEl.children);
      var navGap = parseFloat(getComputedStyle(navEl).columnGap) || 0;
      navNaturalWidth = items.reduce(function (sum, el) { return sum + el.getBoundingClientRect().width; }, 0) +
        navGap * Math.max(0, items.length - 1);
      if (navNaturalWidth > avail) { setNavMode(header, 'menu'); }
    } else if (navNaturalWidth + NAV_HYSTERESIS <= avail) {
      setNavMode(header, 'inline');
    }
  }

  function setNavMode(header, mode) {
    if (header.getAttribute('data-nav') === mode) { return; }
    header.setAttribute('data-nav', mode);
    if (mode === 'inline' && nav.open) { closeDrawer(false); }
  }

  function setupNav() {
    if (navRO) { navRO.disconnect(); navRO = null; }
    var row = app.querySelector('.site-header .wrap');
    if (!row) { return; }
    fitNav();
    if ('ResizeObserver' in window) {
      navRO = new ResizeObserver(function () { fitNav(); });
      navRO.observe(row);
    }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitNav); }
  }

  /* Modal drawer: inert page behind it, Tab cycles inside, Escape and scrim close it, focus returns to the toggle. */
  function openDrawer(opener) {
    var d = document.getElementById('site-drawer');
    var scrim = drawerRoot.querySelector('.drawer-scrim');
    if (!d) { return; }
    nav.open = true;
    nav.opener = opener;
    opener.setAttribute('aria-expanded', 'true');
    app.inert = true;
    scrim.hidden = false;
    d.hidden = false;
    d.querySelector('.drawer-close').focus();
  }

  function closeDrawer(restoreFocus) {
    if (!nav.open) { return; }
    var d = document.getElementById('site-drawer');
    var scrim = drawerRoot.querySelector('.drawer-scrim');
    nav.open = false;
    if (d) { d.hidden = true; }
    if (scrim) { scrim.hidden = true; }
    app.inert = false;
    var opener = nav.opener;
    nav.opener = null;
    if (opener && opener.isConnected) {
      opener.setAttribute('aria-expanded', 'false');
      if (restoreFocus) { opener.focus(); }
    }
  }

  function trapTab(e) {
    var d = document.getElementById('site-drawer');
    if (!d) { return; }
    var items = Array.prototype.slice.call(d.querySelectorAll('a[href], button:not([disabled])'));
    if (!items.length) { return; }
    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;
    if (e.shiftKey && (active === first || !d.contains(active))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || !d.contains(active))) { e.preventDefault(); first.focus(); }
  }

  /* A drawer link closes the drawer; the route change moves focus to the page. Same-hash links close it in place. */
  drawerRoot.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!nav.open || !link) { return; }
    if (link.getAttribute('href') === location.hash) { closeDrawer(true); }
  });

  /* ---------- copy to clipboard (footer and contact buttons) ---------- */
  function copyText(text, label) {
    var done = function () { toast('Copiado: ' + label); };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      if (ok) { done(); } else { toast('Não foi possível copiar. Selecione o texto e copie.'); }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  V.actions.copy = function (el) { copyText(el.getAttribute('data-copy'), el.getAttribute('data-label')); };
  V.actions['drawer-open'] = function (el) { openDrawer(el); };
  V.actions['drawer-close'] = function () { closeDrawer(true); };
  V.actions['goto-contact'] = function (el, e) {
    e.preventDefault();
    var f = document.getElementById('contato');
    if (f) { f.scrollIntoView({ block: 'start' }); f.focus({ preventScroll: true }); }
  };
  V.mapsLink = mapsLink;
  V.contactList = contactList;
  V.svgIcon = svgIcon;

  /* ---------- theme ---------- */
  function setTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    try { localStorage.setItem('proame-v2-theme', name); } catch (err) { /* private mode: in-memory only */ }
    var btn = app.querySelector('[data-action="theme"]');
    if (btn) { btn.setAttribute('aria-pressed', String(name === 'dark')); }
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('proame-v2-theme'); } catch (err) { saved = null; }
    setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  }

  /* ---------- tooltips (tap-friendly, Escape closes) ---------- */
  function closeTip(tip) {
    tip.hidden = true;
    var btn = document.querySelector('[aria-controls="' + tip.id + '"]');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); }
  }
  function closeAllTips(except) {
    document.querySelectorAll('.tooltip:not([hidden])').forEach(function (t) { if (t !== except) { closeTip(t); } });
  }

  /* ---------- delegated events ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) { closeAllTips(null); return; }
    var action = el.getAttribute('data-action');
    if (action === 'theme') { setTheme(isDark() ? 'light' : 'dark'); return; }
    if (action === 'tip') {
      var tip = document.getElementById(el.getAttribute('data-target'));
      var open = tip.hidden;
      closeAllTips(tip);
      tip.hidden = !open;
      el.setAttribute('aria-expanded', String(open));
      return;
    }
    if (action === 'help') {
      openDialog(el.getAttribute('data-title'), '<p>' + esc(helpFor(el.getAttribute('data-key'))) + '</p>' +
        '<div class="dlg-actions"><button type="button" class="btn btn-primary" data-action="dlg-close">Fechar</button></div>');
      return;
    }
    if (action === 'dlg-close') { closeDialog(); return; }
    if (V.actions[action]) { V.actions[action](el, e); }
  });

  document.addEventListener('keydown', function (e) {
    if (nav.open) {
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(true); return; }
      if (e.key === 'Tab') { trapTab(e); return; }
    }
    if (e.key === 'Escape') { closeAllTips(null); }
  });

  document.addEventListener('submit', function (e) {
    var name = e.target.getAttribute('data-form');
    if (!name) { return; }
    e.preventDefault();
    if (V.forms[name]) { V.forms[name](e.target); }
  });

  document.addEventListener('change', function (e) {
    var name = e.target.getAttribute('data-change');
    if (name && V.changes[name]) { V.changes[name](e.target); }
  });

  document.addEventListener('input', function (e) {
    var name = e.target.getAttribute('data-input');
    if (name && V.changes[name]) { V.changes[name](e.target); }
  });

  window.addEventListener('hashchange', route);
  initTheme();
  /* Page modules are plain scripts loaded before this one ends; start after DOM is parsed. */
  document.addEventListener('DOMContentLoaded', route);
})();
