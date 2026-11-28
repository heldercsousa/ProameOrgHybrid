/* PROAME v2 prototype - public pages (Persuade mode): home, about, services, projects, project + signup, collaboration, transparency.
   Registers into window.PROAME_V2.pub. Plain script. */
(function () {
  'use strict';

  var V = window.PROAME_V2;
  var S = V.S;
  var st = V.st;
  var esc = V.esc;

  var TIP_HINT = 'Mais informações sobre este campo';

  /* ---------- shared form building (also used by the collaboration form) ---------- */
  var COLLAB_FIELDS = [
    { key: 'nome', label: 'Nome / Empresa', type: 'text', required: true, help: '', options: [] },
    { key: 'perfil', label: 'Perfil', type: 'select', required: true, help: '', options: S.collab.profiles },
    { key: 'colaboracao', label: 'Como deseja colaborar', type: 'select', required: true, help: '', options: S.collab.contributions },
    { key: 'telefone', label: 'Telefone', type: 'phone', required: true, help: 'Com DDD. Usamos para confirmar o contato.', options: [] },
    { key: 'email', label: 'E-mail', type: 'email', required: false, help: '', options: [] },
    { key: 'observacao', label: 'Observação', type: 'textarea', required: false, help: '', options: [] }
  ];

  function inputType(t) {
    return { phone: 'tel', email: 'email', number: 'number', date: 'date', time: 'time', text: 'text' }[t] || 'text';
  }

  function fieldHtml(f, prefix) {
    var id = prefix + '-' + f.key;
    var req = f.required ? '<span class="req" aria-hidden="true"> *</span>' : '';
    var tipBtn = f.help
      ? '<button type="button" class="info-btn" data-action="tip" data-target="tip-' + prefix + '-' + f.key +
        '" aria-expanded="false" aria-controls="tip-' + prefix + '-' + f.key + '" aria-label="' + esc(TIP_HINT + ': ' + f.label) + '">i</button>'
      : '';
    var tip = f.help ? '<div class="tooltip" id="tip-' + prefix + '-' + f.key + '" role="note" hidden>' + esc(f.help) + '</div>' : '';
    var err = '<p class="error" id="e-' + prefix + '-' + f.key + '" aria-live="polite"></p>';
    var req_attr = f.required ? ' required aria-required="true"' : '';

    if (f.type === 'checkbox') {
      return '<div class="field" data-key="' + esc(f.key) + '"><div class="check">' +
        '<input type="checkbox" id="' + id + '" name="' + esc(f.key) + '" aria-describedby="e-' + prefix + '-' + f.key + '">' +
        '<label class="field-label" for="' + id + '">' + esc(f.label) + '</label>' + tipBtn + '</div>' + err + tip + '</div>';
    }
    if (f.type === 'datetime-range') {
      return '<fieldset class="field" data-key="' + esc(f.key) + '"><legend class="field-label">' + esc(f.label) + req + '</legend>' +
        '<div class="range">' +
        '<div><label for="' + id + '-de">Início</label><input type="datetime-local" id="' + id + '-de" name="' + esc(f.key) + '_de"' + req_attr + '></div>' +
        '<div><label for="' + id + '-ate">Fim</label><input type="datetime-local" id="' + id + '-ate" name="' + esc(f.key) + '_ate"' + req_attr + '></div>' +
        '</div>' + err + '</fieldset>';
    }
    var control;
    var attrs = ' id="' + id + '" name="' + esc(f.key) + '" aria-describedby="e-' + prefix + '-' + f.key + '"' + req_attr;
    if (f.type === 'select') {
      control = '<select' + attrs + '>' + V.opts(f.options, '', 'Escolha uma opção') + '</select>';
    } else if (f.type === 'textarea') {
      control = '<textarea rows="3"' + attrs + '></textarea>';
    } else {
      control = '<input type="' + inputType(f.type) + '"' + attrs + '>';
    }
    return '<div class="field" data-key="' + esc(f.key) + '">' +
      '<div class="field-label"><label for="' + id + '">' + esc(f.label) + req + '</label>' + tipBtn + '</div>' +
      control + err + tip + '</div>';
  }

  /* Returns [{ key, label, value, el }] style error list; fills inline messages. */
  function validateForm(form, fields, prefix, consentCheck) {
    var errors = [];
    function report(key, label, msg, elId) {
      var errEl = document.getElementById('e-' + prefix + '-' + key);
      if (errEl) { errEl.textContent = msg; }
      var el = document.getElementById(elId);
      if (el) { el.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
      if (msg) { errors.push({ label: label, id: elId }); }
    }
    fields.forEach(function (f) {
      if (f.type === 'checkbox') { return; }
      if (f.type === 'datetime-range') {
        var de = form.elements[f.key + '_de'];
        var ate = form.elements[f.key + '_ate'];
        var msg = '';
        if (!de.value || !ate.value) { msg = 'Informe o início e o fim.'; }
        else if (ate.value < de.value) { msg = 'O fim deve ser depois do início.'; }
        report(f.key, f.label, msg, prefix + '-' + f.key + '-de');
        return;
      }
      var el = form.elements[f.key];
      if (!el) { return; }
      var v = String(el.value).trim();
      var m = '';
      if (f.required && !v) { m = 'Preencha este campo.'; }
      else if (f.type === 'phone' && v && v.replace(/\D/g, '').length < 10) { m = 'Informe o telefone com DDD.'; }
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { m = 'Informe um e-mail válido.'; }
      report(f.key, f.label, m, el.id);
    });
    if (consentCheck) {
      var c = form.elements.consent;
      report('consent', 'Consentimento', c.checked ? '' : 'Marque para concordar com o uso dos seus dados.', c.id);
    }
    return errors;
  }

  function summaryHtml(errors) {
    return '<strong>Revise os campos destacados:</strong><ul>' +
      errors.map(function (er) { return '<li><a href="#' + er.id + '">' + esc(er.label) + '</a></li>'; }).join('') + '</ul>';
  }

  function answersFrom(form, fields) {
    return fields.map(function (f) {
      var value;
      if (f.type === 'checkbox') { value = form.elements[f.key].checked ? 'Sim' : 'Não'; }
      else if (f.type === 'datetime-range') {
        value = V.fmtDT(form.elements[f.key + '_de'].value) + ' até ' + V.fmtDT(form.elements[f.key + '_ate'].value);
      } else { value = String(form.elements[f.key].value).trim(); }
      return { key: f.key, label: f.label, value: value };
    });
  }

  function consentField() {
    return '<fieldset class="field" data-key="consent"><legend class="field-label">Consentimento</legend>' +
      '<div class="check"><input type="checkbox" id="pub-consent" name="consent" aria-describedby="e-pub-consent" required aria-required="true">' +
      '<label for="pub-consent">' + esc(S.consentText) + '<span class="req" aria-hidden="true"> *</span></label></div>' +
      '<p class="error" id="e-pub-consent" aria-live="polite"></p></fieldset>';
  }

  function turnstile() {
    return '<div class="turnstile" role="group" aria-label="Verificação de segurança">' +
      '<span class="turnstile-box" aria-hidden="true"></span>' +
      '<p class="hint">Verificação anti-robô: placeholder do Cloudflare Turnstile. O widget aparece aqui em produção.</p></div>';
  }

  function summaryBox() {
    return '<div id="form-summary" class="summary-error" role="alert" hidden></div>';
  }

  function showSummary(errors) {
    var box = document.getElementById('form-summary');
    box.hidden = false;
    box.innerHTML = summaryHtml(errors);
    document.getElementById(errors[0].id).focus();
  }

  function doneBox(title, text, linkHref, linkText) {
    return '<div class="done"><h2 tabindex="-1" id="done-title">' + esc(title) + '</h2><p>' + esc(text) + '</p>' +
      '<p><a href="' + linkHref + '">' + esc(linkText) + '</a></p></div>';
  }

  function paragraphs(text) {
    return String(text || '').split(/\n\s*\n/).map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('');
  }

  function dateTile(iso) {
    var a = V.dayMonth(iso);
    return '<div class="date-tile" aria-hidden="true"><span class="d">' + a.d + '</span><span class="m">' + a.m + '</span></div>';
  }

  function projectRow(p) {
    var open = p.signupOpen ? '' : '<p class="meta">Inscrições encerradas</p>';
    return '<li class="project-row">' + dateTile(p.startsAt) +
      '<div><p class="tag">' + esc(V.typeName(p.typeId)) + '</p>' +
      '<h3><a href="#/projeto/' + esc(p.id) + '">' + esc(p.title) + '</a></h3>' +
      '<p>' + esc(String(p.description).split('\n')[0]) + '</p>' +
      '<p class="meta">Início em ' + V.fmtDT(p.startsAt) + '</p>' +
      '<p class="meta">Local: ' + esc(p.location) + '</p>' +
      '<p class="meta">Vagas: ' + p.capacity + '</p>' + open +
      '<a class="btn btn-quiet" href="#/projeto/' + esc(p.id) + '">Ver projeto<span class="sr-only"> ' + esc(p.title) + '</span></a>' +
      '</div></li>';
  }

  function sectionHead(title, extra) {
    return '<div class="section-head"><h2>' + esc(title) + '</h2>' + (extra || '') + '</div>';
  }

  /* Body block on Quem somos: address and a maps link only. The full contact list lives in the global footer. */
  function contactBlock() {
    var c = S.contact;
    return '<dl class="facts"><dt>Endereço</dt><dd>' + esc(c.address) + '</dd></dl>' +
      '<p><a href="' + esc(V.mapsLink(c.address)) + '" target="_blank" rel="noopener">Como chegar' +
      '<span class="sr-only"> (abre o Google Maps em nova aba)</span></a></p>' +
      '<p>Fale com a gente pelos contatos no rodapé. <a href="#contato" data-action="goto-contact">Ir para os contatos</a></p>';
  }

  /* ---------- pages ---------- */
  V.pub.home = function () {
    var upcoming = V.publishedProjects().slice(0, 3);
    var services = V.activeServices().slice(0, 4).map(function (s) {
      return '<li><h3>' + esc(s.title) + '</h3><p>' + esc(s.description) + '</p></li>';
    }).join('');
    var rows = upcoming.length
      ? '<ul class="projects">' + upcoming.map(projectRow).join('') + '</ul>'
      : '<p>Em breve novos projetos.</p>';
    return '<section class="hero"><div class="wrap">' +
      '<h1 class="hero-rise">' + esc(st.pages.home.heroTitle) + '</h1>' +
      '<p>' + esc(st.pages.home.heroText) + '</p>' +
      '<a class="btn btn-primary" href="#/projetos">Ver projetos</a>' +
      '</div></section>' +
      '<section class="section"><div class="wrap narrow-text"><h2>Nossa missão</h2><p>' + esc(st.pages.home.missionText) + '</p></div></section>' +
      '<section class="section"><div class="wrap">' + sectionHead('O que realizamos', '<a href="#/servicos">Ver todos os serviços</a>') +
      '<ul class="help-list">' + services + '</ul></div></section>' +
      '<section class="section"><div class="wrap">' + sectionHead('Próximos projetos', '<a href="#/projetos">Todos os projetos</a>') + rows + '</div></section>' +
      '<section class="section"><div class="wrap cta-band"><h2>Como posso colaborar?</h2>' +
      '<p>Empresas, professores, monitores e seguranças podem apoiar nossos projetos com recursos, cestas básicas, serviços ou formação.</p>' +
      '<a class="btn btn-primary" href="#/colaborar">Quero colaborar</a></div></section>';
  };

  V.pub['quem-somos'] = function () {
    return '<section class="section"><div class="wrap narrow-text"><h1>Quem somos</h1>' +
      paragraphs(st.pages.quemSomos.body) + '<div class="section-gap">' + contactBlock() + '</div></div></section>';
  };

  V.pub.servicos = function () {
    var list = V.activeServices().map(function (s) {
      return '<li><h3>' + esc(s.title) + '</h3><p>' + esc(s.description) + '</p></li>';
    }).join('');
    return '<section class="section"><div class="wrap"><div class="section-head"><h1>O que realizamos</h1></div>' +
      '<p>Conheça os serviços oferecidos pelo PROAME.</p>' +
      '<ul class="help-list">' + list + '</ul></div></section>';
  };

  function filteredProjects() {
    var f = st.filters;
    return V.publishedProjects().filter(function (p) {
      if (f.type !== 'all' && p.typeId !== f.type) { return false; }
      var days = V.daysFromNow(p.startsAt);
      if (f.date === '30' && (days < 0 || days > 30)) { return false; }
      if (f.date === 'later' && days <= 30) { return false; }
      if (f.cover === 'with' && !p.photos.length) { return false; }
      if (f.cover === 'without' && p.photos.length) { return false; }
      return true;
    });
  }

  function chipGroup(group, list, label) {
    return '<div class="chips" role="group" aria-label="' + esc(label) + '">' + list.map(function (o) {
      return '<button type="button" class="chip-btn" data-action="filter" data-group="' + group + '" data-value="' + esc(o[0]) +
        '" aria-pressed="' + (st.filters[group] === o[0]) + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }

  V.pub.projetos = function () {
    var typeOpts = [['all', 'Todos os tipos']].concat(st.projectTypes.map(function (t) { return [t.id, t.name]; }));
    var dateOpts = [['all', 'Todas as datas'], ['30', 'Próximos 30 dias'], ['later', 'Depois de 30 dias']];
    var coverOpts = [['all', 'Com ou sem foto'], ['with', 'Com foto'], ['without', 'Sem foto']];
    var list = filteredProjects();
    return '<section class="section"><div class="wrap"><h1>O que temos</h1>' +
      '<p>Projetos agendados com inscrições para beneficiários.</p>' +
      '<div class="filter-block">' + chipGroup('type', typeOpts, 'Filtrar por tipo') +
      chipGroup('date', dateOpts, 'Filtrar por data') + chipGroup('cover', coverOpts, 'Filtrar por foto') + '</div>' +
      '<p class="count" aria-live="polite">' + list.length + (list.length === 1 ? ' projeto' : ' projetos') + '</p>' +
      (list.length ? '<ul class="projects">' + list.map(projectRow).join('') + '</ul>'
        : '<p class="empty-note">Nenhum projeto encontrado com esses filtros.</p>') +
      '</div></section>';
  };

  V.actions.filter = function (el) {
    var group = el.getAttribute('data-group');
    st.filters[group] = el.getAttribute('data-value');
    V.rerender('[data-action="filter"][data-group="' + group + '"][data-value="' + st.filters[group] + '"]');
  };

  V.pub.projeto = function (id) {
    var p = V.findById(st.projects, id);
    if (!p || p.status !== 'published') {
      return '<section class="section"><div class="wrap narrow-text"><h1>Projeto não encontrado</h1>' +
        '<p><a href="#/projetos">Voltar para O que temos</a></p></div></section>';
    }
    var fields = p.fields.map(function (f) { return fieldHtml(f, 'pub'); }).join('');
    var photos = p.photos.length
      ? '<ul class="gallery">' + p.photos.map(function (ph, i) {
        return '<li><div class="photo-ph photo-' + (i % 3) + '" aria-hidden="true"></div>' +
          (ph.caption ? '<p class="meta">' + esc(ph.caption) + '</p>' : '') + '</li>';
      }).join('') + '</ul>'
      : '';
    var form = p.signupOpen
      ? '<section class="form-layout" aria-labelledby="form-title">' +
        '<div><div class="section-head"><h2 id="form-title">Inscrição</h2>' + V.helpButton('/projeto', 'Inscrição') + '</div>' +
        '<p>Preencha os dados abaixo. Os campos com * são obrigatórios. Seus dados são usados só para esta inscrição.</p>' +
        turnstile() + '</div>' +
        '<div class="form-panel" id="form-panel">' + summaryBox() +
        '<form id="signup-form" class="form-stack" novalidate data-form="signup" data-project="' + esc(p.id) + '">' +
        fields + consentField() +
        '<div><button type="submit" class="btn btn-primary">Enviar inscrição</button></div></form></div></section>'
      : '<p class="empty-note">As inscrições para este projeto estão encerradas.</p>';
    return '<section class="project-hero"><div class="wrap project-hero-grid">' +
      '<div><p class="tag">' + esc(V.typeName(p.typeId)) + '</p><h1>' + esc(p.title) + '</h1>' +
      '<div class="lede">' + paragraphs(p.description) + '</div></div>' +
      '<dl class="facts"><dt>Quando</dt><dd>' + V.fmtDT(p.startsAt) + ' até ' + V.fmtDT(p.endsAt) + '</dd>' +
      '<dt>Onde</dt><dd>' + esc(p.location) + '</dd>' +
      '<dt>Vagas</dt><dd>' + p.capacity + '</dd></dl></div></section>' +
      '<section class="wrap">' + photos + '</section>' +
      '<div class="wrap">' + form + '</div>';
  };

  V.forms.signup = function (form) {
    var p = V.findById(st.projects, form.getAttribute('data-project'));
    if (!p) { return; }
    var errors = validateForm(form, p.fields, 'pub', false);
    var c = form.elements.consent;
    var consentMsg = c.checked ? '' : 'Marque para concordar com o uso dos seus dados.';
    document.getElementById('e-pub-consent').textContent = consentMsg;
    c.setAttribute('aria-invalid', consentMsg ? 'true' : 'false');
    if (consentMsg) { errors.push({ label: 'Consentimento', id: c.id }); }
    if (errors.length) { showSummary(errors); return; }
    st.signups.unshift({
      id: 's-' + Date.now(), projectId: p.id, status: 'Nova', createdAt: new Date().toISOString(),
      consent: true, consentText: S.consentText, answers: answersFrom(form, p.fields)
    });
    V.audit('Nova inscrição recebida: ' + p.title);
    document.getElementById('form-panel').innerHTML = doneBox('Inscrição enviada',
      'Recebemos seus dados. A equipe do PROAME entra em contato pelo telefone informado.', '#/projetos', 'Voltar para O que temos');
    document.getElementById('done-title').focus();
    V.toast('Inscrição enviada.');
  };

  V.pub.colaborar = function () {
    return '<section class="section"><div class="wrap narrow-text">' +
      '<div class="section-head"><h1>Como posso colaborar</h1>' + V.helpButton('/colaborar', 'Como posso colaborar') + '</div>' +
      '<p>Empresas, professores, monitores e seguranças podem apoiar nossos projetos. Preencha o formulário e nossa equipe entrará em contato.</p>' +
      '<div class="form-panel" id="form-panel">' + summaryBox() +
      '<form class="form-stack" novalidate data-form="collab">' +
      COLLAB_FIELDS.map(function (f) { return fieldHtml(f, 'col'); }).join('') +
      '<fieldset class="field" data-key="consent"><legend class="field-label">Consentimento</legend>' +
      '<div class="check"><input type="checkbox" id="col-consent" name="consent" aria-describedby="e-col-consent" required aria-required="true">' +
      '<label for="col-consent">' + esc(S.consentText) + '<span class="req" aria-hidden="true"> *</span></label></div>' +
      '<p class="error" id="e-col-consent" aria-live="polite"></p></fieldset>' +
      turnstile() +
      '<div><button type="submit" class="btn btn-primary">Enviar</button></div></form></div></div></section>';
  };

  V.forms.collab = function (form) {
    var errors = validateForm(form, COLLAB_FIELDS, 'col', false);
    var c = form.elements.consent;
    var consentMsg = c.checked ? '' : 'Marque para concordar com o uso dos seus dados.';
    document.getElementById('e-col-consent').textContent = consentMsg;
    if (consentMsg) { errors.push({ label: 'Consentimento', id: c.id }); }
    if (errors.length) {
      var box = document.getElementById('form-summary');
      box.hidden = false;
      box.innerHTML = summaryHtml(errors);
      document.getElementById(errors[0].id).focus();
      return;
    }
    var v = function (k) { return String(form.elements[k].value).trim(); };
    st.offers.unshift({
      id: 'o-' + Date.now(), name: v('nome'), profile: v('perfil'), contribution: v('colaboracao'),
      phone: v('telefone'), email: v('email'), observation: v('observacao'), status: 'Nova',
      createdAt: new Date().toISOString(), consent: true
    });
    V.audit('Nova oferta de colaboração: ' + v('nome'));
    document.getElementById('form-panel').innerHTML = doneBox('Obrigado por querer colaborar',
      'Recebemos sua oferta e entraremos em contato.', '#/home', 'Voltar ao início');
    document.getElementById('done-title').focus();
    V.toast('Oferta enviada.');
  };

  V.pub.transparencia = function () {
    var list = st.editais.filter(function (e) { return e.status === 'published'; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var items = list.length ? '<ul class="ruled">' + list.map(function (e) {
      return '<li class="edital-row"><div><p class="edital-num">' + esc(e.number) + '</p><h3>' + esc(e.title) + '</h3>' +
        '<p class="meta">Publicado em ' + V.fmtDate(e.date) + (e.deadline ? ' · Prazo: ' + V.fmtDate(e.deadline) : '') + '</p></div>' +
        '<button type="button" class="btn btn-quiet" data-action="download-edital" data-id="' + esc(e.id) + '">Baixar edital ' +
        esc(e.number) + '</button></li>';
    }).join('') + '</ul>' : '<p>Nenhum edital publicado no momento.</p>';
    return '<section class="section"><div class="wrap"><h1>Transparência</h1>' +
      '<p>Editais promovidos pelo PROAME, disponíveis para download.</p>' +
      '<h2 class="sub-head">Editais</h2>' + items + '</div></section>';
  };

  V.actions['download-edital'] = function (el) {
    var e = V.findById(st.editais, el.getAttribute('data-id'));
    if (!e) { return; }
    /* Seed editais have no file: a small text placeholder stands in for the PDF in the prototype. */
    var text = 'PROAME - Edital ' + e.number + '\n' + e.title + '\n\n' +
      'Arquivo de demonstração (protótipo). O PDF oficial será disponibilizado na versão final.\n';
    var url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'edital-' + e.number.replace(/\W+/g, '-') + '-exemplo.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  };

  /* Exposed for the admin module (builder preview and signup answers). */
  V.fieldHtml = fieldHtml;
  V.validateForm = validateForm;
  V.summaryHtml = summaryHtml;
  V.paragraphs = paragraphs;
  V.sectionHead = sectionHead;
  V.contactBlock = contactBlock;
  V.COLLAB_FIELDS = COLLAB_FIELDS;
})();
