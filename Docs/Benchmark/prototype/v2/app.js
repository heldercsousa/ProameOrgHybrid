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
  function header(admin, path) {
    var links = admin ? ADMIN_LINKS.map(function (l) {
      return ['/admin' + (l[0] === 'painel' ? '' : '/' + l[0]), l[1]];
    }) : PUBLIC_LINKS.map(function (l) { return ['/' + l[0], l[1]]; });
    var nav = links.map(function (l) {
      var current = path === l[0] || (admin && l[0] === '/admin' && path === '/admin/');
      return '<a href="#' + l[0] + '"' + (current ? ' aria-current="page"' : '') + '>' + esc(l[1]) + '</a>';
    }).join('');
    var extra = admin
      ? '<a href="#/home">Ver site</a><button type="button" class="nav-btn" data-action="logout">Sair</button>'
      : '';
    return '<a class="skip" href="#main">Pular para o conteúdo</a>' +
      '<div class="utility"><div class="wrap">' +
      '<a href="../index.html">Voltar ao protótipo v1</a>' +
      '<button type="button" class="btn-ghost-sm" data-action="theme" aria-pressed="' + isDark() + '">Tema escuro</button>' +
      '</div></div>' +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="' + (admin ? '#/admin' : '#/home') + '" aria-label="PROAME, ' + (admin ? 'painel do admin' : 'página inicial') + '">' + brandImg() + '</a>' +
      '<nav class="nav" aria-label="' + (admin ? 'Área do admin' : 'Principal') + '">' + nav + extra + '</nav>' +
      '</div></header>';
  }

  function footer(admin) {
    var o = S.org;
    var c = S.contact;
    return '<footer class="footer"><div class="wrap">' +
      '<div><a class="brand" href="#/home" aria-label="PROAME, página inicial">' + brandImg() + '</a>' +
      '<p>' + esc(o.fullName) + ', Gama (DF)</p><p>' + esc(c.address) + '</p></div>' +
      '<div><p>Telefone: ' + esc(c.phone) + '<br>E-mail: <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></p>' +
      '<div class="footer-links"><a href="#/admin">Área do admin</a><a href="../index.html">Protótipo v1</a></div>' +
      '<p class="hint">Versão ' + esc(S.releases[0].version) + ' do protótipo v2. Os dados são fictícios.</p></div>' +
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
    app.innerHTML = header(admin, path) + '<main id="main" tabindex="-1">' + main + '</main>' + footer(admin);
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
