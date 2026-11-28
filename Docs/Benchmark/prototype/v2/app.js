/* PROAME v2 prototype - hash router, three pages. Plain script, works from file://. */
(function () {
  'use strict';

  var S = window.PROAME_V2_SEED;
  var MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var STATUS_CLASS = { 'Nova': 'chip-nova', 'Confirmada': 'chip-confirmada', 'Lista de espera': 'chip-espera', 'Recusada': 'chip-recusada' };
  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');
  var pendingScroll = null;
  var toastTimer = null;

  var st = {
    signups: S.signups.map(function (s) { return Object.assign({}, s); }),
    filters: { q: '', status: '', project: '' }
  };

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function proj(id) {
    for (var i = 0; i < S.projects.length; i++) { if (S.projects[i].id === id) { return S.projects[i]; } }
    return null;
  }
  function fmt(iso) {
    var p = String(iso).slice(0, 10).split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  function dayMonth(iso) {
    return { d: String(iso).slice(8, 10), m: MONTHS[Number(String(iso).slice(5, 7)) - 1] };
  }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function brandImg(extraClass) {
    var cls = extraClass || '';
    return '<img class="' + cls + ' logo-std" src="' + S.org.logo + '@2x.png" srcset="' + S.org.logo + '@1x.png 1x, ' +
      S.org.logo + '@2x.png 2x" width="107" height="40" alt="PROAME">' +
      '<img class="' + cls + ' logo-dark" src="' + S.org.logoLight + '@2x.png" srcset="' + S.org.logoLight + '@1x.png 1x, ' +
      S.org.logoLight + '@2x.png 2x" width="107" height="40" alt="">';
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3000);
  }

  /* ---------- chrome ---------- */
  function utility() {
    return '<div class="utility"><div class="wrap">' +
      '<a href="../index.html">Voltar ao protótipo v1</a>' +
      '<button type="button" class="btn-ghost-sm" data-action="theme" aria-pressed="' + isDark() + '">Tema escuro</button>' +
      '</div></div>';
  }

  function header(admin) {
    var nav = admin
      ? '<a href="#/admin/inscricoes" aria-current="page">Inscrições</a><a href="#/home">Ver site</a>'
      : '<a href="#/home"' + (currentRoute() === 'home' ? ' aria-current="page"' : '') + '>Início</a>' +
        '<button type="button" data-scroll="projetos">Projetos</button>' +
        '<button type="button" data-scroll="ajude">Como ajudar</button>';
    return '<a class="skip" href="#main">Pular para o conteúdo</a>' +
      utility() +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="' + (admin ? '#/admin/inscricoes' : '#/home') + '" aria-label="PROAME, página inicial">' + brandImg('') + '</a>' +
      '<nav class="nav" aria-label="' + (admin ? 'Área do admin' : 'Principal') + '">' + nav + '</nav>' +
      '</div></header>';
  }

  function footer() {
    var o = S.org;
    return '<footer class="footer"><div class="wrap">' +
      '<div><a class="brand" href="#/home" aria-label="PROAME, página inicial">' + brandImg('foot-logo') + '</a>' +
      '<p>' + esc(o.fullName) + ', Gama (DF)</p><p>' + esc(o.address) + '</p></div>' +
      '<div><p>Telefone: ' + esc(o.phone) + '<br>E-mail: <a href="mailto:' + esc(o.email) + '">' + esc(o.email) + '</a></p>' +
      '<div class="footer-links"><a href="#/admin/inscricoes">Área do admin</a><a href="../index.html">Protótipo v1</a></div>' +
      '<p class="hint">Alternativa de design de amostra. Os dados são fictícios.</p></div>' +
      '</div></footer>';
  }

  /* ---------- Persuade: home ---------- */
  function pageHome() {
    var projects = S.projects.map(function (p) {
      var a = dayMonth(p.startsAt);
      return '<li class="project-row">' +
        '<div class="date-tile" aria-hidden="true"><span class="d">' + a.d + '</span><span class="m">' + a.m + '</span></div>' +
        '<p class="sr-only">Início em ' + fmt(p.startsAt) + ', término em ' + fmt(p.endsAt) + '.</p>' +
        '<div><p class="tag">' + esc(p.type) + '</p>' +
        '<h3><a href="#/projeto/' + esc(p.id) + '">' + esc(p.title) + '</a></h3>' +
        '<p>' + esc(p.description) + '</p>' +
        '<p class="meta">Local: ' + esc(p.location) + '</p>' +
        '<p class="meta">Vagas: ' + p.capacity + '</p>' +
        '<a class="btn btn-quiet" href="#/projeto/' + esc(p.id) + '">Ver e inscrever-se em ' + esc(p.title) + '</a></div>' +
        '</li>';
    }).join('');
    var help = S.helpOffers.map(function (h) {
      return '<li><h3>' + esc(h.title) + '</h3><p>' + esc(h.text) + '</p></li>';
    }).join('');
    return '<section class="hero"><div class="wrap">' +
      '<h1 class="hero-rise">' + esc(S.home.heroTitle) + '</h1>' +
      '<p>' + esc(S.home.heroText) + '</p>' +
      '<button type="button" class="btn btn-primary" data-scroll="projetos">Ver os projetos abertos</button>' +
      '</div></section>' +
      '<section id="projetos" class="section"><div class="wrap">' +
      '<div class="section-head"><h2>Projetos abertos</h2></div>' +
      '<ul class="projects">' + projects + '</ul></div></section>' +
      '<section id="ajude" class="section"><div class="wrap">' +
      '<div class="section-head"><h2>Como ajudar</h2></div>' +
      '<ul class="help-list">' + help + '</ul>' +
      '<p style="margin-block-start:var(--s-5)">Quer contribuir de outra forma? Escreva para <a href="mailto:' + esc(S.org.email) + '">' + esc(S.org.email) + '</a>.</p>' +
      '</div></section>';
  }

  /* ---------- Persuade: project + signup form ---------- */
  function fieldHtml(f) {
    var id = 'f-' + f.key;
    var req = f.required ? '<span class="req" aria-hidden="true"> *</span>' : '';
    var tipBtn = '<button type="button" class="info-btn" data-action="tip" data-target="tip-' + f.key + '" aria-expanded="false" aria-controls="tip-' + f.key +
      '" aria-label="Mais informações sobre ' + esc(f.label) + '">i</button>';
    var tip = '<div class="tooltip" id="tip-' + f.key + '" role="note" hidden>' + esc(f.help) + '</div>';
    var hint = '<p class="hint" id="h-' + f.key + '">' + esc(f.hint) + '</p>';
    var err = '<p class="error" id="e-' + f.key + '" aria-live="polite"></p>';
    var describedBy = 'h-' + f.key + ' e-' + f.key;
    var control;
    if (f.type === 'checkbox') {
      return '<div class="field" data-key="' + f.key + '">' +
        '<div class="check"><input type="checkbox" id="' + id + '" name="' + f.key + '" aria-describedby="' + describedBy + '">' +
        '<label class="field-label" for="' + id + '">' + esc(f.label) + '</label>' + tipBtn + '</div>' +
        hint + err + tip + '</div>';
    }
    var attrs = ' id="' + id + '" name="' + f.key + '" aria-describedby="' + describedBy + '"' + (f.required ? ' required aria-required="true"' : '');
    if (f.type === 'select') {
      control = '<select' + attrs + '><option value="">Escolha uma opção</option>' +
        f.options.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('') + '</select>';
    } else if (f.type === 'textarea') {
      control = '<textarea rows="3"' + attrs + '></textarea>';
    } else {
      var type = { tel: 'tel', date: 'date', email: 'email', text: 'text' }[f.type] || 'text';
      control = '<input type="' + type + '"' + attrs + '>';
    }
    return '<div class="field" data-key="' + f.key + '">' +
      '<div class="field-label"><label for="' + id + '">' + esc(f.label) + req + '</label>' + tipBtn + '</div>' +
      hint + control + err + tip + '</div>';
  }

  function pageProjeto(id) {
    var p = proj(id);
    if (!p) { return notFound(); }
    var fields = p.fields.map(fieldHtml).join('');
    return '<section class="project-hero"><div class="wrap project-hero-grid">' +
      '<div><p class="tag">' + esc(p.type) + '</p><h1>' + esc(p.title) + '</h1>' +
      '<p class="lede">' + esc(p.description) + '</p></div>' +
      '<dl class="facts"><dt>Datas</dt><dd>' + fmt(p.startsAt) + ' a ' + fmt(p.endsAt) + '</dd>' +
      '<dt>Horário</dt><dd>' + esc(p.time) + '</dd>' +
      '<dt>Local</dt><dd>' + esc(p.location) + '</dd>' +
      '<dt>Vagas</dt><dd>' + p.capacity + '</dd></dl>' +
      '</div></section>' +
      '<section class="wrap form-layout" aria-labelledby="form-title">' +
      '<div><div class="section-head"><h2 id="form-title">Inscrição</h2>' +
      '<button type="button" class="btn btn-quiet" data-action="help" aria-haspopup="dialog" aria-label="Ajuda sobre esta inscrição">?</button></div>' +
      '<p>Preencha os dados abaixo. Os campos com * são obrigatórios. Seus dados são usados só para esta inscrição.</p>' +
      '<div class="turnstile" role="group" aria-label="Verificação de segurança">' +
      '<span class="turnstile-box" aria-hidden="true"></span>' +
      '<p class="hint">Verificação anti-robô: placeholder do Cloudflare Turnstile. O widget aparece aqui em produção.</p></div>' +
      '</div>' +
      '<div class="form-panel" id="form-panel">' +
      '<div id="form-summary" class="summary-error" role="alert" hidden></div>' +
      '<form id="signup-form" class="form-stack" novalidate data-project="' + esc(p.id) + '">' +
      fields +
      '<fieldset class="field" data-key="consent"><legend class="field-label">Consentimento</legend>' +
      '<div class="check"><input type="checkbox" id="f-consent" name="consent" aria-describedby="e-consent" required aria-required="true">' +
      '<label for="f-consent">' + esc(S.consentText) + '<span class="req" aria-hidden="true"> *</span></label></div>' +
      '<p class="error" id="e-consent" aria-live="polite"></p></fieldset>' +
      '<div><button type="submit" class="btn btn-primary">Enviar inscrição</button></div>' +
      '</form></div>' +
      '</section>' +
      helpDialog();
  }

  function helpDialog() {
    return '<dialog id="help" class="help" aria-labelledby="help-title"><h2 id="help-title">Ajuda da inscrição</h2>' +
      S.helpTopics.map(function (t) {
        return '<details><summary>' + esc(t.q) + '</summary><p>' + esc(t.a) + '</p></details>';
      }).join('') +
      '<form method="dialog" class="dialog-foot"><button type="submit" class="btn btn-primary">Fechar</button></form></dialog>';
  }

  function validateSignup(form) {
    var p = proj(form.getAttribute('data-project'));
    var errors = [];
    p.fields.forEach(function (f) {
      var el = form.elements[f.key];
      var wrap = form.querySelector('.field[data-key="' + f.key + '"]');
      var msg = '';
      if (!el) { return; }
      if (f.type === 'checkbox') { /* optional checkboxes never fail */ }
      else if (f.required && !String(el.value).trim()) { msg = 'Preencha este campo.'; }
      else if (f.key === 'telefone' && String(el.value).replace(/\D/g, '').length < 10) { msg = 'Informe o telefone com DDD.'; }
      setError(wrap, f.key, msg, errors, f.label, el);
    });
    var consent = form.elements.consent;
    var consentWrap = form.querySelector('.field[data-key="consent"]');
    setError(consentWrap, 'consent', consent.checked ? '' : 'Marque para concordar com o uso dos seus dados.', errors, 'Consentimento', consent);
    return errors;
  }

  function setError(wrap, key, msg, errors, label, el) {
    var errEl = document.getElementById('e-' + key);
    errEl.textContent = msg;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) { errors.push({ label: label, id: el.id }); }
  }

  function handleSignupSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var errors = validateSignup(form);
    var summary = document.getElementById('form-summary');
    if (errors.length) {
      summary.hidden = false;
      summary.innerHTML = '<strong>Revise os campos destacados:</strong><ul>' +
        errors.map(function (er) { return '<li><a href="#' + er.id + '">' + esc(er.label) + '</a></li>'; }).join('') + '</ul>';
      document.getElementById(errors[0].id).focus();
      return;
    }
    var p = proj(form.getAttribute('data-project'));
    var answers = {};
    p.fields.forEach(function (f) {
      var el = form.elements[f.key];
      if (el && f.type !== 'checkbox') { answers[f.key] = el.value; }
    });
    st.signups.unshift({
      id: 's-' + (st.signups.length + 1), projectId: p.id, status: 'Nova', createdAt: new Date().toISOString().slice(0, 16),
      name: form.elements.nome.value.trim(), phone: form.elements.telefone.value.trim(),
      cadUnico: form.elements.cad_unico.value.trim(), answers: answers
    });
    document.getElementById('form-panel').innerHTML =
      '<div class="done"><h2>Inscrição enviada</h2>' +
      '<p>Recebemos seus dados. A equipe do PROAME entra em contato pelo telefone informado.</p>' +
      '<p><a href="#/home">Voltar para os projetos</a></p></div>';
    document.getElementById('form-panel').querySelector('h2').setAttribute('tabindex', '-1');
    document.getElementById('form-panel').querySelector('h2').focus();
    toast('Inscrição enviada.');
  }

  /* ---------- Operate: admin signups ---------- */
  function pageAdmin() {
    var projOpts = S.projects.map(function (p) {
      return '<option value="' + esc(p.id) + '">' + esc(p.title) + '</option>';
    }).join('');
    var statusOpts = S.statuses.map(function (s) {
      return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
    }).join('');
    return '<div class="wrap">' +
      '<div class="admin-title"><h1>Inscrições</h1><p class="count" id="count" aria-live="polite"></p></div>' +
      '<form class="toolbar" role="search" id="filters" onsubmit="return false">' +
      '<div class="field"><label for="f-q">Buscar por nome</label><input type="search" id="f-q" autocomplete="off"></div>' +
      '<div class="field"><label for="f-status">Situação</label><select id="f-status"><option value="">Todas</option>' + statusOpts + '</select></div>' +
      '<div class="field"><label for="f-project">Projeto</label><select id="f-project"><option value="">Todos os projetos</option>' + projOpts + '</select></div>' +
      '</form>' +
      '<div class="table-wrap"><table class="signups">' +
      '<caption class="sr-only">Inscrições recebidas</caption>' +
      '<thead><tr><th scope="col">Nome</th><th scope="col">Projeto</th><th scope="col">Recebida em</th>' +
      '<th scope="col">Telefone</th><th scope="col">Situação</th><th scope="col">Alterar situação</th></tr></thead>' +
      '<tbody id="rows"></tbody></table></div></div>';
  }

  function filteredSignups() {
    var f = st.filters;
    var q = f.q.trim().toLowerCase();
    return st.signups.filter(function (s) {
      if (f.status && s.status !== f.status) { return false; }
      if (f.project && s.projectId !== f.project) { return false; }
      if (q && s.name.toLowerCase().indexOf(q) < 0) { return false; }
      return true;
    });
  }

  function renderRows() {
    var list = filteredSignups();
    var body = document.getElementById('rows');
    if (!body) { return; }
    document.getElementById('count').textContent = list.length + (list.length === 1 ? ' inscrição' : ' inscrições');
    if (!list.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty">Nenhuma inscrição com esses filtros.</td></tr>';
      return;
    }
    body.innerHTML = list.map(function (s) {
      var p = proj(s.projectId);
      var options = S.statuses.map(function (o) {
        return '<option value="' + esc(o) + '"' + (o === s.status ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join('');
      return '<tr><th scope="row">' + esc(s.name) + '</th>' +
        '<td>' + esc(p ? p.title : '') + '</td>' +
        '<td>' + fmt(s.createdAt) + '</td>' +
        '<td class="phone">' + esc(s.phone) + '</td>' +
        '<td><span class="chip ' + (STATUS_CLASS[s.status] || '') + '">' + esc(s.status) + '</span></td>' +
        '<td><label class="sr-only" for="st-' + esc(s.id) + '">Alterar situação de ' + esc(s.name) + '</label>' +
        '<select class="row-select" id="st-' + esc(s.id) + '" data-action="status" data-id="' + esc(s.id) + '">' + options + '</select></td>' +
        '</tr>';
    }).join('');
  }

  /* ---------- router ---------- */
  function parts() {
    var h = location.hash.replace(/^#\/?/, '');
    return h.split('/').filter(Boolean);
  }
  function currentRoute() {
    var p = parts();
    if (!p.length) { return 'home'; }
    return p[0];
  }
  function notFound() {
    return '<div class="narrow section"><h1>Página não encontrada</h1>' +
      '<p><a href="#/home">Voltar para o início</a></p></div>';
  }

  function route() {
    var p = parts();
    var admin = p[0] === 'admin';
    var main;
    var mode;
    if (admin) {
      mode = 'mode-operate';
      main = (!p[1] || p[1] === 'inscricoes') ? pageAdmin() : notFound();
    } else {
      mode = 'mode-persuade';
      if (!p.length || p[0] === 'home') { main = pageHome(); }
      else if (p[0] === 'projeto' && p[1]) { main = pageProjeto(p[1]); }
      else { main = notFound(); }
    }
    document.body.className = mode;
    app.innerHTML = header(admin) + '<main id="main" tabindex="-1">' + main + '</main>' + footer();
    if (admin && (!p[1] || p[1] === 'inscricoes')) {
      document.getElementById('f-q').value = st.filters.q;
      document.getElementById('f-status').value = st.filters.status;
      document.getElementById('f-project').value = st.filters.project;
      renderRows();
    }
    if (pendingScroll) {
      var target = document.getElementById(pendingScroll);
      pendingScroll = null;
      if (target) { target.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }

  /* ---------- theme ---------- */
  function setTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    try { localStorage.setItem('proame-v2-theme', name); } catch (err) { /* private mode: keep in-memory only */ }
    var btn = app.querySelector('[data-action="theme"]');
    if (btn) { btn.setAttribute('aria-pressed', String(name === 'dark')); }
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('proame-v2-theme'); } catch (err) { saved = null; }
    var t = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  }

  /* ---------- events (delegated) ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action],[data-scroll]');
    if (!el) {
      document.querySelectorAll('.tooltip:not([hidden])').forEach(function (tip) { closeTip(tip); });
      return;
    }
    if (el.hasAttribute('data-scroll')) {
      e.preventDefault();
      var id = el.getAttribute('data-scroll');
      if (currentRoute() === 'home' && parts().length <= 1) {
        document.getElementById(id).scrollIntoView();
      } else {
        pendingScroll = id;
        location.hash = '#/home';
      }
      return;
    }
    var action = el.getAttribute('data-action');
    if (action === 'theme') {
      setTheme(isDark() ? 'light' : 'dark');
    } else if (action === 'tip') {
      var tip = document.getElementById(el.getAttribute('data-target'));
      var open = tip.hidden;
      document.querySelectorAll('.tooltip:not([hidden])').forEach(function (t) { if (t !== tip) { closeTip(t); } });
      tip.hidden = !open;
      el.setAttribute('aria-expanded', String(open));
    } else if (action === 'help') {
      var dlg = document.getElementById('help');
      if (dlg && dlg.showModal) { dlg.showModal(); }
    }
  });

  function closeTip(tip) {
    tip.hidden = true;
    var btn = document.querySelector('[aria-controls="' + tip.id + '"]');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.tooltip:not([hidden])').forEach(closeTip);
    }
  });

  document.addEventListener('submit', function (e) {
    if (e.target.id === 'signup-form') { handleSignupSubmit(e); }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'f-q') { st.filters.q = e.target.value; renderRows(); }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'f-status') { st.filters.status = t.value; renderRows(); }
    else if (t.id === 'f-project') { st.filters.project = t.value; renderRows(); }
    else if (t.getAttribute('data-action') === 'status') {
      var id = t.getAttribute('data-id');
      st.signups.forEach(function (s) { if (s.id === id) { s.status = t.value; } });
      renderRows();
      var again = document.getElementById('st-' + id);
      if (again) { again.focus(); }
      toast('Situação atualizada para "' + t.value + '".');
    }
  });

  window.addEventListener('hashchange', route);
  initTheme();
  route();
})();
