/* PROAME v2 prototype - admin pages (Operate mode): login (2 steps), painel, paginas, projetos, projeto builder,
   inscricoes, ofertas, editais, administradores, configuracoes, auditoria, ajuda, novidades.
   Registers into window.PROAME_V2.admin. Plain script. Prototype: no real authentication. */
(function () {
  'use strict';

  var V = window.PROAME_V2;
  var S = V.S;
  var st = V.st;
  var esc = V.esc;

  var FIELD_TYPES = [
    { value: 'text', label: 'Texto' }, { value: 'textarea', label: 'Texto longo' }, { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' }, { value: 'time', label: 'Hora' }, { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefone' }, { value: 'select', label: 'Seleção (lista)' },
    { value: 'checkbox', label: 'Sim/não (caixa de seleção)' }, { value: 'datetime-range', label: 'Intervalo de datas e horas' }
  ];
  var TYPE_LABEL = {};
  FIELD_TYPES.forEach(function (t) { TYPE_LABEL[t.value] = t.label; });
  var PROJECT_STATUS_OPTS = [
    { value: 'draft', label: 'Rascunho' }, { value: 'published', label: 'Publicado' }, { value: 'closed', label: 'Encerrado' }
  ];
  var EDITAL_STATUS_OPTS = [
    { value: 'published', label: 'Publicado' }, { value: 'draft', label: 'Rascunho' }
  ];
  var pendingEdital = null;

  function adminPage(key, title, body) {
    return '<section class="admin-page"><div class="admin-title"><h1>' + esc(title) + '</h1>' +
      V.helpButton('/admin' + (key === 'painel' ? '' : '/' + key), title) + '</div>' + body + '</section>';
  }

  function alertBox(kind, message) {
    return '<p class="alert ' + kind + '" role="status">' + esc(message) + '</p>';
  }

  function cell(label, html) { return '<td data-label="' + esc(label) + '">' + html + '</td>'; }

  function table(caption, headers, rowsHtml) {
    return '<div class="table-wrap"><table class="data-table"><caption class="sr-only">' + esc(caption) + '</caption>' +
      '<thead><tr>' + headers.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody></table></div>';
  }

  function selectField(id, label, options, selected, extraAttr) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' +
      '<select id="' + id + '"' + (extraAttr || '') + '>' + V.opts(options, selected) + '</select></div>';
  }

  function textInput(name, label, value, type, extra) {
    var id = 'a-' + name.replace(/\W+/g, '-');
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' +
      '<input id="' + id + '" name="' + esc(name) + '" type="' + (type || 'text') + '" value="' + esc(value == null ? '' : value) + '"' + (extra || '') + '></div>';
  }

  function textArea(name, label, value, rows) {
    var id = 'a-' + name.replace(/\W+/g, '-');
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' +
      '<textarea id="' + id + '" name="' + esc(name) + '" rows="' + (rows || 4) + '">' + esc(value) + '</textarea></div>';
  }

  function formError(id) {
    return '<p class="error" id="' + id + '" role="alert" hidden></p>';
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) { V.toast(msg); return; }
    el.textContent = msg;
    el.hidden = false;
    el.focus();
  }

  /* ---------- login (2 steps; prototype accepts any input) ---------- */
  V.admin.login = function () {
    var body;
    if (st.loginStep === 'code') {
      var input = st.loginRecovery
        ? textInput('codigo', 'Código de recuperação', '', 'text', ' autocomplete="one-time-code" required')
        : textInput('codigo', 'Código de verificação (6 dígitos)', '', 'text', ' inputmode="numeric" autocomplete="one-time-code" required');
      body = '<form data-form="login-code" class="form-panel narrow-form" novalidate>' + alertBox('warn', 'Protótipo: qualquer código é aceito.') +
        formError('login-code-error') + input +
        '<div class="form-actions"><button type="submit" class="btn btn-primary">Verificar</button>' +
        '<button type="button" class="btn btn-quiet" data-action="login-recovery-toggle">' +
        (st.loginRecovery ? 'Usar código do aplicativo' : 'Usar código de recuperação') + '</button>' +
        '<button type="button" class="btn btn-quiet" data-action="login-back">Voltar</button></div></form>';
    } else {
      body = '<form data-form="login" class="form-panel narrow-form" novalidate>' + alertBox('warn', 'Protótipo: qualquer e-mail e senha são aceitos.') +
        formError('login-error') +
        textInput('email', 'E-mail', '', 'email', ' autocomplete="username" required') +
        textInput('senha', 'Senha', '', 'password', ' autocomplete="current-password" required') +
        '<div class="form-actions"><button type="submit" class="btn btn-primary">Entrar</button></div></form>';
    }
    return '<section class="admin-page narrow"><div class="admin-title"><h1>' +
      (st.loginStep === 'code' ? 'Verificação em duas etapas' : 'Área do admin') + '</h1></div>' + body + '</section>';
  };

  V.forms.login = function (form) {
    var email = String(form.elements.namedItem('email').value).trim();
    var senha = form.elements.namedItem('senha').value;
    if (!email || !senha) { showError('login-error', 'Informe e-mail e senha.'); return; }
    st.loginStep = 'code';
    st.loginRecovery = false;
    V.route();
  };

  V.forms['login-code'] = function (form) {
    var codigo = String(form.elements.namedItem('codigo').value).trim();
    if (!codigo) { showError('login-code-error', 'Informe o código.'); return; }
    st.session = true;
    V.audit(st.loginRecovery ? 'Login com código de recuperação' : 'Login com verificação em duas etapas');
    st.loginStep = 'password';
    st.loginRecovery = false;
    location.hash = '#/admin';
    V.route();
  };

  V.actions['login-recovery-toggle'] = function () { st.loginRecovery = !st.loginRecovery; V.rerender('[data-action="login-recovery-toggle"]'); };
  V.actions['login-back'] = function () { st.loginStep = 'password'; V.rerender('#a-email'); };
  V.actions.logout = function () {
    st.session = false;
    st.loginStep = 'password';
    location.hash = '#/admin/login';
    V.route();
  };

  /* ---------- painel ---------- */
  function stat(n, label, href) {
    return '<a class="stat" href="' + href + '"><strong>' + n + '</strong><span>' + esc(label) + '</span></a>';
  }

  V.admin.painel = function () {
    var pub = st.projects.filter(function (p) { return p.status === 'published'; }).length;
    var novasIns = st.signups.filter(function (s) { return s.status === 'Nova'; }).length;
    var novasOf = st.offers.filter(function (o) { return o.status === 'Nova'; }).length;
    var editais = st.editais.filter(function (e) { return e.status === 'published'; }).length;
    var recentS = st.signups.slice(0, 5).map(function (s) {
      return '<li><strong>' + esc(V.answerOf(s, 'nome') || 'Sem nome') + '</strong> · ' + esc(V.projectTitle(s.projectId)) +
        '<p class="meta">' + esc(V.fmtStamp(s.createdAt)) + ' · ' + esc(s.status) + '</p></li>';
    }).join('');
    var recentO = st.offers.slice(0, 5).map(function (o) {
      return '<li><strong>' + esc(o.name) + '</strong> · ' + esc(o.contribution) +
        '<p class="meta">' + esc(V.fmtStamp(o.createdAt)) + ' · ' + esc(o.status) + '</p></li>';
    }).join('');
    return adminPage('painel', 'Painel',
      '<div class="stats">' + stat(pub, 'Projetos publicados', '#/admin/projetos') + stat(novasIns, 'Inscrições novas', '#/admin/inscricoes') +
      stat(novasOf, 'Ofertas novas', '#/admin/ofertas') + stat(editais, 'Editais publicados', '#/admin/editais') + '</div>' +
      '<div class="two-col"><div><h2 class="sub-head">Inscrições recentes</h2>' +
      (recentS ? '<ul class="ruled">' + recentS + '</ul>' : '<p>Nenhuma inscrição.</p>') + '</div>' +
      '<div><h2 class="sub-head">Ofertas recentes</h2>' +
      (recentO ? '<ul class="ruled">' + recentO + '</ul>' : '<p>Nenhuma oferta.</p>') + '</div></div>' +
      '<div class="callout"><h2 class="sub-head">Dados de exemplo</h2><p>Restaura projetos, páginas, editais, inscrições e ofertas de exemplo. Os dados atuais serão apagados.</p>' +
      '<button type="button" class="btn btn-quiet" data-action="restore-open">Restaurar dados de exemplo</button></div>' +
      '<h2 class="sub-head">Segurança e ajuda</h2><ul class="ruled links">' +
      '<li><a href="#/admin/administradores">Administradores e Roots</a></li>' +
      '<li><a href="#/admin/auditoria">Auditoria</a></li>' +
      '<li><a href="#/admin/ajuda">Central de ajuda</a></li></ul>');
  };

  V.actions['restore-open'] = function () {
    V.openDialog('Restaurar dados de exemplo?', '<p>As alterações atuais serão perdidas.</p>' +
      '<div class="dlg-actions"><button type="button" class="btn btn-quiet" data-action="dlg-close">Cancelar</button>' +
      '<button type="button" class="btn btn-danger" data-action="restore-confirm">Restaurar</button></div>', '.btn-quiet');
  };
  V.actions['restore-confirm'] = function () {
    V.closeDialog();
    V.restoreSeed();
    V.audit('Restaurou os dados de exemplo');
    V.toast('Dados de exemplo restaurados.');
    V.route();
  };

  /* ---------- páginas e contato ---------- */
  V.admin.paginas = function () {
    var h = st.pages.home;
    var q = st.pages.quemSomos;
    var c = st.contact;
    var test = function (label) {
      return '<button type="button" class="btn btn-quiet btn-small" data-action="test-link">Testar ' + esc(label) + '</button>';
    };
    return adminPage('paginas', 'Páginas e contato',
      '<p class="note">As alterações aparecem no site público após salvar.</p>' +
      '<form data-form="pages" class="form-panel" novalidate>' +
      '<fieldset><legend>Início</legend>' + textInput('home.heroTitle', 'Título do banner', h.heroTitle) +
      textArea('home.heroText', 'Texto do banner', h.heroText, 3) + textArea('home.missionText', 'Missão', h.missionText, 3) + '</fieldset>' +
      '<fieldset><legend>Quem somos</legend>' +
      textArea('quemSomos.body', 'Texto (separe os parágrafos com uma linha em branco)', q.body, 8) + '</fieldset>' +
      '<fieldset><legend>Contato</legend>' + textInput('contact.address', 'Endereço', c.address) +
      textInput('contact.phone', 'Telefone', c.phone, 'tel') +
      textInput('contact.whatsapp', 'WhatsApp (somente dígitos, com DDI)', c.whatsapp, 'tel') + test('WhatsApp') +
      textInput('contact.email', 'E-mail', c.email, 'email') +
      textInput('contact.instagram', 'Instagram (@perfil ou link)', c.instagram) + test('Instagram') +
      textInput('contact.youtube', 'YouTube (@canal ou link)', c.youtube) + test('YouTube') + '</fieldset>' +
      '<p class="note">O termo de consentimento LGPD é editado em Configurações (Root).</p>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary">Salvar alterações</button></div></form>');
  };

  V.forms.pages = function (form) {
    var g = function (name) { return String(form.elements.namedItem(name).value).trim(); };
    st.pages.home.heroTitle = g('home.heroTitle');
    st.pages.home.heroText = g('home.heroText');
    st.pages.home.missionText = g('home.missionText');
    st.pages.quemSomos.body = form.elements.namedItem('quemSomos.body').value.trim();
    ['address', 'phone', 'whatsapp', 'email', 'instagram', 'youtube'].forEach(function (k) {
      st.contact[k] = g('contact.' + k);
    });
    V.audit('Editou páginas e contato');
    V.toast('Alterações salvas.');
    V.route();
  };

  V.actions['test-link'] = function () { V.toast('Link testado (simulado no protótipo).'); };

  /* ---------- projetos (list) ---------- */
  V.admin.projetos = function () {
    var rows = st.projects.slice().sort(function (a, b) { return a.startsAt < b.startsAt ? -1 : 1; }).map(function (p) {
      return '<tr>' + cell('Título', '<strong>' + esc(p.title) + '</strong>') + cell('Tipo', esc(V.typeName(p.typeId))) +
        cell('Início', esc(V.fmtDT(p.startsAt))) + cell('Situação', esc(PROJECT_STATUS_OPTS.filter(function (o) { return o.value === p.status; })[0].label)) +
        cell('Inscrições', String(V.countSignups(p.id))) +
        cell('Ações', '<a href="#/admin/projeto/' + esc(p.id) + '">Editar<span class="sr-only"> ' + esc(p.title) + '</span></a>') + '</tr>';
    }).join('');
    return adminPage('projetos', 'Projetos',
      '<div class="toolbar"><span class="note">Rascunhos não aparecem no site público.</span>' +
      '<a class="btn btn-primary" href="#/admin/projeto/novo">Novo projeto</a></div>' +
      table('Projetos agendados', ['Título', 'Tipo', 'Início', 'Situação', 'Inscrições', 'Ações'],
        rows || '<tr><td colspan="6" class="empty">Nenhum projeto cadastrado.</td></tr>'));
  };

  /* ---------- projeto (builder) ---------- */
  function newDraft() {
    return {
      id: null, title: '', typeId: st.projectTypes[0].id, status: 'draft', description: '', location: '',
      startsAt: '', endsAt: '', capacity: 20, signupOpen: false, photos: [],
      fields: V.clone(st.baseFields)
    };
  }

  /* Copies the visible project form into the draft so builder actions do not lose typed values. */
  function captureDraft() {
    var f = document.getElementById('project-form');
    var d = st.draft;
    if (!f || !d) { return; }
    d.title = f.elements.namedItem('title').value;
    d.typeId = f.elements.namedItem('typeId').value;
    d.status = f.elements.namedItem('status').value;
    d.description = f.elements.namedItem('description').value;
    d.location = f.elements.namedItem('location').value;
    d.startsAt = f.elements.namedItem('startsAt').value;
    d.endsAt = f.elements.namedItem('endsAt').value;
    d.capacity = Number(f.elements.namedItem('capacity').value) || d.capacity;
    d.signupOpen = f.elements.namedItem('signupOpen').checked;
  }

  function fieldRow(f, index, count) {
    var locked = !!f.locked;
    var actions = locked
      ? '<span class="note">Fixo</span>'
      : '<button type="button" class="btn btn-quiet btn-small" data-action="field-up" data-key="' + esc(f.key) + '"' + (index <= st.baseFields.length ? ' disabled' : '') + '>Subir<span class="sr-only"> ' + esc(f.label) + '</span></button>' +
        '<button type="button" class="btn btn-quiet btn-small" data-action="field-down" data-key="' + esc(f.key) + '"' + (index >= count - 1 ? ' disabled' : '') + '>Descer<span class="sr-only"> ' + esc(f.label) + '</span></button>' +
        '<button type="button" class="btn btn-quiet btn-small" data-action="field-remove" data-key="' + esc(f.key) + '">Remover<span class="sr-only"> ' + esc(f.label) + '</span></button>';
    return '<li class="field-row"><div><p class="field-name">' + esc(f.label) + '</p>' +
      '<p class="meta">' + esc(TYPE_LABEL[f.type] || f.type) + ' · ' + (f.required ? 'Obrigatório' : 'Opcional') + '</p></div>' +
      '<div class="row-actions">' + actions + '</div></li>';
  }

  function photoRow(ph) {
    return '<li class="photo-item"><span class="photo-ph photo-0 thumb" aria-hidden="true"></span><span>' + esc(ph.caption || 'Foto') + '</span>' +
      '<button type="button" class="btn btn-quiet btn-small" data-action="remove-photo" data-id="' + esc(ph.id) + '">Remover foto<span class="sr-only"> ' + esc(ph.caption || '') + '</span></button></li>';
  }

  V.admin.projeto = function (id) {
    var key = id === 'novo' ? null : id;
    if (!st.draft || (st.draft.id || null) !== key) {
      if (key) {
        var found = V.findById(st.projects, key);
        if (!found) { return adminPage('projetos', 'Projeto', '<p>Projeto não encontrado.</p>'); }
        st.draft = V.clone(found);
      } else {
        st.draft = newDraft();
      }
    }
    var d = st.draft;
    var typeOpts = st.projectTypes.map(function (t) { return { value: t.id, label: t.name }; });
    var photos = d.photos.length ? '<ul class="photo-list">' + d.photos.map(photoRow).join('') + '</ul>'
      : '<p class="note">Nenhuma foto. O site mostra uma imagem ilustrativa.</p>';
    var preview = d.fields.map(function (f) { return V.fieldHtml(f, 'prev'); }).join('');
    var typeOptionsHtml = V.opts(typeOpts, d.typeId);
    return adminPage('projetos', key ? 'Editar projeto' : 'Novo projeto',
      '<form id="project-form" data-form="project" class="form-panel" novalidate>' + formError('project-error') +
      '<fieldset><legend>Dados do projeto</legend><div class="form-grid">' +
      '<div class="field span-2"><label for="p-title">Título <span aria-hidden="true">*</span></label>' +
      '<input id="p-title" name="title" required value="' + esc(d.title) + '"></div>' +
      '<div class="field"><label for="p-type">Tipo <span aria-hidden="true">*</span></label><select id="p-type" name="typeId" required>' + typeOptionsHtml + '</select></div>' +
      '<div class="field"><label for="p-status">Situação</label><select id="p-status" name="status">' + V.opts(PROJECT_STATUS_OPTS, d.status) + '</select></div>' +
      '<div class="field span-2"><label for="p-desc">Descrição</label><textarea id="p-desc" name="description" rows="4">' + esc(d.description) + '</textarea></div>' +
      '<div class="field span-2"><label for="p-loc">Local</label><input id="p-loc" name="location" value="' + esc(d.location) + '"></div>' +
      '<div class="field"><label for="p-start">Início <span aria-hidden="true">*</span></label><input type="datetime-local" id="p-start" name="startsAt" required value="' + esc(d.startsAt) + '"></div>' +
      '<div class="field"><label for="p-end">Fim <span aria-hidden="true">*</span></label><input type="datetime-local" id="p-end" name="endsAt" required value="' + esc(d.endsAt) + '"></div>' +
      '<div class="field"><label for="p-cap">Vagas <span aria-hidden="true">*</span></label><input type="number" min="1" id="p-cap" name="capacity" required value="' + esc(d.capacity) + '"></div>' +
      '<div class="field check-field"><div class="check"><input type="checkbox" id="p-signup" name="signupOpen"' + (d.signupOpen ? ' checked' : '') +
      '><label for="p-signup">Inscrições abertas</label></div></div>' +
      '</div></fieldset>' +
      '<fieldset><legend>Fotos</legend>' + photos +
      '<div class="field"><label for="photo-input">Adicionar foto (JPG ou PNG)</label>' +
      '<input type="file" id="photo-input" accept="image/*" data-change="upload-photo"></div>' +
      '<p class="hint">Prefira imagens de até 1 MB.</p></fieldset>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary">Salvar projeto</button>' +
      '<a class="btn btn-quiet" href="#/admin/projetos">Cancelar</a></div></form>' +
      '<section class="builder" aria-labelledby="builder-title"><h2 id="builder-title" class="sub-head">Formulário de inscrição</h2>' +
      '<div class="builder-grid"><div>' +
      '<p class="note">Os campos fixos (Nome, Endereço, Telefone, Cad. Único) sempre aparecem e não podem ser removidos.</p>' +
      '<ul class="ruled field-list">' + d.fields.map(function (f, i) { return fieldRow(f, i, d.fields.length); }).join('') + '</ul>' +
      '<form data-form="new-field" class="form-panel" novalidate><h3 class="sub-head">Novo campo</h3>' + formError('new-field-error') +
      textInput('label', 'Pergunta', '', 'text', ' required') +
      selectField('nf-type', 'Tipo', FIELD_TYPES, 'text', ' name="type"') +
      textInput('options', 'Opções (separe por vírgula, só para lista)', '') +
      textInput('help', 'Texto de ajuda (opcional)', '') +
      '<div class="check"><input type="checkbox" id="nf-required" name="required"><label for="nf-required">Obrigatório</label></div>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary">Adicionar campo</button></div></form>' +
      '</div><aside aria-labelledby="prev-title"><h3 id="prev-title" class="sub-head">Pré-visualização</h3>' +
      '<p class="note">Como o beneficiário verá o formulário.</p>' +
      '<div class="preview" inert>' + preview + '</div></aside></div></section>');
  };

  function slugKey(label) {
    var base = String(label).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'campo';
    var key = base, n = 2;
    while (st.draft.fields.some(function (f) { return f.key === key; })) { key = base + '_' + n; n++; }
    return key;
  }

  V.forms['new-field'] = function (form) {
    captureDraft();
    var label = String(form.elements.namedItem('label').value).trim();
    if (!label) { showError('new-field-error', 'Informe a pergunta do campo.'); return; }
    var type = form.elements.namedItem('type').value;
    var options = String(form.elements.namedItem('options').value).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (type === 'select' && !options.length) { showError('new-field-error', 'Informe ao menos uma opção para a lista.'); return; }
    st.draft.fields.push({
      key: slugKey(label), label: label, type: type, required: form.elements.namedItem('required').checked,
      help: String(form.elements.namedItem('help').value).trim(), options: type === 'select' ? options : []
    });
    V.audit('Adicionou o campo "' + label + '" ao projeto');
    V.rerender('.field-list li:last-child .btn');
    V.toast('Campo adicionado.');
  };

  function moveField(key, dir) {
    captureDraft();
    var list = st.draft.fields;
    var i = list.findIndex(function (f) { return f.key === key; });
    var j = i + dir;
    if (i < 0 || j < st.baseFields.length || j >= list.length) { return; }
    var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    V.rerender('[data-action="field-' + (dir < 0 ? 'up' : 'down') + '"][data-key="' + key + '"]');
  }
  V.actions['field-up'] = function (el) { moveField(el.getAttribute('data-key'), -1); };
  V.actions['field-down'] = function (el) { moveField(el.getAttribute('data-key'), 1); };
  V.actions['field-remove'] = function (el) {
    captureDraft();
    var key = el.getAttribute('data-key');
    var f = V.findById(st.draft.fields, key);
    st.draft.fields = st.draft.fields.filter(function (x) { return x.key !== key; });
    V.audit('Removeu o campo "' + (f ? f.label : key) + '" do projeto');
    V.rerender('.field-list li:first-child .btn, .field-list li .btn');
    V.toast('Campo removido.');
  };

  V.changes['upload-photo'] = function (input) {
    var file = input.files && input.files[0];
    if (!file) { return; }
    captureDraft();
    if (file.size > V.MAX_PHOTO_BYTES) {
      V.toast('Foto acima de 1 MB. Escolha uma imagem menor.');
      input.value = '';
      return;
    }
    st.draft.photos.push({ id: 'ph-' + Date.now(), caption: file.name });
    V.toast('Foto adicionada. Salve o projeto para publicar.');
    V.rerender('#photo-input');
  };

  V.actions['remove-photo'] = function (el) {
    captureDraft();
    var id = el.getAttribute('data-id');
    st.draft.photos = st.draft.photos.filter(function (p) { return p.id !== id; });
    V.rerender('#photo-input');
  };

  V.forms.project = function (form) {
    captureDraft();
    var d = st.draft;
    var msg = '';
    if (!String(d.title).trim()) { msg = 'Informe o título do projeto.'; }
    else if (!d.startsAt || !d.endsAt) { msg = 'Informe as datas de início e fim.'; }
    else if (d.endsAt < d.startsAt) { msg = 'O fim deve ser depois do início.'; }
    else if (!(d.capacity >= 1)) { msg = 'Informe pelo menos uma vaga.'; }
    if (msg) { showError('project-error', msg); return; }
    var saved = V.clone(d);
    if (!saved.id) {
      saved.id = 'p-' + Date.now();
      st.projects.push(saved);
      V.audit('Criou o projeto ' + saved.title);
    } else {
      var idx = st.projects.findIndex(function (p) { return p.id === saved.id; });
      st.projects[idx] = saved;
      V.audit('Editou o projeto ' + saved.title);
    }
    st.draft = null;
    location.hash = '#/admin/projetos';
    V.toast('Projeto salvo.');
    V.route();
  };

  /* ---------- inscrições ---------- */
  function signupsFiltered() {
    var f = st.filters;
    var q = String(f.q).trim().toLowerCase();
    return st.signups.filter(function (s) {
      if (f.signupProject !== 'all' && s.projectId !== f.signupProject) { return false; }
      if (f.status && s.status !== f.status) { return false; }
      if (q && String(V.answerOf(s, 'nome')).toLowerCase().indexOf(q) < 0) { return false; }
      return true;
    });
  }

  V.admin.inscricoes = function () {
    var list = signupsFiltered();
    var projOpts = [{ value: 'all', label: 'Todos os projetos' }].concat(st.projects.map(function (p) { return { value: p.id, label: p.title }; }));
    var statusOpts = [{ value: '', label: 'Todas as situações' }].concat(V.SIGNUP_STATUS.map(function (s) { return { value: s, label: s }; }));
    var rows = list.map(function (s) {
      var details = s.answers.filter(function (a) { return a.value; }).map(function (a) {
        return '<li><strong>' + esc(a.label) + ':</strong> ' + esc(a.value) + '</li>';
      }).join('');
      return '<tr>' + cell('Recebida em', esc(V.fmtStamp(s.createdAt))) +
        cell('Beneficiário', '<strong>' + esc(V.answerOf(s, 'nome')) + '</strong><details><summary>Respostas</summary><ul class="answers">' + details + '</ul></details>') +
        cell('Telefone', '<span class="phone">' + esc(V.answerOf(s, 'telefone')) + '</span>') +
        cell('Cad. Único', esc(V.maskCad(V.answerOf(s, 'cad_unico')))) +
        cell('Projeto', esc(V.projectTitle(s.projectId))) +
        cell('Situação', '<span class="chip ' + (V.STATUS_CLASS[s.status] || '') + '">' + esc(s.status) + '</span> ' +
          '<label class="sr-only" for="st-' + esc(s.id) + '">Situação de ' + esc(V.answerOf(s, 'nome')) + '</label>' +
          '<select class="row-select" id="st-' + esc(s.id) + '" data-change="signup-status" data-id="' + esc(s.id) + '">' +
          V.opts(V.SIGNUP_STATUS, s.status) + '</select>') + '</tr>';
    }).join('');
    return adminPage('inscricoes', 'Inscrições',
      '<div class="toolbar" role="search">' +
      '<div class="field"><label for="f-q">Buscar por nome</label><input type="search" id="f-q" data-input="search-signups" value="' + esc(st.filters.q) + '" autocomplete="off"></div>' +
      '<div class="field"><label for="f-status">Situação</label><select id="f-status" data-change="filter-status">' + V.opts(statusOpts, st.filters.status) + '</select></div>' +
      '<div class="field"><label for="f-project">Projeto</label><select id="f-project" data-change="filter-project">' + V.opts(projOpts, st.filters.signupProject) + '</select></div>' +
      '<button type="button" class="btn btn-quiet" data-action="export-csv">Exportar CSV</button>' +
      '<span class="count" aria-live="polite">' + list.length + (list.length === 1 ? ' inscrição' : ' inscrições') + '</span></div>' +
      '<p class="note">CadÚnico aparece parcialmente mascarado nesta lista. O CSV contém os dados completos.</p>' +
      table('Inscrições recebidas', ['Recebida em', 'Beneficiário', 'Telefone', 'Cad. Único', 'Projeto', 'Situação'],
        rows || '<tr><td colspan="6" class="empty">Nenhuma inscrição com esses filtros.</td></tr>'));
  };

  V.changes['search-signups'] = function (el) { st.filters.q = el.value; V.rerender('#f-q'); };
  V.changes['filter-status'] = function (el) { st.filters.status = el.value; V.rerender('#f-status'); };
  V.changes['filter-project'] = function (el) { st.filters.signupProject = el.value; V.rerender('#f-project'); };
  V.changes['signup-status'] = function (el) {
    var id = el.getAttribute('data-id');
    var s = V.findById(st.signups, id);
    if (!s) { return; }
    s.status = el.value;
    V.audit('Alterou a situação de uma inscrição para "' + el.value + '"');
    V.rerender('#st-' + id);
    V.toast('Situação atualizada para "' + el.value + '".');
  };

  function csvCell(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
  }
  V.actions['export-csv'] = function () {
    var head = ['Recebida em', 'Projeto', 'Situação', 'Nome', 'Telefone', 'Cad. Único completo', 'Respostas'];
    var lines = signupsFiltered().map(function (s) {
      var answers = s.answers.filter(function (a) { return a.value; }).map(function (a) { return a.label + ': ' + a.value; }).join(' | ');
      return [V.fmtStamp(s.createdAt), V.projectTitle(s.projectId), s.status, V.answerOf(s, 'nome'),
        V.answerOf(s, 'telefone'), V.answerOf(s, 'cad_unico'), answers].map(csvCell).join(';');
    });
    var csv = '﻿' + head.map(csvCell).join(';') + '\n' + lines.join('\n');
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'inscricoes-proame-exemplo.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    V.audit('Exportou CSV de inscrições');
    V.toast('CSV exportado com dados completos.');
  };

  /* ---------- ofertas ---------- */
  V.admin.ofertas = function () {
    var rows = st.offers.map(function (o) {
      return '<tr>' + cell('Recebida em', esc(V.fmtStamp(o.createdAt))) +
        cell('Nome / Empresa', '<strong>' + esc(o.name) + '</strong><br><span class="meta">' + esc(o.profile) + '</span>') +
        cell('Como colaborar', esc(o.contribution)) +
        cell('Contato', esc(o.phone) + (o.email ? '<br>' + esc(o.email) : '')) +
        cell('Observação', esc(o.observation || '—')) +
        cell('Situação', '<label class="sr-only" for="of-' + esc(o.id) + '">Situação da oferta de ' + esc(o.name) + '</label>' +
          '<select class="row-select" id="of-' + esc(o.id) + '" data-change="offer-status" data-id="' + esc(o.id) + '">' +
          V.opts(V.OFFER_STATUS, o.status) + '</select>') + '</tr>';
    }).join('');
    return adminPage('ofertas', 'Ofertas de colaboração',
      table('Ofertas recebidas', ['Recebida em', 'Nome / Empresa', 'Como colaborar', 'Contato', 'Observação', 'Situação'],
        rows || '<tr><td colspan="6" class="empty">Nenhuma oferta recebida.</td></tr>'));
  };

  V.changes['offer-status'] = function (el) {
    var id = el.getAttribute('data-id');
    var o = V.findById(st.offers, id);
    if (!o) { return; }
    o.status = el.value;
    V.audit('Alterou a situação de uma oferta para "' + el.value + '"');
    V.rerender('#of-' + id);
    V.toast('Situação atualizada para "' + el.value + '".');
  };

  /* ---------- editais ---------- */
  function saveEdital(meta) {
    st.editais.unshift({
      id: 'ed-' + Date.now(), number: meta.number, title: meta.title, date: meta.date, deadline: meta.deadline,
      status: meta.status, fileName: meta.fileName, fileSize: meta.fileSize, dataUrl: null
    });
    V.audit('Enviou o edital ' + meta.number);
    pendingEdital = null;
    V.closeDialog();
    V.toast('Edital salvo.');
    V.route();
  }

  V.admin.editais = function () {
    var rows = st.editais.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (e) {
      var toggle = e.status === 'published' ? 'Arquivar' : 'Publicar';
      return '<li class="edital-row"><div><p class="edital-num">' + esc(e.number) + '</p><h3>' + esc(e.title) + '</h3>' +
        '<p class="meta">Data: ' + V.fmtDate(e.date) + (e.deadline ? ' · Prazo: ' + V.fmtDate(e.deadline) : '') + ' · ' +
        esc(V.EDITAL_STATUS[e.status] || e.status) + (e.dataUrl ? '' : ' · exemplo') + '</p></div>' +
        '<div class="row-actions"><button type="button" class="btn btn-quiet btn-small" data-action="edital-toggle" data-id="' + esc(e.id) + '">' + toggle +
        '<span class="sr-only"> edital ' + esc(e.number) + '</span></button>' +
        '<button type="button" class="btn btn-danger btn-small" data-action="edital-delete" data-id="' + esc(e.id) + '">Excluir<span class="sr-only"> edital ' + esc(e.number) + '</span></button></div></li>';
    }).join('');
    return adminPage('editais', 'Editais',
      '<p class="note">Envie PDFs. O arquivo guardado é o mesmo que foi enviado. Arquivos acima de 2 MB pedem confirmação antes de salvar.</p>' +
      '<form data-form="edital" class="form-panel" novalidate><h2 class="sub-head">Novo edital</h2>' + formError('edital-error') +
      '<div class="form-grid"><div class="field span-2"><label for="ed-file">Arquivo PDF <span aria-hidden="true">*</span></label>' +
      '<input type="file" id="ed-file" name="file" accept="application/pdf,.pdf" required></div>' +
      textInput('number', 'Número', '', 'text', ' required placeholder="Ex.: 004/2026"') +
      textInput('title', 'Título', '', 'text', ' required') +
      textInput('date', 'Data de publicação', '', 'date', ' required') +
      textInput('deadline', 'Prazo', '', 'date') +
      selectField('ed-status', 'Situação', EDITAL_STATUS_OPTS, 'published', ' name="status"') +
      '</div><div class="form-actions"><button type="submit" class="btn btn-primary">Salvar edital</button></div></form>' +
      '<h2 class="sub-head">Editais cadastrados</h2>' + (rows ? '<ul class="ruled">' + rows + '</ul>' : '<p>Nenhum edital.</p>'));
  };

  V.forms.edital = function (form) {
    var file = form.elements.namedItem('file').files[0];
    var g = function (n) { return String(form.elements.namedItem(n).value).trim(); };
    if (!file) { showError('edital-error', 'Escolha o arquivo PDF.'); return; }
    if (!/\.pdf$/i.test(file.name)) { showError('edital-error', 'O arquivo precisa ser um PDF.'); return; }
    if (!g('number') || !g('title') || !g('date')) { showError('edital-error', 'Preencha número, título e data de publicação.'); return; }
    var meta = { number: g('number'), title: g('title'), date: g('date'), deadline: g('deadline'), status: g('status') || 'published', fileName: file.name, fileSize: file.size };
    if (file.size > V.MAX_PDF_BYTES) {
      pendingEdital = meta;
      V.openDialog('Arquivo acima de 2 MB', '<p>O PDF tem ' + (file.size / 1048576).toFixed(1).replace('.', ',') +
        ' MB. Confirma o envio mesmo assim?</p><div class="dlg-actions"><button type="button" class="btn btn-quiet" data-action="dlg-close">Cancelar</button>' +
        '<button type="button" class="btn btn-primary" data-action="edital-large-confirm">Salvar edital</button></div>', '.btn-quiet');
      return;
    }
    saveEdital(meta);
  };

  V.actions['edital-large-confirm'] = function () { if (pendingEdital) { saveEdital(pendingEdital); } };

  V.actions['edital-toggle'] = function (el) {
    var e = V.findById(st.editais, el.getAttribute('data-id'));
    if (!e) { return; }
    e.status = e.status === 'published' ? 'archived' : 'published';
    V.audit((e.status === 'published' ? 'Publicou' : 'Arquivou') + ' o edital ' + e.number);
    V.rerender('[data-action="edital-toggle"][data-id="' + e.id + '"]');
    V.toast(e.status === 'published' ? 'Edital publicado.' : 'Edital arquivado.');
  };

  V.actions['edital-delete'] = function (el) {
    var e = V.findById(st.editais, el.getAttribute('data-id'));
    if (!e) { return; }
    V.openDialog('Excluir edital ' + e.number + '?', '<p>O edital sai da Transparência e não pode ser recuperado.</p>' +
      '<div class="dlg-actions"><button type="button" class="btn btn-quiet" data-action="dlg-close">Cancelar</button>' +
      '<button type="button" class="btn btn-danger" data-action="edital-delete-confirm" data-id="' + esc(e.id) + '">Excluir</button></div>', '.btn-quiet');
  };

  V.actions['edital-delete-confirm'] = function (el) {
    var id = el.getAttribute('data-id');
    var e = V.findById(st.editais, id);
    st.editais = st.editais.filter(function (x) { return x.id !== id; });
    V.closeDialog();
    V.audit('Excluiu o edital ' + (e ? e.number : id));
    V.toast('Edital excluído.');
    V.route();
  };

  /* ---------- administradores ---------- */
  function roleLabel(a) {
    if (a.role !== 'Root') { return 'Admin'; }
    return a.rootUntil ? 'Root temporário até ' + V.fmtDate(a.rootUntil) : 'Root';
  }

  V.admin.administradores = function () {
    var me = V.currentAdmin();
    var rows = st.admins.map(function (a) {
      var actions = a.id === me.id
        ? '<span class="note">Sua conta</span>'
        : '<button type="button" class="btn btn-quiet btn-small" data-action="admin-toggle" data-id="' + esc(a.id) + '">' +
          (a.active ? 'Desativar' : 'Reativar') + '<span class="sr-only"> ' + esc(a.name) + '</span></button>' +
          (a.role !== 'Root' && a.active
            ? ' <button type="button" class="btn btn-quiet btn-small" data-action="admin-promote-open" data-id="' + esc(a.id) + '">Tornar Root temporário<span class="sr-only"> ' + esc(a.name) + '</span></button>'
            : '');
      return '<tr>' + cell('Nome', '<strong>' + esc(a.name) + '</strong>') + cell('Papel', esc(roleLabel(a))) +
        cell('Verificação em duas etapas', a.twoFactor ? 'Ativa' : 'Desativada') + cell('Último acesso', esc(V.fmtStamp(a.lastAccess))) +
        cell('Situação', a.active ? 'Ativo' : 'Desativado') + cell('Ações', actions) + '</tr>';
    }).join('');
    var warn = V.activeRootCount() < 2 ? alertBox('warn', 'Atenção: há menos de 2 Roots ativos. Promova outro administrador antes de sair.') : '';
    return adminPage('administradores', 'Administradores',
      warn + '<p class="note">Administradores são desativados, nunca apagados, para preservar o histórico.</p>' +
      table('Administradores da área admin', ['Nome', 'Papel', 'Verificação em duas etapas', 'Último acesso', 'Situação', 'Ações'], rows));
  };

  V.actions['admin-toggle'] = function (el) {
    var a = V.findById(st.admins, el.getAttribute('data-id'));
    if (!a) { return; }
    if (a.active && a.role === 'Root' && V.activeRootCount() <= 1) {
      V.toast('Não é possível desativar o último Root ativo.');
      return;
    }
    a.active = !a.active;
    V.audit((a.active ? 'Reativou' : 'Desativou') + ' o administrador ' + a.name);
    V.rerender('[data-action="admin-toggle"][data-id="' + a.id + '"]');
    V.toast(a.active ? 'Administrador reativado.' : 'Administrador desativado.');
  };

  V.actions['admin-promote-open'] = function (el) {
    var a = V.findById(st.admins, el.getAttribute('data-id'));
    if (!a) { return; }
    V.openDialog('Tornar Root temporário', '<form data-form="promote" data-id="' + esc(a.id) + '" novalidate>' +
      '<p>' + esc(a.name) + ' passa a ser Root até a data informada. Depois disso, a função volta a Admin.</p>' +
      textInput('fim', 'Data de fim', '', 'date', ' required') + formError('promote-error') +
      '<div class="dlg-actions"><button type="button" class="btn btn-quiet" data-action="dlg-close">Cancelar</button>' +
      '<button type="submit" class="btn btn-primary">Promover</button></div></form>', '#a-fim');
  };

  V.forms.promote = function (form) {
    var a = V.findById(st.admins, form.getAttribute('data-id'));
    var fim = String(form.elements.namedItem('fim').value).trim();
    if (!a) { return; }
    if (!fim || fim <= V.today()) { showError('promote-error', 'Informe uma data futura.'); return; }
    a.role = 'Root';
    a.rootUntil = fim;
    V.audit('Tornou ' + a.name + ' Root temporário até ' + V.fmtDate(fim));
    V.closeDialog();
    V.toast('Root temporário definido.');
    V.route();
  };

  /* ---------- configurações (Root only) ---------- */
  V.admin.configuracoes = function () {
    var me = V.currentAdmin();
    if (me.role !== 'Root') {
      return adminPage('configuracoes', 'Configurações', alertBox('warn', 'Apenas Root pode alterar as configurações.'));
    }
    var s = st.smtp;
    var n = st.notifications;
    var history = st.termHistory.slice().reverse().map(function (t) {
      var current = t.version === st.consentVersion ? ' <strong>(atual)</strong>' : '';
      return '<li>Versão ' + esc(t.version) + current + ' · ' + V.fmtDate(t.date) + ' · ' + esc(t.note) + '</li>';
    }).join('');
    var check = function (id, name, label, checked) {
      return '<div class="check"><input type="checkbox" id="' + id + '" name="' + name + '"' + (checked ? ' checked' : '') + '><label for="' + id + '">' + esc(label) + '</label></div>';
    };
    return adminPage('configuracoes', 'Configurações',
      '<form data-form="smtp" class="form-panel" novalidate><h2 class="sub-head">E-mail (SMTP)</h2>' +
      '<div class="form-grid">' + textInput('host', 'Servidor', s.host) + textInput('port', 'Porta', s.port, 'number') +
      textInput('user', 'Usuário', s.user) + textInput('from', 'Remetente', s.from) +
      '<div class="field span-2"><label for="a-password">Senha</label><input id="a-password" name="password" type="password" autocomplete="new-password" placeholder="' + (s.passwordSet ? '•••• definida' : 'Não definida') + '">' +
      '<p class="hint">Gravada no servidor e nunca exibida. Deixe em branco para manter a senha atual.</p></div></div>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary">Salvar e-mail</button>' +
      '<button type="button" class="btn btn-quiet" data-action="smtp-test">Enviar e-mail de teste</button></div></form>' +
      '<form data-form="term" class="form-panel" novalidate><h2 class="sub-head">Termo de consentimento LGPD</h2>' +
      textArea('term', 'Texto do termo', st.consentText, 5) +
      '<p class="note">Cada edição cria uma nova versão. Inscrições antigas continuam ligadas à versão em que foram aceitas.</p>' +
      '<details><summary>Histórico de versões</summary><ul class="ruled">' + history + '</ul></details>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary">Salvar nova versão</button></div></form>' +
      '<form data-form="notif" class="form-panel" novalidate><h2 class="sub-head">Notificações por e-mail</h2>' +
      check('nt-signup', 'newSignup', 'Nova inscrição', n.newSignup) +
      check('nt-offer', 'newOffer', 'Nova oferta de colaboração', n.newOffer) +
      check('nt-edital', 'newEdital', 'Novo edital publicado', n.newEdital) +
      '<div class="check"><input type="checkbox" id="nt-security" checked disabled><label for="nt-security">Alertas de segurança (sempre enviados)</label></div>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary">Salvar preferências</button></div></form>' +
      '<div class="callout"><h2 class="sub-head">Identidade visual: em breve</h2>' +
      '<p>Paleta e logotipo serão editáveis aqui na versão final.</p></div>');
  };

  V.forms.smtp = function (form) {
    var g = function (n) { return String(form.elements.namedItem(n).value).trim(); };
    st.smtp.host = g('host');
    st.smtp.port = Number(g('port')) || st.smtp.port;
    st.smtp.user = g('user');
    st.smtp.from = g('from');
    if (g('password')) { st.smtp.passwordSet = true; }
    V.audit('Alterou as configurações de e-mail');
    V.toast('Configurações de e-mail salvas.');
    V.route();
  };

  V.actions['smtp-test'] = function () {
    V.audit('Enviou e-mail de teste');
    V.toast('E-mail de teste enviado (simulado).');
  };

  V.forms.term = function (form) {
    var text = String(form.elements.namedItem('term').value).trim();
    if (!text) { V.toast('O texto do termo não pode ficar vazio.'); return; }
    if (text !== st.consentText) {
      st.consentVersion += 1;
      st.termHistory.push({ version: st.consentVersion, date: V.today(), note: 'Edição do termo pelo administrador.' });
      st.consentText = text;
      V.audit('Editou o termo LGPD (versão ' + st.consentVersion + ')');
    }
    V.toast('Nova versão do termo salva.');
    V.route();
  };

  V.forms.notif = function (form) {
    st.notifications.newSignup = form.elements.namedItem('newSignup').checked;
    st.notifications.newOffer = form.elements.namedItem('newOffer').checked;
    st.notifications.newEdital = form.elements.namedItem('newEdital').checked;
    V.audit('Alterou as notificações por e-mail');
    V.toast('Preferências salvas.');
  };

  /* ---------- auditoria, ajuda, novidades ---------- */
  V.admin.auditoria = function () {
    var rows = st.auditLog.map(function (e) {
      return '<tr>' + cell('Quando', esc(V.fmtStamp(e.at))) + cell('Quem', esc(e.actor)) + cell('O que aconteceu', esc(e.event)) + '</tr>';
    }).join('');
    return adminPage('auditoria', 'Auditoria',
      '<p class="note">Registro das ações sensíveis. Os eventos não podem ser editados nem apagados.</p>' +
      table('Eventos registrados', ['Quando', 'Quem', 'O que aconteceu'], rows));
  };

  V.admin.ajuda = function () {
    var faq = st.helpTopics.map(function (t) {
      return '<details class="faq"><summary>' + esc(t.q) + '</summary><p>' + esc(t.a) + '</p></details>';
    }).join('');
    return adminPage('ajuda', 'Central de ajuda',
      '<p class="note">Respostas para as situações mais comuns. O conteúdo é atualizado a cada versão.</p><div class="faq-list">' + faq + '</div>');
  };

  V.admin.novidades = function () {
    var body = st.releases.map(function (r) {
      return '<article class="release"><h2 class="sub-head">Versão ' + esc(r.version) + '</h2><p class="meta">' + V.fmtDate(r.date) + '</p>' +
        '<ul class="ruled">' + r.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></article>';
    }).join('');
    return adminPage('novidades', 'Novidades', body);
  };
})();
