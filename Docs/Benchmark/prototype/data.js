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
