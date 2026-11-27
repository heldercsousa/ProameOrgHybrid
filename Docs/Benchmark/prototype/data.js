/* PROAME prototype - seed data. Plain script (no modules), works from file://. */
(function (global) {
  'use strict';

  function field(key, label, type, required, help, options) {
    return { key: key, label: label, type: type, required: required, help: help || '', options: options || [] };
  }

  function baseField(key, label, type, help) {
    var f = field(key, label, type, true, help, []);
    f.locked = true;
    return f;
  }

  function answer(key, label, value) {
    return { key: key, label: label, value: value };
  }

  var BASE_FIELDS = [
    baseField('nome', 'Nome', 'text'),
    baseField('endereco', 'Endereço', 'text'),
    baseField('telefone', 'Telefone', 'phone'),
    baseField('cad_unico', 'Cad. Único', 'text', 'Número do Cadastro Único (governo).')
  ];

  global.PROAME_SEED = {
    session: false,

    consentText: 'Li e concordo com o uso dos meus dados pessoais pelo PROAME para fins de inscrição e contato, conforme a Lei Geral de Proteção de Dados (LGPD).',

    pages: {
      home: {
        heroTitle: 'Amor e esperança em Gama (DF)',
        heroText: 'Identificamos vulnerabilidades sociais de idosos, mulheres e crianças e oferecemos condições para uma vida mais digna.',
        missionText: 'Identificar vulnerabilidades sociais de idosos, mulheres e crianças e oferecer condições para uma vida mais digna.'
      },
      quemSomos: {
        body: 'O PROAME – Projeto Amor e Esperança atua em Gama (DF), identificando vulnerabilidades sociais de idosos, mulheres e crianças.\n\nOferecemos cursos profissionalizantes, cestas básicas, esporte, palestras, arte, atendimento odontológico e psicológico e alimentos prontos, sempre buscando condições para uma vida mais digna.'
      }
    },

    consentVersion: 2,
    termHistory: [
      { version: 1, date: '2026-10-02', note: 'Versão inicial do termo.' },
      { version: 2, date: '2026-11-20', note: 'Inclusão da finalidade de contato por WhatsApp.' }
    ],

    admins: [
      { id: 'adm-1', name: 'Ana Ribeiro', role: 'Root', active: true, twoFactor: true, lastAccess: '2026-11-27T11:40:00.000Z', rootUntil: '' },
      { id: 'adm-2', name: 'Pedro Lima', role: 'Admin', active: true, twoFactor: true, lastAccess: '2026-11-25T14:05:00.000Z', rootUntil: '' },
      { id: 'adm-3', name: 'Lúcia Souza', role: 'Admin', active: false, twoFactor: false, lastAccess: '2026-09-30T09:12:00.000Z', rootUntil: '' }
    ],

    smtp: { host: 'smtp.exemplo.org', port: 587, user: 'noreply@exemplo.org', from: 'PROAME <noreply@exemplo.org>', passwordSet: true },
    notifications: { newSignup: true, newOffer: true, newEdital: false },

    auditLog: [
      { at: '2026-11-27T11:40:00.000Z', actor: 'Ana Ribeiro', event: 'Login com verificação em duas etapas' },
      { at: '2026-11-26T16:02:00.000Z', actor: 'Ana Ribeiro', event: 'Exportou CSV de inscrições' },
      { at: '2026-11-22T10:15:00.000Z', actor: 'Ana Ribeiro', event: 'Editou o termo LGPD (versão 2)' },
      { at: '2026-11-21T08:30:00.000Z', actor: 'Ana Ribeiro', event: 'Desativou o administrador Lúcia Souza' },
      { at: '2026-11-10T09:00:00.000Z', actor: 'Pedro Lima', event: 'Ativou a verificação em duas etapas' }
    ],

    releases: [
      { version: '0.2.0', date: '2026-11-27', items: [
        'Logotipo novo e três paletas de cores (A, B e C) para escolha.',
        'Planejamento de segurança: login com código, Roots e auditoria.',
        'Central de ajuda, configurações (e-mail, termo LGPD e notificações) e novidades.'
      ] },
      { version: '0.1.0', date: '2026-11-18', items: [
        'Protótipo inicial: site público, projetos, inscrições, ofertas, editais e páginas.'
      ] }
    ],

    helpTopics: [
      { q: 'Esqueci minha senha ou perdi o celular do código de verificação', a: 'Use o código de recuperação guardado no envelope lacrado ou peça a outro Root para redefinir sua conta. Sem nenhum dos dois, o acesso é recuperado pela equipe de suporte.' },
      { q: 'Como ativar a verificação em duas etapas', a: 'Entre em Administradores, escolha seu nome e ative a verificação. Leia o código no aplicativo autenticador e guarde os códigos de recuperação.' },
      { q: 'Como criar, editar e desativar administradores', a: 'Administradores podem ser desativados, mas não apagados, para preservar o histórico. Root pode tornar um administrador Root por tempo determinado.' },
      { q: 'Root temporário (vou sair de férias)', a: 'Promova um administrador a Root informando a data de fim. Ao vencer, a função volta a Admin automaticamente. Mantenha sempre pelo menos dois Roots ativos.' },
      { q: 'O Root faleceu ou ficou indisponível', a: 'Se restar um Root, ele promove um substituto. Se todos os Roots forem perdidos, use o procedimento de emergência com o envelope de códigos de recuperação.' },
      { q: 'Configurar o e-mail (SMTP) e testar o envio', a: 'Em Configurações, preencha servidor, porta, usuário e senha e clique em “Enviar e-mail de teste”. E-mails de segurança são sempre enviados.' },
      { q: 'Editar o termo de consentimento LGPD', a: 'Cada edição gera uma nova versão. Inscrições antigas continuam válidas com a versão em que foram aceitas.' },
      { q: 'Perdi o notebook ou suspeito de acesso indevido', a: 'Troque a senha, revise a Auditoria, desative o administrador afetado e avise a equipe. Os eventos ficam registrados na Auditoria.' },
      { q: 'Onde ver o que mudou na nova versão', a: 'Em Novidades, no menu do administrador, e no rodapé do site (número da versão).' }
    ],

    pageHelp: {
      '/home': 'Página inicial do site. O texto do banner e a missão são editados em Páginas.',
      '/projeto': 'Detalhes do projeto e formulário de inscrição. Campos com * são obrigatórios. Antes de enviar, leia o termo de consentimento.',
      '/colaborar': 'Formulário para empresas, professores, monitores e seguranças que querem apoiar o PROAME. Os dados são usados apenas para contato.',
      '/admin': 'Resumo das inscrições, ofertas e editais. Use os atalhos para ir direto às áreas que precisam de atenção.',
      '/admin/paginas': 'Textos do site e dados de contato. Use “Testar” para conferir cada link antes de salvar.',
      '/admin/projetos': 'Projetos agendados. Publique um projeto para que ele apareça no site.',
      '/admin/projeto': 'Dados do projeto e formulário de inscrição. O campo “Texto de ajuda” aparece como dica para o beneficiário.',
      '/admin/inscricoes': 'Inscrições recebidas. CadÚnico aparece mascarado na lista; o CSV traz os dados completos.',
      '/admin/ofertas': 'Ofertas de colaboração recebidas do formulário “Como posso colaborar”.',
      '/admin/editais': 'Editais em PDF para a Transparência. Arquivos acima do limite são recusados.',
      '/admin/administradores': 'Quem acessa a área admin. Mantenha pelo menos dois Roots ativos. Administradores são desativados, nunca apagados.',
      '/admin/configuracoes': 'Configurações restritas ao Root: e-mail, termo LGPD e notificações.',
      '/admin/auditoria': 'Registro das ações sensíveis. Os eventos não podem ser editados.',
      '/admin/ajuda': 'Perguntas frequentes sobre acesso, administradores, e-mail e LGPD.',
      '/admin/novidades': 'O que mudou em cada versão do aplicativo.'
    },

    org: {
      name: 'PROAME',
      fullName: 'Projeto Amor e Esperança',
      domain: 'proame.org',
      logoBase: 'assets/logo/logo-full',
      symbolBase: 'assets/logo/logo-symbol'
    },

    contact: {
      address: 'EQ. 21/24, Área Especial Comercial, Setor Oeste, Gama (DF)',
      phone: '+55 (61) 99161-6494',
      whatsapp: '5561991616494',
      email: 'contato@proame.org',
      instagram: '@proame.rede',
      youtube: 'ProameCast'
    },

    services: [
      { id: 'sv-1', title: 'Cursos profissionalizantes', description: 'Qualificação para o mercado de trabalho, com turmas abertas à comunidade.', active: true, sort: 1 },
      { id: 'sv-2', title: 'Cestas básicas', description: 'Entrega de cestas básicas para famílias em vulnerabilidade social.', active: true, sort: 2 },
      { id: 'sv-3', title: 'Esporte', description: 'Atividades esportivas e de dança para crianças, jovens e adultos.', active: true, sort: 3 },
      { id: 'sv-4', title: 'Palestras', description: 'Palestras motivacionais e de orientação social.', active: true, sort: 4 },
      { id: 'sv-5', title: 'Arte', description: 'Oficinas artísticas e culturais.', active: true, sort: 5 },
      { id: 'sv-6', title: 'Atendimento odontológico', description: 'Atendimento odontológico para a comunidade atendida pelo PROAME.', active: true, sort: 6 },
      { id: 'sv-7', title: 'Atendimento psicológico', description: 'Acolhimento e apoio psicológico para beneficiários.', active: true, sort: 7 },
      { id: 'sv-8', title: 'Alimentos prontos', description: 'Distribuição de refeições e alimentos prontos.', active: true, sort: 8 }
    ],

    projectTypes: [
      { id: 'curso', name: 'Curso', color: '#386663' },
      { id: 'esporte', name: 'Esporte / dança', color: '#8a5100' }
    ],

    baseFields: BASE_FIELDS,

    projects: [
      {
        id: 'p-informatica',
        typeId: 'curso',
        title: 'Informática básica para idosos',
        description: 'Curso introdutório de computação e smartphone para pessoas acima de 60 anos.\n\nAs aulas são práticas e em turmas pequenas.',
        location: 'Sede do PROAME, EQ. 21/24, Setor Oeste, Gama (DF)',
        startsAt: '2026-12-05T09:00',
        endsAt: '2026-12-19T11:00',
        capacity: 25,
        signupOpen: true,
        status: 'published',
        photos: [
          { id: 'ph-1a', color: '#386663', caption: 'Turma de informática' },
          { id: 'ph-1b', color: '#8a5100', caption: 'Aula prática' }
        ],
        fields: BASE_FIELDS.concat([
          field('escolaridade', 'Escolaridade', 'select', true, '', ['Fundamental incompleto', 'Fundamental completo', 'Médio incompleto', 'Médio completo', 'Superior']),
          field('possui_celular', 'Possui smartphone ou computador em casa?', 'checkbox', false, 'Marque se possuir.', []),
          field('periodo', 'Período disponível', 'datetime-range', true, 'Informe o intervalo de datas e horários em que você pode participar.', []),
          field('observacoes', 'Alguma observação?', 'textarea', false, '', [])
        ])
      },
      {
        id: 'p-danca',
        typeId: 'esporte',
        title: 'Oficina de dança esportiva',
        description: 'Oficina semanal de dança esportiva para jovens e adultos, com apresentação ao final do ciclo.',
        location: 'Quadra coberta, Setor Oeste, Gama (DF)',
        startsAt: '2027-01-16T08:00',
        endsAt: '2027-03-27T10:00',
        capacity: 40,
        signupOpen: true,
        status: 'published',
        photos: [
          { id: 'ph-2a', color: '#8a5100', caption: 'Ensaio de dança esportiva' }
        ],
        fields: BASE_FIELDS.concat([
          field('data_nascimento', 'Data de nascimento', 'date', true, '', []),
          field('idade', 'Idade', 'number', true, '', []),
          field('responsavel', 'Nome do responsável (menores de 18 anos)', 'text', false, '', []),
          field('tamanho', 'Tamanho da camiseta', 'select', true, '', ['P', 'M', 'G', 'GG']),
          field('horario', 'Horário preferido', 'time', false, '', [])
        ])
      },
      {
        id: 'p-futsal',
        typeId: 'esporte',
        title: 'Campeonato comunitário de futsal',
        description: 'Campeonato entre equipes da comunidade, com jogos aos sábados e premiação simbólica.',
        location: 'Ginásio comunitário, Gama (DF)',
        startsAt: '2027-02-06T08:00',
        endsAt: '2027-02-07T18:00',
        capacity: 60,
        signupOpen: true,
        status: 'published',
        photos: [],
        fields: BASE_FIELDS.concat([
          field('equipe', 'Nome da equipe', 'text', true, '', []),
          field('email_capitao', 'E-mail do capitão', 'email', false, '', [])
        ])
      },
      {
        id: 'p-costura',
        typeId: 'curso',
        title: 'Curso de costura e artesanato',
        description: 'Curso de costura básica e artesanato. Projeto em fase de planejamento.',
        location: 'Sede do PROAME, EQ. 21/24, Setor Oeste, Gama (DF)',
        startsAt: '2027-03-20T14:00',
        endsAt: '2027-05-22T16:00',
        capacity: 20,
        signupOpen: false,
        status: 'draft',
        photos: [],
        fields: BASE_FIELDS.concat([
          field('experiencia', 'Nível de experiência com costura', 'select', true, '', ['Nenhuma', 'Básica', 'Intermediária'])
        ])
      }
    ],

    editais: [
      { id: 'ed-1', number: '001/2026', title: 'Seleção de beneficiários para cursos de capacitação profissional', date: '2026-10-15', deadline: '2026-12-15', status: 'published', fileName: null, dataUrl: null },
      { id: 'ed-2', number: '002/2026', title: 'Chamamento para parceiros de cestas básicas', date: '2026-11-03', deadline: '2026-12-31', status: 'published', fileName: null, dataUrl: null },
      { id: 'ed-3', number: '003/2025', title: 'Edital de prestação de contas do exercício de 2025', date: '2025-06-10', deadline: '', status: 'archived', fileName: null, dataUrl: null }
    ],

    signups: [
      {
        id: 's-1',
        projectId: 'p-informatica',
        status: 'Nova',
        createdAt: '2026-11-22T10:15:00.000Z',
        consent: true,
        consentText: 'Exemplo de consentimento registrado.',
        answers: [
          answer('nome', 'Nome', 'Maria Exemplo'),
          answer('endereco', 'Endereço', 'Rua Exemplo, 10, Gama (DF)'),
          answer('telefone', 'Telefone', '(61) 90000-1111'),
          answer('cad_unico', 'Cad. Único', '123456789'),
          answer('escolaridade', 'Escolaridade', 'Médio completo'),
          answer('possui_celular', 'Possui smartphone ou computador em casa?', 'Sim'),
          answer('periodo', 'Período disponível', '05/12/2026 às 09:00 até 19/12/2026 às 11:00'),
          answer('observacoes', 'Alguma observação?', '')
        ]
      },
      {
        id: 's-2',
        projectId: 'p-danca',
        status: 'Confirmada',
        createdAt: '2026-11-23T16:40:00.000Z',
        consent: true,
        consentText: 'Exemplo de consentimento registrado.',
        answers: [
          answer('nome', 'Nome', 'João Exemplo'),
          answer('endereco', 'Endereço', 'Quadra 5, Conjunto B, Gama (DF)'),
          answer('telefone', 'Telefone', '(61) 90000-2222'),
          answer('cad_unico', 'Cad. Único', '987654321'),
          answer('data_nascimento', 'Data de nascimento', '10/05/2012'),
          answer('idade', 'Idade', '14'),
          answer('responsavel', 'Nome do responsável (menores de 18 anos)', 'Ana Exemplo'),
          answer('tamanho', 'Tamanho da camiseta', 'M'),
          answer('horario', 'Horário preferido', '08:00')
        ]
      }
    ],

    offers: [
      {
        id: 'o-1',
        name: 'Padaria Exemplo Ltda',
        profile: 'Empresa',
        contribution: 'Cesta básica',
        phone: '(61) 90000-3333',
        email: 'contato@exemplo.com',
        observation: 'Podemos doar cestas básicas mensalmente.',
        status: 'Nova',
        createdAt: '2026-11-20T14:30:00.000Z',
        consent: true
      },
      {
        id: 'o-2',
        name: 'Carlos Exemplo',
        profile: 'Professor',
        contribution: 'Formação',
        phone: '(61) 90000-4444',
        email: '',
        observation: 'Tenho disponibilidade às terças e quintas à noite.',
        status: 'Em contato',
        createdAt: '2026-11-18T09:05:00.000Z',
        consent: true
      }
    ]
  };
})(window);
