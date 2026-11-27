/* PROAME prototype - application logic. Plain browser JavaScript (no modules, no build). */
(function () {
  'use strict';

  var STORAGE_KEY = 'proame-proto';
  var SEED = window.PROAME_SEED;
  var MAX_PDF_BYTES = 2 * 1024 * 1024;
  var MAX_PHOTO_BYTES = 1024 * 1024;
  var BASE_KEYS = ['nome', 'endereco', 'telefone', 'cad_unico'];
  var PALETTE = ['#4c6707', '#386663', '#8a5100', '#6750a4', '#ba1a1a', '#00639b'];
  var FIELD_TYPES = [
    { value: 'text', label: 'Texto curto' },
    { value: 'textarea', label: 'Texto longo' },
    { value: 'number', label: 'Número' },
    { value: 'phone', label: 'Telefone' },
    { value: 'email', label: 'E-mail' },
    { value: 'date', label: 'Data' },
    { value: 'time', label: 'Hora' },
    { value: 'datetime-range', label: 'Data/hora início e fim' },
    { value: 'select', label: 'Seleção (lista)' },
    { value: 'checkbox', label: 'Sim/não (caixa de seleção)' }
  ];
  var PROJECT_STATUS = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'published', label: 'Publicado' },
    { value: 'closed', label: 'Encerrado' }
  ];
  var PROJECT_STATUS_LABEL = { draft: 'Rascunho', published: 'Publicado', closed: 'Encerrado' };
  var EDITAL_STATUS = { draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado' };
  var SIGNUP_STATUS = ['Nova', 'Confirmada', 'Lista de espera', 'Recusada'];
  var OFFER_STATUS = ['Nova', 'Em contato', 'Concluída'];
  var PROFILES = ['Empresa', 'Professor', 'Monitor', 'Segurança', 'Outro'];
  var CONTRIBUTIONS = ['Financeiramente', 'Cesta básica', 'Mão de obra / Serviço', 'Formação'];
  var COLLAB_FIELDS = [
    { key: 'nome', label: 'Nome / Empresa', type: 'text', required: true, help: '', options: [] },
    { key: 'perfil', label: 'Perfil', type: 'select', required: true, help: '', options: PROFILES },
    { key: 'colaboracao', label: 'Como deseja colaborar', type: 'select', required: true, help: '', options: CONTRIBUTIONS },
    { key: 'telefone', label: 'Telefone', type: 'phone', required: true, help: '', options: [] },
    { key: 'email', label: 'E-mail', type: 'email', required: false, help: '', options: [] },
    { key: 'observacao', label: 'Observação', type: 'textarea', required: false, help: '', options: [] }
  ];

  var state = loadState();
  var currentPath = '';
  var navOpen = false;
  var draft = null;          // project being edited in the admin (unsaved)
  var flash = null;          // one-shot message consumed by the next render
  var filters = { type: 'all', date: 'all', cover: 'all' };
  var signupProject = 'all';

  /* ---------- state & utilities ---------- */

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.pages) {
          // Saves made before a seed key existed get that key from the seed (no data loss).
          Object.keys(SEED).forEach(function (key) {
            if (parsed[key] === undefined) { parsed[key] = clone(SEED[key]); }
          });
          return parsed;
        }
      }
    } catch (err) {
      // Corrupted or blocked storage: fall back to the seed data.
    }
    return clone(SEED);
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      toast('Não foi possível salvar: o armazenamento do navegador está cheio.');
      return false;
    }
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function slugify(text) {
    return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { return list[i]; }
    }
    return null;
  }

  function typeOf(id) {
    return findById(state.projectTypes, id) || { name: 'Sem tipo', color: '#5d6052' };
  }

  function projectTitle(id) {
    var p = findById(state.projects, id);
    return p ? p.title : '—';
  }

  function fmtDate(value) {
    var parts = String(value || '').slice(0, 10).split('-');
    return parts.length === 3 && parts[0].length === 4 ? parts[2] + '/' + parts[1] + '/' + parts[0] : '—';
  }

  function fmtDT(value) {
    if (!value) { return '—'; }
    var time = String(value).slice(11, 16);
    return fmtDate(value) + (time ? ' às ' + time : '');
  }

  function fmtStamp(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
  }

  function daysFromNow(value) {
    var d = new Date(String(value).slice(0, 10) + 'T00:00:00');
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((d - today) / 86400000);
  }

  function opts(list, selected, placeholder) {
    var html = placeholder ? '<option value="">' + esc(placeholder) + '</option>' : '';
    list.forEach(function (o) {
      var value = typeof o === 'string' ? o : o.value;
      var label = typeof o === 'string' ? o : o.label;
      html += '<option value="' + esc(value) + '"' + (String(value) === String(selected) ? ' selected' : '') + '>' + esc(label) + '</option>';
    });
    return html;
  }

  function toast(message) {
    var el = document.getElementById('toast');
    if (!el) { return; }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  /* Palette switcher: A = original brand, B = logo-derived (default), C = alternative. */
  function applyPalette(key) {
    if (['a', 'b', 'c'].indexOf(key) < 0) { return; }
    document.documentElement.setAttribute('data-palette', key);
    try { window.localStorage.setItem('proame-palette', key); } catch (err) {
      // Blocked storage: the choice still applies for this page view.
    }
    document.querySelectorAll('[data-action="palette"]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === key));
    });
  }

  function setHash(path) {
    if (window.location.hash === '#' + path) {
      route();
    } else {
      window.location.hash = '#' + path;
    }
  }

  function triggerDownload(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------- contact links (shared by footer, contact block, admin "Testar") ---------- */

  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function withDdi(v) { var d = digits(v); return d.length <= 11 ? '55' + d : d; }

  // wa.me opens the WhatsApp app on phones and WhatsApp Web (new tab) on desktop.
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

  function waLink() { return LINKS.whatsapp(state.contact.whatsapp); }

  function fmtWhatsapp(v) {
    var d = withDdi(v);
    var m = d.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
    return m ? '+' + m[1] + ' (' + m[2] + ') ' + m[3] + '-' + m[4] : '+' + d;
  }

  var ICONS = {
    phone: 'M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z',
    whatsapp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.2z',
    email: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
    instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
    youtube: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3-5.2 3z',
    copy: 'M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z',
    open: 'M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7z'
  };

  function icon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + ICONS[name] + '"/></svg>';
  }

  // One entry per public contact channel; label = accessible name, text = what is shown and copied.
  function contactChannels() {
    var c = state.contact;
    var list = [
      { kind: 'phone', label: 'Telefone', text: c.phone, href: LINKS.phone(c.phone), copy: c.phone },
      { kind: 'whatsapp', label: 'WhatsApp', text: fmtWhatsapp(c.whatsapp), href: LINKS.whatsapp(c.whatsapp), copy: fmtWhatsapp(c.whatsapp), external: true },
      { kind: 'email', label: 'E-mail', text: c.email, href: LINKS.email(c.email), copy: c.email },
      { kind: 'instagram', label: 'Instagram', text: c.instagram, href: LINKS.instagram(c.instagram), copy: LINKS.instagram(c.instagram), external: true },
      { kind: 'youtube', label: 'YouTube', text: c.youtube, href: LINKS.youtube(c.youtube), copy: LINKS.youtube(c.youtube), external: true }
    ];
    return list.filter(function (ch) { return String(ch.text || '').trim(); });
  }

  function contactList() {
    return '<ul class="contact-list">' + contactChannels().map(function (ch) {
      return '<li><a class="contact-link" href="' + esc(ch.href) + '"' +
        (ch.external ? ' target="_blank" rel="noopener"' : '') +
        ' aria-label="' + esc(ch.label + ': ' + ch.text) + (ch.external ? ' (abre em nova aba)' : '') + '">' +
        icon(ch.kind) + '<span><span class="contact-kind">' + esc(ch.label) + '</span>' + esc(ch.text) + '</span></a>' +
        '<button type="button" class="icon-btn" data-action="copy" data-copy="' + esc(ch.copy) + '" data-label="' + esc(ch.label) + '"' +
        ' aria-label="Copiar ' + esc(ch.label) + '" title="Copiar">' + icon('copy') + '</button></li>';
    }).join('') + '</ul>';
  }

  function copyText(text, label) {
    var done = function () { toast(label + ' copiado.'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { if (legacyCopy(text)) { done(); } });
    } else if (legacyCopy(text)) { done(); }
  }

  function legacyCopy(text) {
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
    if (!ok) { toast('Não foi possível copiar. Selecione o texto manualmente.'); }
    return ok;
  }

  function openLink(url) {
    var a = document.createElement('a');
    a.href = url;
    if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; }
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function publishedProjects() {
    return state.projects
      .filter(function (p) { return p.status === 'published'; })
      .sort(function (a, b) { return a.startsAt < b.startsAt ? -1 : a.startsAt > b.startsAt ? 1 : 0; });
  }

  function activeServices() {
    return state.services
      .filter(function (s) { return s.active; })
      .sort(function (a, b) { return a.sort - b.sort; });
  }

  function countSignups(projectId) {
    return state.signups.filter(function (s) { return s.projectId === projectId; }).length;
  }

  function answer(signup, key) {
    var found = signup.answers.filter(function (a) { return a.key === key; })[0];
    return found ? found.value : '';
  }

  function maskCad(value) {
    value = String(value || '');
    return value ? '•••' + value.slice(-3) : '—';
  }

  /* Base fields are always present and always first; custom fields keep their order. */
  function ensureBase(fields) {
    var base = clone(state.baseFields).map(function (f) { f.locked = true; return f; });
    var custom = (fields || []).filter(function (f) {
      return !f.locked && BASE_KEYS.indexOf(f.key) === -1;
    });
    return base.concat(custom);
  }

  function newDraft() {
    return {
      id: null,
      typeId: state.projectTypes[0] ? state.projectTypes[0].id : '',
      title: '',
      description: '',
      location: '',
      startsAt: '',
      endsAt: '',
      capacity: 20,
      signupOpen: true,
      status: 'draft',
      photos: [],
      fields: ensureBase([])
    };
  }

  /* ---------- planning mocks: audit, roles, dialogs, help ---------- */

  function appendAudit(event) {
    state.auditLog.unshift({ at: new Date().toISOString(), actor: currentActor().name, event: event });
    state.auditLog = state.auditLog.slice(0, 200);
  }

  // Prototype: the signed-in admin is the first Root in the seed.
  function currentActor() {
    return findById(state.admins, 'adm-1') || state.admins[0];
  }

  function isActiveRoot(a, today) {
    if (!a.active || a.role !== 'Root') { return false; }
    return !a.rootUntil || a.rootUntil >= today;
  }

  function activeRootCount() {
    var today = new Date().toISOString().slice(0, 10);
    return state.admins.filter(function (a) { return isActiveRoot(a, today); }).length;
  }

  var dialogReturnFocus = null;

  /* MD3 dialog with an overlay. Native alert/confirm are not used anywhere in the prototype. */
  function openDialog(title, bodyHtml) {
    closeDialog(true);
    dialogReturnFocus = document.activeElement;
    var root = document.getElementById('dialog-root');
    root.innerHTML = '<div class="dlg-overlay" data-action="dlg-close"></div>' +
      '<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-title">' +
      '<h2 id="dlg-title">' + esc(title) + '</h2><div class="dlg-body">' + bodyHtml + '</div>' +
      '<div class="dlg-actions"><button type="button" class="btn btn-ghost" data-action="dlg-close">Fechar</button></div></div>';
    root.hidden = false;
    var first = root.querySelector('.dlg button, .dlg input, .dlg a');
    if (first) { first.focus(); }
  }

  function closeDialog(silent) {
    var root = document.getElementById('dialog-root');
    if (!root || root.hidden) { return; }
    root.hidden = true;
    root.innerHTML = '';
    if (!silent && dialogReturnFocus && dialogReturnFocus.focus) { dialogReturnFocus.focus(); }
    dialogReturnFocus = null;
  }

  function helpButton(label) {
    return '<button type="button" class="icon-btn help-btn" data-action="page-help" title="Ajuda desta página">?<span class="sr-only"> ' +
      esc(label) + '</span></button>';
  }

  /* ---------- shared UI pieces ---------- */

  function alertBox(kind, message) {
    return '<div class="alert ' + kind + '" role="status">' + esc(message) + '</div>';
  }

  function media(photo, cls) {
    var extra = cls ? ' ' + cls : '';
    if (photo && photo.dataUrl) {
      return '<img class="media' + extra + '" src="' + esc(photo.dataUrl) + '" alt="' + esc(photo.caption || 'Foto do projeto') + '" loading="lazy">';
    }
    var color = photo && photo.color ? photo.color : '#4c6707';
    var caption = photo && photo.caption ? photo.caption : '';
    var label = caption ? 'Imagem ilustrativa: ' + caption : 'Imagem ilustrativa';
    return '<div class="media placeholder' + extra + '" style="--ph:' + esc(color) + '" role="img" aria-label="' + esc(label) + '"><span>' + esc(caption) + '</span></div>';
  }

  function paragraphs(text) {
    return String(text || '').split(/\n\s*\n/)
      .filter(function (t) { return t.trim(); })
      .map(function (t) { return '<p>' + esc(t.trim()) + '</p>'; })
      .join('');
  }

  function projectCard(p) {
    var t = typeOf(p.typeId);
    return '<a class="card project-card" href="#/projeto/' + esc(p.id) + '">' +
      media(p.photos[0] || null, '') +
      '<div class="card-body"><span class="tag" style="background:' + esc(t.color) + '">' + esc(t.name) + '</span>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p class="meta">' + esc(fmtDT(p.startsAt)) + '</p>' +
      '<p class="meta">' + esc(p.location) + '</p></div></a>';
  }

  function serviceGrid(list) {
    if (!list.length) { return '<p>Nenhum serviço cadastrado.</p>'; }
    return '<div class="grid cols-3">' + list.map(function (s) {
      return '<article class="card service"><span class="icon-dot" aria-hidden="true">' + esc(s.title.charAt(0)) +
        '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.description) + '</p></article>';
    }).join('') + '</div>';
  }

  function contactBlock() {
    var c = state.contact;
    return '<section class="card" aria-labelledby="contato-titulo"><h2 id="contato-titulo">Entre em contato</h2>' +
      '<dl class="info"><dt>Endereço</dt><dd>' + esc(c.address) + '</dd></dl>' +
      contactList() + '</section>';
  }

  function adminPage(title, body) {
    return '<section class="section container"><div class="page-head"><h1>' + esc(title) + '</h1>' + helpButton(title) +
      '</div>' + body + '</section>';
  }

  function notFound() {
    return '<section class="section container"><h1>Página não encontrada</h1>' +
      '<p><a href="#/home">Voltar ao início</a></p></section>';
  }

  /* ---------- form rendering (shared by public forms and the builder preview) ---------- */

  function fieldHtml(f, prefix) {
    var id = prefix + '-' + f.key;
    var name = 'f_' + f.key;
    var req = f.required ? ' required' : '';
    var star = f.required ? ' <span aria-hidden="true">*</span>' : '';
    var help = f.help ? '<p class="help" id="' + id + '-help">' + esc(f.help) + '</p>' : '';
    var err = '<p class="field-error" id="' + id + '-error" hidden></p>';
    var describe = f.help ? ' aria-describedby="' + id + '-help"' : '';

    if (f.type === 'checkbox') {
      return '<div class="field"><label class="check" for="' + id + '"><input type="checkbox" id="' + id +
        '" name="' + name + '"' + req + describe + '><span>' + esc(f.label) + star + '</span></label>' + help + err + '</div>';
    }
    if (f.type === 'datetime-range') {
      return '<fieldset class="field range-field"><legend>' + esc(f.label) + star + '</legend><div class="range">' +
        '<div><label for="' + id + '-start">Início</label><input type="datetime-local" id="' + id + '-start" name="' + name + '_start"' + req + describe + '></div>' +
        '<div><label for="' + id + '-end">Fim</label><input type="datetime-local" id="' + id + '-end" name="' + name + '_end"' + req + '></div>' +
        '</div>' + help + err + '</fieldset>';
    }

    var tip = f.help ? '<button type="button" class="info-btn" data-action="field-help" aria-expanded="false" aria-controls="' + id +
      '-tip" aria-label="Mais sobre ' + esc(f.label) + '">i</button><span class="tip" id="' + id + '-tip" role="tooltip" hidden>' +
      esc(f.help) + '</span>' : '';
    var label = '<label for="' + id + '">' + esc(f.label) + star + '</label>' + tip;
    var control;
    if (f.type === 'textarea') {
      control = '<textarea id="' + id + '" name="' + name + '" rows="4"' + req + describe + '></textarea>';
    } else if (f.type === 'select') {
      control = '<select id="' + id + '" name="' + name + '"' + req + describe + '>' +
        opts(f.options || [], '', 'Selecione…') + '</select>';
    } else {
      var typeAttr = { number: 'number', phone: 'tel', email: 'email', date: 'date', time: 'time' }[f.type] || 'text';
      var extra = typeAttr === 'number' ? ' inputmode="numeric"' : (typeAttr === 'tel' ? ' autocomplete="tel"' : '');
      control = '<input type="' + typeAttr + '" id="' + id + '" name="' + name + '"' + extra + req + describe + '>';
    }
    return '<div class="field">' + label + control + help + err + '</div>';
  }

  function fieldsHtml(fields, prefix) {
    return fields.map(function (f) { return fieldHtml(f, prefix); }).join('');
  }

  function consentHtml(prefix) {
    var id = prefix + '-consent';
    return '<div class="field"><label class="check" for="' + id + '"><input type="checkbox" id="' + id +
      '" name="consent" required aria-describedby="' + id + '-error"><span>' + esc(state.consentText) +
      ' <span aria-hidden="true">*</span></span></label>' +
      '<p class="term-line"><button type="button" class="link-btn" data-action="read-term">ler termo (versão ' +
      consentVersion() + ')</button></p>' +
      '<p class="field-error" id="' + id + '-error" hidden></p></div>';
  }

  function consentVersion() {
    return state.consentVersion || SEED.consentVersion;
  }

  /* Placeholder only: the real Cloudflare Turnstile widget is wired in the back end. */
  function turnstileHtml() {
    return '<div class="turnstile" role="group" aria-label="Verificação anti-robô"><span class="turnstile-mark" aria-hidden="true"></span>' +
      '<span>Verificação anti-robô — Cloudflare Turnstile</span></div>';
  }

  /* Reads and validates a rendered form. Returns {ok, answers, firstBad}. */
  function collectAnswers(form, fields, prefix) {
    var answers = [];
    var ok = true;
    var firstBad = null;

    function report(id, target, message) {
      var err = document.getElementById(id + '-error');
      if (err) {
        err.textContent = message || '';
        err.hidden = !message;
      }
      if (target) {
        target.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (message && err) { target.setAttribute('aria-describedby', err.id); }
      }
      if (message) {
        ok = false;
        if (!firstBad) { firstBad = target; }
      }
    }

    fields.forEach(function (f) {
      var id = prefix + '-' + f.key;
      var name = 'f_' + f.key;
      var value = '';
      var message = '';
      var target = null;

      if (f.type === 'datetime-range') {
        var startEl = form.elements.namedItem(name + '_start');
        var endEl = form.elements.namedItem(name + '_end');
        var s = startEl.value;
        var e = endEl.value;
        target = startEl;
        if (f.required && (!s || !e)) { message = 'Informe o início e o fim.'; }
        else if (s && e && e < s) { message = 'O fim deve ser posterior ao início.'; }
        value = [s, e].filter(Boolean).map(fmtDT).join(' até ');
      } else if (f.type === 'checkbox') {
        var cb = form.elements.namedItem(name);
        target = cb;
        value = cb.checked ? 'Sim' : 'Não';
        if (f.required && !cb.checked) { message = 'Marque esta opção para continuar.'; }
      } else {
        var el = form.elements.namedItem(name);
        target = el;
        value = el.value.trim();
        if (f.required && !value) { message = 'Campo obrigatório.'; }
        else if (value && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { message = 'Informe um e-mail válido.'; }
        else if (value && f.type === 'phone' && value.replace(/\D/g, '').length < 10) { message = 'Informe o telefone com DDD.'; }
      }

      report(id, target, message);
      answers.push({ key: f.key, label: f.label, value: value });
    });

    var consent = form.elements.namedItem('consent');
    report(prefix + '-consent', consent, consent.checked ? '' : 'Para enviar, é preciso concordar com o uso dos dados.');

    return { ok: ok, answers: answers, firstBad: firstBad };
  }

  /* ---------- routing ---------- */

  function parsePath() {
    return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  }

  function route() {
    var parts = parsePath();
    if (!parts.length) { parts = ['home']; }
    var isAdmin = parts[0] === 'admin';

    if (isAdmin && parts[1] !== 'login' && !state.session) {
      setHash('/admin/login');
      return;
    }

    if (!(isAdmin && parts[1] === 'projeto')) { draft = null; }

    var path = '/' + parts.join('/');
    var sameRoute = path === currentPath;
    currentPath = path;
    navOpen = false;

    var main = isAdmin ? adminRoute(parts) : publicRoute(parts);
    document.getElementById('app').innerHTML = header(isAdmin) +
      '<main id="main" tabindex="-1">' + main + '</main>' + footer();

    if (isAdmin && parts[1] === 'projeto') { renderPreview(); }
    if (!sameRoute) { window.scrollTo(0, 0); }
  }

  function publicRoute(parts) {
    switch (parts[0]) {
      case 'home': return pageHome();
      case 'quem-somos': return pageQuemSomos();
      case 'servicos': return pageServicos();
      case 'projetos': return pageProjetos();
      case 'projeto': return pageProjeto(parts[1]);
      case 'colaborar': return pageColaborar();
      case 'transparencia': return pageTransparencia();
      default: return notFound();
    }
  }

  function adminRoute(parts) {
    if (parts[1] === 'login') { return pageLogin(); }
    switch (parts[1] || '') {
      case '': return pageDashboard();
      case 'paginas': return pagePages();
      case 'projetos': return pageAdminProjects();
      case 'projeto': return pageAdminProject(parts[2] || 'novo');
      case 'inscricoes': return pageSignups();
      case 'ofertas': return pageOffers();
      case 'editais': return pageAdminEditais();
      case 'administradores': return pageAdministradores();
      case 'configuracoes': return pageConfiguracoes();
      case 'auditoria': return pageAuditoria();
      case 'ajuda': return pageAjuda();
      case 'novidades': return pageNovidades();
      default: return notFound();
    }
  }

  function navLink(path, label) {
    return '<a href="#' + path + '"' + (currentPath === path ? ' aria-current="page"' : '') + '>' + esc(label) + '</a>';
  }

  /* Pre-sized logo files (1x/2x/3x, see tools/logo-gen.mjs). Narrow screens may use the symbol. */
  function logoSrcset(base) {
    return [1, 2, 3].map(function (n) { return base + '@' + n + 'x.png ' + n + 'x'; }).join(', ');
  }

  /* base = logoBase (coloured wordmark, light surfaces) or logoLightBase (white wordmark, dark surfaces). */
  function logoPicture(imgClass, alt, useSymbolOnNarrow, base, wrapClass) {
    var img = '<img class="' + imgClass + '" src="' + base + '@2x.png" srcset="' +
      logoSrcset(base) + '" alt="' + esc(alt) + '" width="107" height="40">';
    var source = useSymbolOnNarrow ? '<source media="(max-width: 599px)" srcset="' + logoSrcset(SEED.org.symbolBase) + '">' : '';
    return '<picture class="logo-pic ' + wrapClass + '">' + source + img + '</picture>';
  }

  function header(isAdmin) {
    var links = isAdmin ? [
      ['/admin', 'Painel'],
      ['/admin/paginas', 'Páginas'],
      ['/admin/projetos', 'Projetos'],
      ['/admin/inscricoes', 'Inscrições'],
      ['/admin/ofertas', 'Ofertas'],
      ['/admin/editais', 'Editais'],
      ['/admin/administradores', 'Administradores'],
      ['/admin/configuracoes', 'Configurações'],
      ['/admin/auditoria', 'Auditoria'],
      ['/admin/ajuda', 'Ajuda'],
      ['/admin/novidades', 'Novidades']
    ] : [
      ['/home', 'Início'],
      ['/quem-somos', 'Quem somos'],
      ['/servicos', 'O que realizamos'],
      ['/projetos', 'O que temos'],
      ['/colaborar', 'Como posso colaborar'],
      ['/transparencia', 'Transparência']
    ];
    var items = links.map(function (l) { return navLink(l[0], l[1]); }).join('');
    if (isAdmin) {
      items += '<a href="#/home">Ver site</a><button type="button" class="link-btn" data-action="logout">Sair</button>';
    }
    return '<a class="skip" href="#main">Pular para o conteúdo</a>' +
      '<header class="site-header' + (isAdmin ? ' site-header-admin' : '') + '"><div class="container bar">' +
      /* Both wordmarks are rendered; CSS shows the light one in data-theme="dark" (the header surface is dark there). */
      '<a class="brand" href="#/home">' +
      logoPicture('logo-img', SEED.org.name, true, SEED.org.logoBase, 'logo-pic-std') +
      logoPicture('logo-img', SEED.org.name, true, SEED.org.logoLightBase, 'logo-pic-dark') +
      '<small class="brand-sub">' + esc(SEED.org.fullName.split(' e ')[0]) + '<br>e ' + esc(SEED.org.fullName.split(' e ')[1]) + '</small></a>' +
      '<button type="button" class="burger" data-action="toggle-nav" aria-expanded="' + navOpen + '" aria-controls="site-nav">' +
      '<span class="sr-only">' + (navOpen ? 'Fechar menu' : 'Abrir menu') + '</span><span class="bars" aria-hidden="true"></span></button>' +
      '<nav id="site-nav" class="site-nav' + (navOpen ? ' open' : '') + '" aria-label="' + (isAdmin ? 'Área do admin' : 'Principal') + '">' +
      items + '</nav></div></header>';
  }

  function footer() {
    var c = state.contact;
    return '<footer class="footer"><div class="container grid cols-2">' +
      '<div><p class="footer-logo">' + logoPicture('footer-logo-img', SEED.org.name, false, SEED.org.logoLightBase, '') + '</p>' +
      '<p>' + esc(SEED.org.fullName) + ' · Gama (DF)</p><p>' + esc(c.address) + '</p></div>' +
      '<div><h2>Contato</h2>' + contactList() +
      '<p><a href="#/admin/login">Área do admin</a></p>' +
      '<p class="note">versão ' + esc(SEED.releases[0].version) + ' · <a href="#/admin/novidades">Novidades</a></p>' +
      '<p class="note">Protótipo navegável: os dados ficam salvos apenas neste navegador.</p></div>' +
      '</div></footer>';
  }

  /* ---------- public pages ---------- */

  function pageHome() {
    var p = state.pages.home;
    var upcoming = publishedProjects().slice(0, 3);
    return '<section class="hero"><div class="container">' +
      '<p class="eyebrow">PROAME · Gama (DF)</p>' +
      '<h1>' + esc(p.heroTitle) + '</h1>' +
      '<p>' + esc(p.heroText) + '</p>' +
      '<div class="actions"><a class="btn btn-accent" href="#/projetos">Ver projetos</a>' +
      '<a class="btn btn-ghost" href="#/colaborar">Quero colaborar</a></div></div></section>' +
      '<section class="container section"><p class="palette-note" role="note"><strong>Escolha de paleta:</strong> ' +
      'use os botões A, B e C no canto inferior para comparar as três cores. A paleta B é gerada a partir do novo logotipo; ' +
      'a A é a cor original da marca; a C usa o mesmo verde do logotipo com cores mais vivas.</p></section>' +
      '<section class="section container"><h2>Nossa missão</h2><p>' + esc(p.missionText) + '</p></section>' +
      '<section class="section container"><h2>O que realizamos</h2>' + serviceGrid(activeServices().slice(0, 3)) +
      '<p><a href="#/servicos">Ver todos os serviços</a></p></section>' +
      '<section class="section container"><h2>Próximos projetos</h2>' +
      (upcoming.length ? '<div class="grid cols-3">' + upcoming.map(projectCard).join('') + '</div>' : '<p>Em breve novos projetos.</p>') +
      '<p><a href="#/projetos">Todos os projetos</a></p></section>' +
      '<section class="section container"><div class="card cta"><h2>Como posso colaborar?</h2>' +
      '<p>Empresas, professores, monitores e seguranças podem apoiar nossos projetos com recursos, cestas básicas, serviços ou formação.</p>' +
      '<a class="btn btn-accent" href="#/colaborar">Quero colaborar</a></div></section>';
  }

  function pageQuemSomos() {
    return '<section class="section container"><h1>Quem somos</h1>' +
      paragraphs(state.pages.quemSomos.body) + contactBlock() + '</section>';
  }

  function pageServicos() {
    return '<section class="section container"><h1>O que realizamos</h1>' +
      '<p>Conheça os serviços oferecidos pelo PROAME.</p>' + serviceGrid(activeServices()) + '</section>';
  }

  function filteredProjects() {
    return publishedProjects().filter(function (p) {
      if (filters.type !== 'all' && p.typeId !== filters.type) { return false; }
      var days = daysFromNow(p.startsAt);
      if (filters.date === '30' && (days < 0 || days > 30)) { return false; }
      if (filters.date === 'later' && days <= 30) { return false; }
      if (filters.cover === 'with' && !p.photos.length) { return false; }
      if (filters.cover === 'without' && p.photos.length) { return false; }
      return true;
    });
  }

  function pageProjetos() {
    var chips = function (group, list, label) {
      return '<div class="chips" role="group" aria-label="' + esc(label) + '">' + list.map(function (o) {
        return '<button type="button" class="chip" data-action="filter" data-group="' + group + '" data-value="' + esc(o[0]) +
          '" aria-pressed="' + (filters[group] === o[0]) + '">' + esc(o[1]) + '</button>';
      }).join('') + '</div>';
    };
    var typeOpts = [['all', 'Todos os tipos']].concat(state.projectTypes.map(function (t) { return [t.id, t.name]; }));
    var dateOpts = [['all', 'Todas as datas'], ['30', 'Próximos 30 dias'], ['later', 'Depois de 30 dias']];
    var coverOpts = [['all', 'Com ou sem foto'], ['with', 'Com foto'], ['without', 'Sem foto']];
    var list = filteredProjects();
    return '<section class="section container"><h1>O que temos</h1>' +
      '<p>Projetos agendados com inscrições para beneficiários.</p>' +
      '<p class="filters-label">Tipo</p>' + chips('type', typeOpts, 'Filtrar por tipo') +
      '<p class="filters-label">Data</p>' + chips('date', dateOpts, 'Filtrar por data') +
      '<p class="filters-label">Foto</p>' + chips('cover', coverOpts, 'Filtrar por foto') +
      (list.length ? '<div class="grid cols-3">' + list.map(projectCard).join('') + '</div>' :
        '<p class="alert info">Nenhum projeto encontrado com esses filtros.</p>') +
      '</section>';
  }

  function pageProjeto(id) {
    var p = findById(state.projects, id);
    if (!p || p.status !== 'published') {
      return '<section class="section container"><h1>Projeto não encontrado</h1>' +
        '<p><a href="#/projetos">Voltar para O que temos</a></p></section>';
    }
    var t = typeOf(p.typeId);
    var showOk = flash === 'signup-ok';
    flash = null;

    var signup;
    if (showOk) {
      signup = alertBox('ok', 'Inscrição recebida! Obrigado. Nossa equipe entrará em contato pelo telefone informado.');
    } else if (p.signupOpen) {
      signup = '<section class="card" aria-labelledby="insc-titulo"><h2 id="insc-titulo">Inscreva-se</h2>' +
        '<p class="meta">Campos marcados com * são obrigatórios.</p>' +
        '<form data-form="signup" data-project="' + esc(p.id) + '" novalidate>' +
        fieldsHtml(ensureBase(p.fields), 'pub') + consentHtml('pub') + turnstileHtml() +
        '<div class="form-actions"><button class="btn" type="submit">Enviar inscrição</button></div></form></section>';
    } else {
      signup = '<p class="alert info">As inscrições para este projeto estão encerradas.</p>';
    }

    var photos = p.photos.length ? p.photos : [null];
    var gallery = '<div class="gallery">' + photos.map(function (ph) {
      return '<figure>' + media(ph, '') + (ph && ph.caption ? '<figcaption>' + esc(ph.caption) + '</figcaption>' : '') + '</figure>';
    }).join('') + '</div>';

    var info = '<dl class="info"><dt>Quando</dt><dd>' + esc(fmtDT(p.startsAt)) + ' até ' + esc(fmtDT(p.endsAt)) + '</dd>' +
      '<dt>Onde</dt><dd>' + esc(p.location) + '</dd>' +
      '<dt>Vagas</dt><dd>' + esc(p.capacity) + '</dd></dl>';

    return '<section class="section container"><p><a href="#/projetos">← Todos os projetos</a></p>' +
      '<span class="tag" style="background:' + esc(t.color) + '">' + esc(t.name) + '</span>' +
      '<div class="page-head"><h1>' + esc(p.title) + '</h1>' + helpButton(p.title) + '</div>' + gallery +
      '<div class="detail"><div>' + paragraphs(p.description) + '</div><aside class="card">' + info + '</aside></div>' +
      signup + '</section>';
  }

  function pageColaborar() {
    var showOk = flash === 'collab-ok';
    flash = null;
    var body = showOk
      ? alertBox('ok', 'Obrigado por querer colaborar! Recebemos sua oferta e entraremos em contato.') +
        '<p><a href="#/home">Voltar ao início</a></p>'
      : '<form data-form="collab" novalidate>' + fieldsHtml(COLLAB_FIELDS, 'col') + consentHtml('col') + turnstileHtml() +
        '<div class="form-actions"><button class="btn" type="submit">Enviar</button></div></form>';
    return '<section class="section container"><div class="page-head"><h1>Como posso colaborar</h1>' + helpButton('Como posso colaborar') + '</div>' +
      '<p>Empresas, professores, monitores e seguranças podem apoiar nossos projetos. Preencha o formulário e nossa equipe entrará em contato.</p>' +
      '<div class="card">' + body + '</div></section>';
  }

  function pageTransparencia() {
    var list = state.editais
      .filter(function (e) { return e.status === 'published'; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var items = list.length ? '<ul class="list">' + list.map(function (e) {
      return '<li><div class="row-between"><div><strong>' + esc(e.number) + '</strong> · ' + esc(e.title) +
        '<p class="meta">Publicado em ' + esc(fmtDate(e.date)) + (e.deadline ? ' · Prazo: ' + esc(fmtDate(e.deadline)) : '') + '</p></div>' +
        '<button type="button" class="btn btn-small" data-action="download-edital" data-id="' + esc(e.id) + '">Baixar</button></div></li>';
    }).join('') + '</ul>' : '<p>Nenhum edital publicado no momento.</p>';
    return '<section class="section container"><h1>Transparência</h1>' +
      '<p>Editais promovidos pelo PROAME, disponíveis para download.</p><h2>Editais</h2>' + items + '</section>';
  }

  function downloadEdital(id) {
    var e = findById(state.editais, id);
    if (!e) { return; }
    if (e.dataUrl) {
      triggerDownload(e.dataUrl, e.fileName || 'edital.pdf');
      return;
    }
    // Seed editais have no file: generate a small text placeholder for the demo.
    var text = 'PROAME - Edital ' + e.number + '\n' + e.title + '\n\n' +
      'Arquivo de demonstração (protótipo). O PDF oficial será disponibilizado na versão final.\n';
    var url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    triggerDownload(url, 'edital-' + e.number.replace(/\W+/g, '-') + '-exemplo.txt');
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ---------- admin: login & dashboard ---------- */

  // Login is two steps: password, then a verification code (2FA). Prototype: any code works.
  var loginStep = 'password';
  var loginRecovery = false;

  function pageLogin() {
    if (loginStep === 'code') {
      var codeInput = loginRecovery
        ? '<div class="field"><label for="login-recovery">Código de recuperação</label><input id="login-recovery" name="codigo" autocomplete="one-time-code" required></div>'
        : '<div class="field"><label for="login-code">Código de verificação (6 dígitos)</label><input id="login-code" name="codigo" inputmode="numeric" autocomplete="one-time-code" required></div>';
      return '<section class="section container"><div class="card login-box"><h1>Verificação em duas etapas</h1>' +
        '<div class="alert warn"><strong>Protótipo:</strong> qualquer código é aceito.</div>' +
        '<form data-form="login-code" novalidate>' + codeInput +
        '<p class="field-error" id="login-code-error" hidden></p>' +
        '<div class="form-actions"><button class="btn" type="submit">Verificar</button>' +
        '<button type="button" class="btn btn-ghost" data-action="login-recovery-toggle">' +
        (loginRecovery ? 'usar código do aplicativo' : 'usar código de recuperação') + '</button>' +
        '<button type="button" class="btn btn-ghost" data-action="login-back">Voltar</button></div></form></div></section>';
    }
    return '<section class="section container"><div class="card login-box"><h1>Área do admin</h1>' +
      '<div class="alert warn"><strong>Protótipo:</strong> qualquer e-mail e senha são aceitos.</div>' +
      '<form data-form="login" novalidate>' +
      '<div class="field"><label for="login-email">E-mail</label><input id="login-email" name="email" type="email" autocomplete="username" required></div>' +
      '<div class="field"><label for="login-pass">Senha</label><input id="login-pass" name="senha" type="password" autocomplete="current-password" required></div>' +
      '<p class="field-error" id="login-error" hidden></p>' +
      '<div class="form-actions"><button class="btn" type="submit">Entrar</button></div></form></div></section>';
  }

  function doLogin(form) {
    var email = form.elements.namedItem('email').value.trim();
    var senha = form.elements.namedItem('senha').value;
    var err = document.getElementById('login-error');
    if (!email || !senha) {
      err.textContent = 'Informe e-mail e senha.';
      err.hidden = false;
      return;
    }
    loginStep = 'code';
    loginRecovery = false;
    route();
  }

  function doLoginCode(form) {
    var codigo = form.elements.namedItem('codigo').value.trim();
    var err = document.getElementById('login-code-error');
    if (!codigo) {
      err.textContent = 'Informe o código.';
      err.hidden = false;
      return;
    }
    state.session = true;
    appendAudit(loginRecovery ? 'Login com código de recuperação' : 'Login com verificação em duas etapas');
    loginStep = 'password';
    loginRecovery = false;
    saveState();
    setHash('/admin');
  }

  function stat(n, label) {
    return '<div class="card stat"><strong>' + n + '</strong>' + esc(label) + '</div>';
  }

  function pageDashboard() {
    var pub = state.projects.filter(function (p) { return p.status === 'published'; }).length;
    var novasIns = state.signups.filter(function (s) { return s.status === 'Nova'; }).length;
    var novasOf = state.offers.filter(function (o) { return o.status === 'Nova'; }).length;
    var editais = state.editais.filter(function (e) { return e.status === 'published'; }).length;
    var recentS = state.signups.slice(0, 5);
    var recentO = state.offers.slice(0, 5);
    return adminPage('Painel', '<div class="stats">' +
      stat(pub, 'Projetos publicados') + stat(novasIns, 'Inscrições novas') +
      stat(novasOf, 'Ofertas novas') + stat(editais, 'Editais publicados') + '</div>' +
      '<h2>Inscrições recentes</h2>' + (recentS.length ? '<ul class="list">' + recentS.map(function (s) {
        return '<li><strong>' + esc(answer(s, 'nome') || 'Sem nome') + '</strong> · ' + esc(projectTitle(s.projectId)) +
          '<p class="meta">' + esc(fmtStamp(s.createdAt)) + ' · ' + esc(s.status) + '</p></li>';
      }).join('') + '</ul>' : '<p>Nenhuma inscrição.</p>') +
      '<h2>Ofertas recentes</h2>' + (recentO.length ? '<ul class="list">' + recentO.map(function (o) {
        return '<li><strong>' + esc(o.name) + '</strong> · ' + esc(o.contribution) +
          '<p class="meta">' + esc(fmtStamp(o.createdAt)) + ' · ' + esc(o.status) + '</p></li>';
      }).join('') + '</ul>' : '<p>Nenhuma oferta.</p>') +
      '<div class="card"><h2>Dados de exemplo</h2><p class="note">Restaura projetos, páginas, editais, inscrições e ofertas de exemplo. Os dados atuais serão apagados.</p>' +
      '<button type="button" class="btn btn-ghost" data-action="restore">Restaurar dados de exemplo</button></div>' +
      '<h2>Segurança e ajuda</h2><ul class="list">' +
      '<li><a href="#/admin/administradores">Administradores e Roots</a></li>' +
      '<li><a href="#/admin/auditoria">Auditoria</a></li>' +
      '<li><a href="#/admin/ajuda">Central de ajuda</a></li></ul>');
  }

  function openRestore() {
    openDialog('Restaurar dados de exemplo?', '<p>As alterações atuais serão perdidas.</p>' +
      '<div class="dlg-actions"><button type="button" class="btn btn-ghost" data-action="dlg-close">Cancelar</button>' +
      '<button type="button" class="btn btn-danger" data-action="restore-confirm">Restaurar</button></div>');
  }

  function restoreSeed() {
    closeDialog(true);
    state = clone(SEED);
    state.session = true;
    draft = null;
    appendAudit('Restaurou os dados de exemplo');
    saveState();
    toast('Dados de exemplo restaurados.');
    route();
  }

  /* ---------- admin: administrators (Root / Admin) ---------- */

  function pageAdministradores() {
    var me = currentActor();
    var rows = state.admins.map(function (a) {
      var role = a.role === 'Root'
        ? (a.rootUntil ? 'Root temporário até ' + fmtDate(a.rootUntil) : 'Root')
        : 'Admin';
      var actions = a.id === me.id
        ? '<span class="note">Sua conta</span>'
        : '<button type="button" class="btn btn-small btn-ghost" data-action="admin-toggle" data-id="' + esc(a.id) + '">' +
          (a.active ? 'Desativar' : 'Reativar') + '</button>' +
          (a.role !== 'Root' && a.active
            ? ' <button type="button" class="btn btn-small btn-ghost" data-action="admin-promote-open" data-id="' + esc(a.id) + '">Tornar Root temporário</button>'
            : '');
      return '<tr><th scope="row">' + esc(a.name) + '</th><td>' + esc(role) + '</td>' +
        '<td>' + (a.twoFactor ? 'Ativa' : 'Desativada') + '</td>' +
        '<td>' + esc(fmtStamp(a.lastAccess)) + '</td>' +
        '<td>' + (a.active ? 'Ativo' : 'Desativado') + '</td><td>' + actions + '</td></tr>';
    }).join('');
    var warn = activeRootCount() < 2
      ? alertBox('warn', 'Atenção: há menos de 2 Roots ativos. Promova outro administrador antes de sair.')
      : '';
    return adminPage('Administradores', warn +
      '<p class="note">Administradores são desativados, nunca apagados, para preservar o histórico.</p>' +
      '<div class="table-wrap"><table class="data-table"><caption class="sr-only">Administradores da área admin</caption>' +
      '<thead><tr><th scope="col">Nome</th><th scope="col">Papel</th><th scope="col">Verificação em duas etapas</th>' +
      '<th scope="col">Último acesso</th><th scope="col">Situação</th><th scope="col">Ações</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>');
  }

  function toggleAdmin(id) {
    var a = findById(state.admins, id);
    if (!a) { return; }
    if (a.active && isActiveRoot(a, new Date().toISOString().slice(0, 10)) && activeRootCount() <= 1) {
      toast('Não é possível desativar o último Root ativo.');
      return;
    }
    a.active = !a.active;
    appendAudit((a.active ? 'Reativou' : 'Desativou') + ' o administrador ' + a.name);
    saveState();
    toast(a.active ? 'Administrador reativado.' : 'Administrador desativado.');
    route();
  }

  function openPromote(id) {
    var a = findById(state.admins, id);
    if (!a) { return; }
    openDialog('Tornar Root temporário', '<form data-form="promote" data-id="' + esc(a.id) + '" novalidate>' +
      '<p>' + esc(a.name) + ' terá as permissões de Root até a data abaixo. Depois disso, volta a Admin.</p>' +
      '<div class="field"><label for="promote-until">Válido até</label>' +
      '<input type="date" id="promote-until" name="rootUntil" required></div>' +
      '<div class="dlg-actions"><button type="button" class="btn btn-ghost" data-action="dlg-close">Cancelar</button>' +
      '<button type="submit" class="btn">Promover</button></div></form>');
  }

  function promote(form) {
    var a = findById(state.admins, form.getAttribute('data-id'));
    var until = form.elements.namedItem('rootUntil').value;
    if (!a || !until) { toast('Informe a data de término.'); return; }
    a.role = 'Root';
    a.rootUntil = until;
    appendAudit('Promoveu ' + a.name + ' a Root temporário até ' + fmtDate(until));
    saveState();
    closeDialog(true);
    toast('Root temporário definido.');
    route();
  }

  /* ---------- admin: configurações (Root only) ---------- */

  function pageConfiguracoes() {
    if (currentActor().role !== 'Root') {
      return adminPage('Configurações', alertBox('warn', 'Apenas Root pode alterar as configurações.'));
    }
    var s = state.smtp;
    var n = state.notifications;
    var history = state.termHistory.slice().reverse().map(function (t) {
      var current = t.version === consentVersion() ? ' <strong>(atual)</strong>' : '';
      return '<li>Versão ' + esc(t.version) + current + ' · ' + esc(fmtDate(t.date)) + ' · ' + esc(t.note) + '</li>';
    }).join('');
    return adminPage('Configurações',
      '<form data-form="smtp" class="card" novalidate><h2>E-mail (SMTP)</h2>' +
      '<div class="form-grid">' +
      '<div class="field"><label for="smtp-host">Servidor</label><input id="smtp-host" name="host" value="' + esc(s.host) + '"></div>' +
      '<div class="field"><label for="smtp-port">Porta</label><input id="smtp-port" name="port" type="number" min="1" value="' + esc(s.port) + '"></div>' +
      '<div class="field"><label for="smtp-user">Usuário</label><input id="smtp-user" name="user" value="' + esc(s.user) + '"></div>' +
      '<div class="field"><label for="smtp-from">Remetente</label><input id="smtp-from" name="from" value="' + esc(s.from) + '"></div>' +
      '<div class="field span-2"><label for="smtp-pass">Senha</label>' +
      '<input id="smtp-pass" name="password" type="password" autocomplete="new-password" placeholder="' + (s.passwordSet ? '••• definida' : 'Não definida') + '">' +
      '<p class="help">Gravada no servidor e nunca exibida. Deixe em branco para manter a senha atual.</p></div></div>' +
      '<div class="form-actions"><button class="btn" type="submit">Salvar e-mail</button>' +
      '<button type="button" class="btn btn-ghost" data-action="smtp-test">Enviar e-mail de teste</button></div></form>' +
      '<form data-form="term" class="card" novalidate><h2>Termo de consentimento LGPD</h2>' +
      '<div class="field"><label for="term-text">Texto do termo</label>' +
      '<textarea id="term-text" name="term" rows="5">' + esc(state.consentText) + '</textarea></div>' +
      '<p class="note">Cada edição cria uma nova versão. Inscrições antigas continuam ligadas à versão em que foram aceitas.</p>' +
      '<details><summary>Histórico de versões</summary><ul class="list">' + history + '</ul></details>' +
      '<div class="form-actions"><button class="btn" type="submit">Salvar nova versão</button></div></form>' +
      '<form data-form="notif" class="card" novalidate><h2>Notificações por e-mail</h2>' +
      '<div class="field check-field"><label class="check" for="nt-signup"><input type="checkbox" id="nt-signup" name="newSignup"' + (n.newSignup ? ' checked' : '') + '><span>Nova inscrição</span></label></div>' +
      '<div class="field check-field"><label class="check" for="nt-offer"><input type="checkbox" id="nt-offer" name="newOffer"' + (n.newOffer ? ' checked' : '') + '><span>Nova oferta de colaboração</span></label></div>' +
      '<div class="field check-field"><label class="check" for="nt-edital"><input type="checkbox" id="nt-edital" name="newEdital"' + (n.newEdital ? ' checked' : '') + '><span>Novo edital publicado</span></label></div>' +
      '<div class="field check-field"><label class="check" for="nt-security"><input type="checkbox" id="nt-security" checked disabled><span>Alertas de segurança (sempre enviados)</span></label></div>' +
      '<div class="form-actions"><button class="btn" type="submit">Salvar preferências</button></div></form>' +
      '<section class="card disabled-card" aria-disabled="true"><h2>Identidade visual — Em breve</h2>' +
      '<p class="note">Paleta e logotipo serão editáveis aqui na versão final.</p></section>');
  }

  function saveSmtp(form) {
    var g = function (name) { return form.elements.namedItem(name).value.trim(); };
    state.smtp.host = g('host');
    state.smtp.port = Number(g('port')) || state.smtp.port;
    state.smtp.user = g('user');
    state.smtp.from = g('from');
    if (g('password')) { state.smtp.passwordSet = true; }
    appendAudit('Alterou as configurações de e-mail (SMTP)');
    saveState();
    toast('Configurações de e-mail salvas.');
    route();
  }

  function saveTerm(form) {
    var text = form.elements.namedItem('term').value.trim();
    if (!text) { toast('O termo não pode ficar vazio.'); return; }
    if (text === state.consentText) { toast('Nenhuma alteração no termo.'); return; }
    var version = consentVersion() + 1;
    state.consentVersion = version;
    state.consentText = text;
    state.termHistory.push({ version: version, date: new Date().toISOString().slice(0, 10), note: 'Edição pelo administrador.' });
    appendAudit('Editou o termo LGPD (versão ' + version + ')');
    saveState();
    toast('Nova versão do termo salva (v' + version + ').');
    route();
  }

  function saveNotif(form) {
    state.notifications = {
      newSignup: form.elements.namedItem('newSignup').checked,
      newOffer: form.elements.namedItem('newOffer').checked,
      newEdital: form.elements.namedItem('newEdital').checked
    };
    saveState();
    toast('Preferências salvas.');
  }

  /* ---------- admin: auditoria, ajuda, novidades ---------- */

  function pageAuditoria() {
    var rows = state.auditLog.map(function (e) {
      return '<tr><td>' + esc(fmtStamp(e.at)) + '</td><td>' + esc(e.actor) + '</td><td>' + esc(e.event) + '</td></tr>';
    }).join('');
    return adminPage('Auditoria', '<p class="note">Registro das ações sensíveis. Os eventos não podem ser editados nem apagados.</p>' +
      '<div class="table-wrap"><table class="data-table"><caption class="sr-only">Eventos registrados</caption>' +
      '<thead><tr><th scope="col">Quando</th><th scope="col">Quem</th><th scope="col">O que aconteceu</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>');
  }

  function pageAjuda() {
    var faq = state.helpTopics.map(function (t) {
      return '<details class="faq"><summary>' + esc(t.q) + '</summary><p>' + esc(t.a) + '</p></details>';
    }).join('');
    return adminPage('Central de ajuda', '<p class="note">Respostas para as situações mais comuns. O conteúdo é atualizado a cada versão.</p>' +
      '<div class="card faq-list">' + faq + '</div>');
  }

  function pageNovidades() {
    return adminPage('Novidades', state.releases.map(function (r) {
      return '<article class="card"><h2>Versão ' + esc(r.version) + '</h2><p class="meta">' + esc(fmtDate(r.date)) + '</p>' +
        '<ul class="list">' + r.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></article>';
    }).join(''));
  }

  /* ---------- help dialogs ---------- */

  function helpKey() {
    var path = currentPath;
    if (/^\/projeto\//.test(path)) { return '/projeto'; }
    if (/^\/admin\/projeto\//.test(path)) { return '/admin/projeto'; }
    return path;
  }

  function openPageHelp() {
    openDialog('Ajuda desta página', '<p>' + esc(state.pageHelp[helpKey()] || state.pageHelp['/' + helpKey().split('/')[1]] || 'Sem ajuda para esta página.') + '</p>');
  }

  function openTerm() {
    openDialog('Termo de consentimento (versão ' + consentVersion() + ')', '<p>' + esc(state.consentText) + '</p>');
  }

  /* ---------- admin: pages & contact ---------- */

  // testKind (optional): adds a "Testar" button that opens the link built from the typed (unsaved) value.
  function textField(name, label, value, type, testKind) {
    var id = 'pg-' + name.replace(/\./g, '-');
    var input = '<input id="' + id + '" name="' + esc(name) + '" type="' + (type || 'text') + '" value="' + esc(value) + '">';
    if (testKind) {
      input = '<div class="field-row">' + input +
        '<button type="button" class="btn btn-ghost btn-small" data-action="test-link" data-kind="' + testKind + '" data-for="' + id + '"' +
        ' aria-label="Testar ' + esc(label) + '">' + icon('open') + 'Testar</button></div>';
    }
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' + input + '</div>';
  }

  function areaField(name, label, value, rows) {
    var id = 'pg-' + name.replace(/\./g, '-');
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' +
      '<textarea id="' + id + '" name="' + esc(name) + '" rows="' + (rows || 4) + '">' + esc(value) + '</textarea></div>';
  }

  function pagePages() {
    var h = state.pages.home;
    var q = state.pages.quemSomos;
    var c = state.contact;
    return adminPage('Páginas e contato', '<p class="note">As alterações aparecem no site público após salvar.</p>' +
      '<form data-form="pages" class="card" novalidate>' +
      '<fieldset><legend>Início</legend>' + textField('home.heroTitle', 'Título do banner', h.heroTitle) +
      areaField('home.heroText', 'Texto do banner', h.heroText) + areaField('home.missionText', 'Missão', h.missionText) + '</fieldset>' +
      '<fieldset><legend>Quem somos</legend>' +
      areaField('quemSomos.body', 'Texto (separe os parágrafos com uma linha em branco)', q.body, 8) + '</fieldset>' +
      '<fieldset><legend>Contato</legend>' + textField('contact.address', 'Endereço', c.address) +
      '<p class="note">Use “Testar” para conferir cada link antes de salvar e publicar.</p>' +
      textField('contact.phone', 'Telefone', c.phone, 'tel', 'phone') +
      textField('contact.whatsapp', 'WhatsApp (somente dígitos, com DDI)', c.whatsapp, 'tel', 'whatsapp') +
      textField('contact.email', 'E-mail', c.email, 'email', 'email') +
      textField('contact.instagram', 'Instagram (@perfil ou link)', c.instagram, 'text', 'instagram') +
      textField('contact.youtube', 'YouTube (@canal ou link)', c.youtube, 'text', 'youtube') + '</fieldset>' +
      '<p class="note">O termo de consentimento LGPD é editado em Configurações (Root).</p>' +
      '<div class="form-actions"><button class="btn" type="submit">Salvar alterações</button></div></form>');
  }

  function savePages(form) {
    var g = function (name) { return form.elements.namedItem(name).value.trim(); };
    state.pages.home.heroTitle = g('home.heroTitle');
    state.pages.home.heroText = g('home.heroText');
    state.pages.home.missionText = g('home.missionText');
    state.pages.quemSomos.body = form.elements.namedItem('quemSomos.body').value.trim();
    state.contact.address = g('contact.address');
    state.contact.phone = g('contact.phone');
    state.contact.whatsapp = g('contact.whatsapp');
    state.contact.email = g('contact.email');
    state.contact.instagram = g('contact.instagram');
    state.contact.youtube = g('contact.youtube');
    saveState();
    toast('Páginas salvas.');
    route();
  }

  /* ---------- admin: projects ---------- */

  function pageAdminProjects() {
    var rows = state.projects.slice().sort(function (a, b) { return a.startsAt < b.startsAt ? -1 : 1; }).map(function (p) {
      return '<tr><td>' + esc(p.title) + '</td><td>' + esc(typeOf(p.typeId).name) + '</td><td>' + esc(fmtDT(p.startsAt)) +
        '</td><td>' + esc(PROJECT_STATUS_LABEL[p.status]) + '</td><td>' + countSignups(p.id) +
        '</td><td><a href="#/admin/projeto/' + esc(p.id) + '">Editar<span class="sr-only"> ' + esc(p.title) + '</span></a></td></tr>';
    }).join('');
    return adminPage('Projetos', '<div class="toolbar"><span class="note">Rascunhos não aparecem no site público.</span>' +
      '<a class="btn" href="#/admin/projeto/novo">Novo projeto</a></div>' +
      '<div class="table-wrap"><table><thead><tr><th scope="col">Título</th><th scope="col">Tipo</th><th scope="col">Início</th>' +
      '<th scope="col">Status</th><th scope="col">Inscrições</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="6">Nenhum projeto cadastrado.</td></tr>') + '</tbody></table></div>');
  }

  function pageAdminProject(id) {
    var key = id === 'novo' ? null : id;
    if (!draft || draft.id !== key) {
      if (key) {
        var found = findById(state.projects, key);
        if (!found) { return adminPage('Projeto', '<p>Projeto não encontrado.</p>'); }
        draft = clone(found);
      } else {
        draft = newDraft();
      }
    }
    var d = draft;
    var typeOpts = state.projectTypes.map(function (t) { return { value: t.id, label: t.name }; });
    var photos = d.photos.length ? '<ul class="photo-list">' + d.photos.map(function (ph) {
      return '<li class="photo-item">' + media(ph, 'thumb') + '<span>' + esc(ph.caption || 'Foto') + '</span>' +
        '<button type="button" class="btn btn-small btn-danger" data-action="remove-photo" data-id="' + esc(ph.id) + '">Remover foto</button></li>';
    }).join('') + '</ul>' : '<p class="note">Nenhuma foto. O site mostra uma imagem ilustrativa.</p>';

    return adminPage(key ? 'Editar projeto' : 'Novo projeto',
      '<form class="new-type-form card" data-form="new-type" novalidate><h2>Tipos de projeto</h2>' +
      '<div class="inline-row"><div class="field"><label for="new-type-name">Novo tipo</label>' +
      '<input id="new-type-name" name="newType" placeholder="Ex.: Palestra"></div>' +
      '<button type="submit" class="btn btn-ghost">Criar tipo</button></div></form>' +
      '<form data-form="project" class="card" novalidate>' +
      '<fieldset><legend>Dados do projeto</legend><div class="form-grid">' +
      '<div class="field span-2"><label for="p-title">Título <span aria-hidden="true">*</span></label>' +
      '<input id="p-title" name="title" required value="' + esc(d.title) + '"></div>' +
      '<div class="field"><label for="p-type">Tipo <span aria-hidden="true">*</span></label>' +
      '<select id="p-type" name="typeId" required>' + opts(typeOpts, d.typeId) + '</select></div>' +
      '<div class="field"><label for="p-status">Status</label><select id="p-status" name="status">' + opts(PROJECT_STATUS, d.status) + '</select></div>' +
      '<div class="field span-2"><label for="p-desc">Descrição</label><textarea id="p-desc" name="description" rows="5">' + esc(d.description) + '</textarea></div>' +
      '<div class="field span-2"><label for="p-loc">Local</label><input id="p-loc" name="location" value="' + esc(d.location) + '"></div>' +
      '<div class="field"><label for="p-start">Início <span aria-hidden="true">*</span></label>' +
      '<input type="datetime-local" id="p-start" name="startsAt" required value="' + esc(d.startsAt) + '"></div>' +
      '<div class="field"><label for="p-end">Fim <span aria-hidden="true">*</span></label>' +
      '<input type="datetime-local" id="p-end" name="endsAt" required value="' + esc(d.endsAt) + '"></div>' +
      '<div class="field"><label for="p-cap">Vagas <span aria-hidden="true">*</span></label>' +
      '<input type="number" min="1" id="p-cap" name="capacity" required value="' + esc(d.capacity) + '"></div>' +
      '<div class="field check-field"><label class="check" for="p-signup"><input type="checkbox" id="p-signup" name="signupOpen"' +
      (d.signupOpen ? ' checked' : '') + '><span>Inscrições abertas</span></label></div>' +
      '</div></fieldset>' +
      '<fieldset><legend>Fotos</legend>' + photos +
      '<div class="field"><label for="photo-input">Adicionar foto (JPG ou PNG)</label>' +
      '<input type="file" id="photo-input" accept="image/*" data-action="upload-photo"></div>' +
      '<p class="help">Fotos grandes ocupam espaço no navegador; prefira imagens de até 1 MB.</p></fieldset>' +
      '<fieldset><legend>Formulário de inscrição</legend>' +
      '<div class="builder"><div><p class="note">Os campos fixos (Nome, Endereço, Telefone, Cad. Único) sempre aparecem e não podem ser removidos.</p>' +
      builderHtml() + '</div>' +
      '<aside aria-labelledby="prev-title"><h3 id="prev-title">Pré-visualização</h3>' +
      '<p class="note">Como o beneficiário verá o formulário.</p><div class="preview" id="preview"></div></aside></div>' +
      '</fieldset>' +
      '<div class="form-actions"><button class="btn" type="submit">Salvar projeto</button>' +
      '<a class="btn btn-ghost" href="#/admin/projetos">Cancelar</a></div></form>');
  }

  function builderHtml() {
    var base = state.baseFields.length;
    var last = draft.fields.length - 1;
    var items = draft.fields.map(function (f, i) {
      if (i < base) {
        return '<li class="builder-item"><div class="row-between"><strong>' + esc(f.label) +
          '</strong><span class="badge-lock">Fixo · ' + esc(typeLabel(f.type)) + '</span></div></li>';
      }
      var dataAttrs = ' data-action="field-prop" data-idx="' + i + '"';
      return '<li class="builder-item">' +
        '<div class="field"><label for="fb-label-' + i + '">Rótulo do campo</label>' +
        '<input id="fb-label-' + i + '" value="' + esc(f.label) + '" data-field-prop="label"' + dataAttrs + '></div>' +
        '<div class="form-grid"><div class="field"><label for="fb-type-' + i + '">Tipo</label>' +
        '<select id="fb-type-' + i + '" data-field-prop="type"' + dataAttrs + '>' + opts(FIELD_TYPES, f.type) + '</select></div>' +
        '<div class="field check-field"><label class="check" for="fb-req-' + i + '"><input type="checkbox" id="fb-req-' + i + '" data-field-prop="required"' +
        dataAttrs + (f.required ? ' checked' : '') + '><span>Obrigatório</span></label></div></div>' +
        (f.type === 'select' ? '<div class="field"><label for="fb-opt-' + i + '">Opções (separadas por vírgula)</label>' +
          '<input id="fb-opt-' + i + '" value="' + esc((f.options || []).join(', ')) + '" data-field-prop="options"' + dataAttrs + '></div>' : '') +
        '<div class="field"><label for="fb-help-' + i + '">Texto de ajuda (opcional)</label>' +
        '<input id="fb-help-' + i + '" value="' + esc(f.help || '') + '" data-field-prop="help"' + dataAttrs + '></div>' +
        '<div class="inline-row">' +
        '<button type="button" class="btn btn-small btn-ghost" data-action="move-field" data-idx="' + i + '" data-dir="-1"' + (i === base ? ' disabled' : '') + '>Subir</button>' +
        '<button type="button" class="btn btn-small btn-ghost" data-action="move-field" data-idx="' + i + '" data-dir="1"' + (i === last ? ' disabled' : '') + '>Descer</button>' +
        '<button type="button" class="btn btn-small btn-danger" data-action="remove-field" data-idx="' + i + '">Remover</button>' +
        '</div></li>';
    }).join('');
    return '<ol class="fields-list">' + items + '</ol>' +
      '<button type="button" class="btn btn-ghost" data-action="add-field">Adicionar campo</button>';
  }

  function typeLabel(value) {
    var found = FIELD_TYPES.filter(function (t) { return t.value === value; })[0];
    return found ? found.label : value;
  }

  function renderPreview() {
    var box = document.getElementById('preview');
    if (!box || !draft) { return; }
    box.innerHTML = fieldsHtml(draft.fields, 'prev') + consentHtml('prev') +
      '<button class="btn" type="button" disabled>Enviar inscrição</button>';
  }

  /* Copies the project metadata inputs into the draft before a re-render. */
  function captureMeta() {
    var form = document.querySelector('form[data-form="project"]');
    if (!form || !draft) { return; }
    var e = form.elements;
    draft.title = e.namedItem('title').value.trim();
    draft.typeId = e.namedItem('typeId').value;
    draft.status = e.namedItem('status').value;
    draft.description = e.namedItem('description').value;
    draft.location = e.namedItem('location').value;
    draft.startsAt = e.namedItem('startsAt').value;
    draft.endsAt = e.namedItem('endsAt').value;
    draft.capacity = e.namedItem('capacity').value;
    draft.signupOpen = e.namedItem('signupOpen').checked;
  }

  function onFieldProp(el, eventType) {
    var i = parseInt(el.getAttribute('data-idx'), 10);
    var prop = el.getAttribute('data-field-prop');
    var f = draft.fields[i];
    if (!f || f.locked) { return; }
    if (prop === 'required') { f.required = el.checked; }
    else if (prop === 'options') { f.options = el.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
    else { f[prop] = el.value; }

    if (prop === 'type') {
      if (eventType !== 'change') { return; }
      if (f.type !== 'select') { f.options = []; }
      captureMeta();
      route();
      return;
    }
    renderPreview();
  }

  function saveProject(form) {
    captureMeta();
    var d = draft;
    var problems = [];
    if (!d.title) { problems.push('Informe o título.'); }
    if (!d.typeId) { problems.push('Escolha o tipo do projeto.'); }
    if (!d.startsAt || !d.endsAt) { problems.push('Informe início e fim.'); }
    else if (d.endsAt < d.startsAt) { problems.push('O fim deve ser depois do início.'); }
    if (d.fields.some(function (f) { return !f.locked && !String(f.label).trim(); })) {
      problems.push('Todo campo precisa de um rótulo.');
    }
    if (problems.length) {
      toast(problems.join(' '));
      return;
    }

    var project = {
      id: d.id || uid('p'),
      typeId: d.typeId,
      title: d.title,
      description: d.description,
      location: d.location,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      capacity: Math.max(1, parseInt(d.capacity, 10) || 1),
      signupOpen: !!d.signupOpen,
      status: d.status,
      photos: d.photos,
      fields: ensureBase(d.fields)
    };
    var index = -1;
    state.projects.forEach(function (p, i) { if (p.id === project.id) { index = i; } });
    if (index >= 0) { state.projects[index] = project; } else { state.projects.push(project); }
    saveState();
    draft = null;
    toast('Projeto salvo.');
    setHash('/admin/projetos');
  }

  function createType(form) {
    var name = form.elements.namedItem('newType').value.trim();
    if (!name) {
      toast('Digite o nome do novo tipo.');
      return;
    }
    var id = slugify(name) || uid('t');
    if (findById(state.projectTypes, id)) { id = id + '-' + Date.now().toString(36).slice(-4); }
    state.projectTypes.push({ id: id, name: name, color: PALETTE[state.projectTypes.length % PALETTE.length] });
    saveState();
    captureMeta();
    if (draft) { draft.typeId = id; }
    toast('Tipo "' + name + '" criado.');
    route();
  }

  function onPhotoFile(input) {
    var file = input.files && input.files[0];
    if (!file) { return; }
    if (file.size > MAX_PHOTO_BYTES) {
      toast('Foto com mais de 1 MB: pode ocupar muito espaço no navegador.');
    }
    var reader = new FileReader();
    reader.onload = function () {
      captureMeta();
      draft.photos.push({ id: uid('ph'), dataUrl: reader.result, caption: file.name.replace(/\.[^.]+$/, ''), color: '#4c6707' });
      route();
    };
    reader.onerror = function () { toast('Não foi possível ler a foto.'); };
    reader.readAsDataURL(file);
  }

  function moveField(index, dir) {
    var base = state.baseFields.length;
    var target = index + dir;
    if (index < base || target < base || target >= draft.fields.length) { return; }
    var tmp = draft.fields[index];
    draft.fields[index] = draft.fields[target];
    draft.fields[target] = tmp;
  }

  /* ---------- admin: signups & offers ---------- */

  function signupsFiltered() {
    return state.signups.filter(function (s) {
      return signupProject === 'all' || s.projectId === signupProject;
    });
  }

  function pageSignups() {
    var options = [{ value: 'all', label: 'Todos os projetos' }].concat(state.projects.map(function (p) {
      return { value: p.id, label: p.title };
    }));
    var list = signupsFiltered();
    var rows = list.map(function (s) {
      var details = s.answers.map(function (a) {
        return '<li><strong>' + esc(a.label) + ':</strong> ' + esc(a.value || '—') + '</li>';
      }).join('');
      return '<tr><td>' + esc(fmtStamp(s.createdAt)) + '</td>' +
        '<td>' + esc(answer(s, 'nome')) + '<details><summary>Respostas</summary><ul class="answers">' + details + '</ul></details></td>' +
        '<td>' + esc(answer(s, 'telefone')) + '</td>' +
        '<td>' + esc(maskCad(answer(s, 'cad_unico'))) + '</td>' +
        '<td>' + esc(projectTitle(s.projectId)) + '</td>' +
        '<td><label class="sr-only" for="st-' + esc(s.id) + '">Status da inscrição</label>' +
        '<select id="st-' + esc(s.id) + '" data-action="signup-status" data-id="' + esc(s.id) + '">' + opts(SIGNUP_STATUS, s.status) + '</select></td></tr>';
    }).join('');
    return adminPage('Inscrições', '<div class="toolbar">' +
      '<div class="field"><label for="sp-filter">Projeto</label>' +
      '<select id="sp-filter" data-action="filter-signups">' + opts(options, signupProject) + '</select></div>' +
      '<button type="button" class="btn" data-action="export-csv">Exportar CSV</button></div>' +
      '<p class="note">CadÚnico aparece parcialmente mascarado nesta lista. O CSV contém os dados completos.</p>' +
      (list.length ? '<div class="table-wrap"><table><thead><tr><th scope="col">Data</th><th scope="col">Beneficiário</th>' +
        '<th scope="col">Telefone</th><th scope="col">Cad. Único</th><th scope="col">Projeto</th><th scope="col">Status</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' : '<p>Nenhuma inscrição.</p>'));
  }

  function csvCell(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
  }

  function exportCsv() {
    var rows = [['Data', 'Projeto', 'Status', 'Nome', 'Endereço', 'Telefone', 'Cad. Único', 'Demais respostas']];
    signupsFiltered().forEach(function (s) {
      var extra = s.answers.filter(function (a) { return BASE_KEYS.indexOf(a.key) === -1; })
        .map(function (a) { return a.label + ': ' + a.value; }).join(' | ');
      rows.push([fmtStamp(s.createdAt), projectTitle(s.projectId), s.status, answer(s, 'nome'),
        answer(s, 'endereco'), answer(s, 'telefone'), answer(s, 'cad_unico'), extra]);
    });
    var csv = '﻿' + rows.map(function (r) { return r.map(csvCell).join(';'); }).join('\r\n');
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    triggerDownload(url, 'inscricoes-proame.csv');
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    appendAudit('Exportou CSV de inscrições');
    saveState();
    toast('CSV exportado.');
  }

  function pageOffers() {
    var rows = state.offers.map(function (o) {
      return '<tr><td>' + esc(fmtStamp(o.createdAt)) + '</td>' +
        '<td>' + esc(o.name) + '<br><span class="meta">' + esc(o.profile) + '</span></td>' +
        '<td>' + esc(o.contribution) + '</td>' +
        '<td>' + esc(o.phone) + (o.email ? '<br>' + esc(o.email) : '') + '</td>' +
        '<td>' + esc(o.observation || '—') + '</td>' +
        '<td><label class="sr-only" for="of-' + esc(o.id) + '">Status da oferta</label>' +
        '<select id="of-' + esc(o.id) + '" data-action="offer-status" data-id="' + esc(o.id) + '">' + opts(OFFER_STATUS, o.status) + '</select></td></tr>';
    }).join('');
    return adminPage('Ofertas de colaboração', (rows ?
      '<div class="table-wrap"><table><thead><tr><th scope="col">Data</th><th scope="col">Nome / Empresa</th>' +
      '<th scope="col">Como colaborar</th><th scope="col">Contato</th><th scope="col">Observação</th><th scope="col">Status</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' : '<p>Nenhuma oferta recebida.</p>'));
  }

  /* ---------- admin: editais ---------- */

  function pageAdminEditais() {
    var list = state.editais.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var rows = list.map(function (e) {
      return '<li><div class="row-between"><div><strong>' + esc(e.number) + '</strong> · ' + esc(e.title) +
        '<p class="meta">Data: ' + esc(fmtDate(e.date)) + ' · Prazo: ' + esc(fmtDate(e.deadline)) + ' · ' +
        esc(EDITAL_STATUS[e.status]) + (e.dataUrl ? '' : ' · exemplo') + '</p></div>' +
        '<div class="inline-row"><button type="button" class="btn btn-small btn-ghost" data-action="toggle-edital" data-id="' + esc(e.id) + '">' +
        (e.status === 'published' ? 'Arquivar' : 'Publicar') + '</button>' +
        '<button type="button" class="btn btn-small btn-danger" data-action="delete-edital" data-id="' + esc(e.id) + '">Excluir</button></div></div></li>';
    }).join('');
    return adminPage('Editais', '<p class="note">Envie PDFs. Arquivos acima de 2 MB pedem confirmação antes de salvar.</p>' +
      '<form data-form="edital" class="card" novalidate><h2>Novo edital</h2><div class="form-grid">' +
      '<div class="field span-2"><label for="ed-file">Arquivo PDF <span aria-hidden="true">*</span></label>' +
      '<input type="file" id="ed-file" name="file" accept="application/pdf,.pdf" required></div>' +
      '<div class="field"><label for="ed-number">Número <span aria-hidden="true">*</span></label><input id="ed-number" name="number" required placeholder="Ex.: 004/2026"></div>' +
      '<div class="field"><label for="ed-title">Título <span aria-hidden="true">*</span></label><input id="ed-title" name="title" required></div>' +
      '<div class="field"><label for="ed-date">Data de publicação <span aria-hidden="true">*</span></label><input type="date" id="ed-date" name="date" required></div>' +
      '<div class="field"><label for="ed-deadline">Prazo</label><input type="date" id="ed-deadline" name="deadline"></div>' +
      '<div class="field"><label for="ed-status">Situação</label><select id="ed-status" name="status">' +
      opts([{ value: 'published', label: 'Publicado' }, { value: 'draft', label: 'Rascunho' }], 'published') + '</select></div>' +
      '</div><div class="form-actions"><button class="btn" type="submit">Salvar edital</button></div></form>' +
      '<h2>Editais cadastrados</h2>' + (rows ? '<ul class="list">' + rows + '</ul>' : '<p>Nenhum edital.</p>'));
  }

  function addEdital(form) {
    var fileInput = form.elements.namedItem('file');
    var file = fileInput.files && fileInput.files[0];
    var number = form.elements.namedItem('number').value.trim();
    var title = form.elements.namedItem('title').value.trim();
    var date = form.elements.namedItem('date').value;
    var deadline = form.elements.namedItem('deadline').value;
    var status = form.elements.namedItem('status').value;
    if (!file) { toast('Selecione o arquivo PDF.'); return; }
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { toast('Envie um arquivo PDF.'); return; }
    if (!number || !title || !date) { toast('Preencha número, título e data.'); return; }
    if (file.size > MAX_PDF_BYTES) {
      // Product decision: hard size cap (configurable by the admin in production).
      toast('O PDF tem ' + (file.size / 1048576).toFixed(1) + ' MB. O limite é ' +
        (MAX_PDF_BYTES / 1048576) + ' MB. Reduza o arquivo e tente novamente.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      state.editais.push({
        id: uid('ed'), number: number, title: title, date: date, deadline: deadline,
        status: status, fileName: file.name, dataUrl: reader.result
      });
      if (!saveState()) { state.editais.pop(); return; }
      toast('Edital salvo.');
      route();
    };
    reader.onerror = function () { toast('Não foi possível ler o arquivo.'); };
    reader.readAsDataURL(file);
  }

  /* Field help tooltip: opens on tap/click, closes on a second tap or Escape. */
  function toggleTip(button) {
    var tip = document.getElementById(button.getAttribute('aria-controls'));
    if (!tip) { return; }
    var open = tip.hidden;
    tip.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  }

  /* ---------- form submission ---------- */

  function doSignup(form) {
    var project = findById(state.projects, form.getAttribute('data-project'));
    if (!project) { return; }
    var res = collectAnswers(form, ensureBase(project.fields), 'pub');
    if (!res.ok) {
      toast('Revise os campos destacados.');
      if (res.firstBad) { res.firstBad.focus(); }
      return;
    }
    state.signups.unshift({
      id: uid('s'),
      projectId: project.id,
      status: 'Nova',
      createdAt: new Date().toISOString(),
      consent: true,
      consentText: state.consentText,
      consentVersion: consentVersion(),
      consentAt: new Date().toISOString(),
      answers: res.answers
    });
    saveState();
    flash = 'signup-ok';
    route();
  }

  function doCollab(form) {
    var res = collectAnswers(form, COLLAB_FIELDS, 'col');
    if (!res.ok) {
      toast('Revise os campos destacados.');
      if (res.firstBad) { res.firstBad.focus(); }
      return;
    }
    var get = function (key) {
      var found = res.answers.filter(function (a) { return a.key === key; })[0];
      return found ? found.value : '';
    };
    state.offers.unshift({
      id: uid('o'),
      name: get('nome'),
      profile: get('perfil'),
      contribution: get('colaboracao'),
      phone: get('telefone'),
      email: get('email'),
      observation: get('observacao'),
      status: 'Nova',
      createdAt: new Date().toISOString(),
      consent: true
    });
    saveState();
    flash = 'collab-ok';
    route();
  }

  /* ---------- event delegation ---------- */

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || /^(SELECT|INPUT|TEXTAREA)$/.test(el.tagName)) { return; }
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');

    switch (action) {
      case 'toggle-nav':
        navOpen = !navOpen;
        document.getElementById('site-nav').classList.toggle('open', navOpen);
        el.setAttribute('aria-expanded', String(navOpen));
        break;
      case 'toggle-phone':
        document.body.classList.toggle('phone-mode');
        el.setAttribute('aria-pressed', String(document.body.classList.contains('phone-mode')));
        break;
      case 'palette':
        applyPalette(el.getAttribute('data-value'));
        break;
      case 'filter':
        filters[el.getAttribute('data-group')] = el.getAttribute('data-value');
        route();
        break;
      case 'download-edital':
        downloadEdital(id);
        break;
      case 'copy':
        copyText(el.getAttribute('data-copy'), el.getAttribute('data-label'));
        break;
      case 'test-link':
        var tv = document.getElementById(el.getAttribute('data-for')).value.trim();
        if (!tv) { toast('Preencha o campo antes de testar.'); break; }
        openLink(LINKS[el.getAttribute('data-kind')](tv));
        break;
      case 'logout':
        state.session = false;
        saveState();
        setHash('/home');
        break;
      case 'restore':
        openRestore();
        break;
      case 'restore-confirm':
        restoreSeed();
        break;
      case 'dlg-close':
        closeDialog(false);
        break;
      case 'page-help':
        openPageHelp();
        break;
      case 'read-term':
        openTerm();
        break;
      case 'field-help':
        toggleTip(el);
        break;
      case 'login-recovery-toggle':
        loginRecovery = !loginRecovery;
        route();
        break;
      case 'login-back':
        loginStep = 'password';
        loginRecovery = false;
        route();
        break;
      case 'admin-toggle':
        toggleAdmin(id);
        break;
      case 'admin-promote-open':
        openPromote(id);
        break;
      case 'smtp-test':
        toast('E-mail de teste enviado (simulado) para o administrador.');
        break;
      case 'export-csv':
        exportCsv();
        break;
      case 'toggle-edital':
        var ed = findById(state.editais, id);
        if (ed) {
          ed.status = ed.status === 'published' ? 'archived' : 'published';
          saveState();
          toast('Edital ' + (ed.status === 'published' ? 'publicado.' : 'arquivado.'));
          route();
        }
        break;
      case 'delete-edital':
        openDialog('Excluir este edital?', '<p>Esta ação não pode ser desfeita.</p>' +
          '<div class="dlg-actions"><button type="button" class="btn btn-ghost" data-action="dlg-close">Cancelar</button>' +
          '<button type="button" class="btn btn-danger" data-action="delete-edital-confirm" data-id="' + esc(id) + '">Excluir</button></div>');
        break;
      case 'delete-edital-confirm':
        closeDialog(true);
        state.editais = state.editais.filter(function (x) { return x.id !== id; });
        saveState();
        toast('Edital excluído.');
        route();
        break;
      case 'add-field':
        captureMeta();
        draft.fields.push({
          key: 'campo_' + Date.now().toString(36),
          label: 'Novo campo',
          type: 'text',
          required: false,
          help: '',
          options: []
        });
        route();
        break;
      case 'move-field':
        captureMeta();
        moveField(parseInt(el.getAttribute('data-idx'), 10), parseInt(el.getAttribute('data-dir'), 10));
        route();
        break;
      case 'remove-field':
        openDialog('Remover este campo do formulário?', '<p>As respostas já recebidas não são apagadas.</p>' +
          '<div class="dlg-actions"><button type="button" class="btn btn-ghost" data-action="dlg-close">Cancelar</button>' +
          '<button type="button" class="btn btn-danger" data-action="remove-field-confirm" data-idx="' +
          esc(el.getAttribute('data-idx')) + '">Remover</button></div>');
        break;
      case 'remove-field-confirm':
        closeDialog(true);
        captureMeta();
        draft.fields.splice(parseInt(el.getAttribute('data-idx'), 10), 1);
        route();
        break;
      case 'remove-photo':
        captureMeta();
        draft.photos = draft.photos.filter(function (ph) { return ph.id !== id; });
        route();
        break;
      default:
        break;
    }
  });

  function onFormControlEvent(e) {
    var el = e.target;
    var action = el.getAttribute && el.getAttribute('data-action');
    if (!action) { return; }
    var isText = el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'file';

    // Text inputs react on 'input'; everything else on 'change'.
    if (action === 'field-prop' && isText) {
      if (e.type === 'input') { onFieldProp(el, 'input'); }
      return;
    }
    if (e.type !== 'change') { return; }

    switch (action) {
      case 'field-prop':
        onFieldProp(el, 'change');
        break;
      case 'signup-status':
        var s = findById(state.signups, el.getAttribute('data-id'));
        if (s) { s.status = el.value; saveState(); toast('Status da inscrição atualizado.'); }
        break;
      case 'offer-status':
        var o = findById(state.offers, el.getAttribute('data-id'));
        if (o) { o.status = el.value; saveState(); toast('Status da oferta atualizado.'); }
        break;
      case 'filter-signups':
        signupProject = el.value;
        route();
        break;
      case 'upload-photo':
        onPhotoFile(el);
        el.value = '';
        break;
      default:
        break;
    }
  }

  document.addEventListener('input', onFormControlEvent);
  document.addEventListener('change', onFormControlEvent);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    var kind = form.getAttribute('data-form');
    if (!kind) { return; }
    e.preventDefault();
    var handlers = {
      login: doLogin,
      'login-code': doLoginCode,
      promote: promote,
      smtp: saveSmtp,
      term: saveTerm,
      notif: saveNotif,
      signup: doSignup,
      collab: doCollab,
      pages: savePages,
      project: saveProject,
      'new-type': createType,
      edital: addEdital
    };
    if (handlers[kind]) { handlers[kind](form); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    closeDialog(false);
    document.querySelectorAll('.tip:not([hidden])').forEach(function (tip) {
      tip.hidden = true;
      var btn = document.querySelector('[aria-controls="' + tip.id + '"]');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); }
    });
  });

  window.addEventListener('hashchange', route);
  applyPalette(document.documentElement.getAttribute('data-palette'));
  route();
})();
