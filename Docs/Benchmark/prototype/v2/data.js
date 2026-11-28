/* PROAME v2 prototype - trimmed seed (copied from ../data.js, reduced). Plain script, works from file://. */
(function (global) {
  'use strict';

  function field(key, label, type, required, hint, help, options) {
    return { key: key, label: label, type: type, required: required, hint: hint, help: help, options: options || [] };
  }

  var BASE_FIELDS = [
    field('nome', 'Nome completo', 'text', true, 'Como consta no seu documento.', 'Use nome e sobrenome. Não abrevie.'),
    field('endereco', 'Endereço', 'text', true, 'Rua, número e setor.', 'Informe onde você mora hoje, para podermos encontrar você.'),
    field('telefone', 'Telefone com WhatsApp', 'tel', true, 'Somente números com DDD.', 'Usamos este número para confirmar a vaga. Não enviamos mensagens de propaganda.'),
    field('cad_unico', 'Número do Cadastro Único', 'text', true, 'Está no seu cartão ou extrato do CadÚnico.', 'O CadÚnico é o cadastro do governo federal. Se não tiver, a equipe orienta você depois.')
  ];

  global.PROAME_V2_SEED = {
    org: {
      name: 'PROAME',
      fullName: 'Projeto Amor e Esperança',
      logo: '../assets/logo/logo-full',
      logoLight: '../assets/logo/logo-light',
      symbol: '../assets/logo/logo-symbol',
      address: 'EQ. 21/24, Área Especial Comercial, Setor Oeste, Gama (DF)',
      phone: '+55 (61) 99161-6494',
      email: 'contato@proame.org'
    },

    home: {
      heroTitle: 'Amor e esperança em Gama (DF)',
      heroText: 'Identificamos vulnerabilidades sociais de idosos, mulheres e crianças e oferecemos condições para uma vida mais digna.'
    },

    helpOffers: [
      { id: 'financeiro', title: 'Financeiro', text: 'Uma doação mensal ou pontual ajuda a manter os cursos e as cestas.' },
      { id: 'cesta', title: 'Cesta básica', text: 'Doe alimentos ou apoie a compra de cestas para famílias atendidas.' },
      { id: 'servico', title: 'Mão de obra', text: 'Profissionais podem oferecer horas de trabalho voluntário nas oficinas.' },
      { id: 'formacao', title: 'Formação', text: 'Quem tem conhecimento pode ministrar palestras ou cursos.' }
    ],

    consentText: 'Li e concordo com o uso dos meus dados pessoais pelo PROAME para fins de inscrição e contato, conforme a Lei Geral de Proteção de Dados (LGPD).',

    helpTopics: [
      { q: 'Quem pode se inscrever?', a: 'Moradores de Gama (DF) que se encaixam no perfil de cada projeto. Cada projeto informa os requisitos na própria página.' },
      { q: 'Meus dados ficam seguros?', a: 'Sim. Seus dados são usados apenas para a inscrição e ficam restritos à equipe do PROAME.' },
      { q: 'Preciso pagar algo?', a: 'Não. Os projetos são gratuitos. Desconfie de qualquer cobrança em nome do PROAME.' }
    ],

    projects: [
      {
        id: 'p-informatica',
        type: 'Curso',
        title: 'Informática básica para idosos',
        description: 'Curso introdutório de computação e smartphone para pessoas acima de 60 anos. As aulas são práticas e em turmas pequenas.',
        location: 'Sede do PROAME, EQ. 21/24, Setor Oeste, Gama (DF)',
        startsAt: '2026-12-05',
        endsAt: '2026-12-19',
        time: '09:00 às 11:00',
        capacity: 25,
        signupOpen: true,
        fields: BASE_FIELDS.concat([
          field('escolaridade', 'Escolaridade', 'select', true, 'Escolha a opção mais próxima.', 'Não afeta a sua vaga. Serve para planejarmos o ritmo das aulas.', ['Fundamental incompleto', 'Fundamental completo', 'Médio incompleto', 'Médio completo', 'Superior']),
          field('possui_celular', 'Tem smartphone ou computador em casa?', 'checkbox', false, 'Marque se tiver.', 'Quem não tem equipamento pode usar os das aulas.'),
          field('observacoes', 'Alguma observação?', 'textarea', false, 'Opcional.', 'Conte algo que a equipe deva saber, como mobilidade ou horário.')
        ])
      },
      {
        id: 'p-danca',
        type: 'Esporte / dança',
        title: 'Oficina de dança esportiva',
        description: 'Oficina semanal para jovens e adultos, com apresentação ao final do ciclo.',
        location: 'Quadra coberta, Setor Oeste, Gama (DF)',
        startsAt: '2027-01-16',
        endsAt: '2027-03-27',
        time: '08:00 às 10:00',
        capacity: 40,
        signupOpen: true,
        fields: BASE_FIELDS.concat([
          field('data_nascimento', 'Data de nascimento', 'date', true, 'Formato dia/mês/ano.', 'Usamos a data para formar as turmas por faixa etária.'),
          field('responsavel', 'Nome do responsável (menores de 18 anos)', 'text', false, 'Só se a pessoa inscrita for menor.', 'Obrigatório para menores. O responsável assina a autorização de participação.'),
          field('tamanho', 'Tamanho da camiseta', 'select', true, 'Para a camiseta da apresentação.', 'A camiseta é entregue no primeiro dia de aula.', ['P', 'M', 'G', 'GG'])
        ])
      },
      {
        id: 'p-futsal',
        type: 'Esporte / dança',
        title: 'Campeonato comunitário de futsal',
        description: 'Campeonato entre equipes da comunidade, com jogos aos sábados e premiação simbólica.',
        location: 'Ginásio comunitário, Gama (DF)',
        startsAt: '2027-02-06',
        endsAt: '2027-02-07',
        time: '08:00 às 18:00',
        capacity: 60,
        signupOpen: true,
        fields: BASE_FIELDS.concat([
          field('equipe', 'Nome da equipe', 'text', true, 'Como a equipe será chamada nos jogos.', 'Use um nome curto, com até 20 letras.')
        ])
      }
    ],

    statuses: ['Nova', 'Confirmada', 'Lista de espera', 'Recusada'],

    signups: [
      { id: 's-1', projectId: 'p-informatica', status: 'Nova', createdAt: '2026-11-22T10:15:00', name: 'Maria Exemplo', phone: '(61) 90000-1111', cadUnico: '123456789', answers: { escolaridade: 'Médio completo', possui_celular: 'Sim' } },
      { id: 's-2', projectId: 'p-danca', status: 'Confirmada', createdAt: '2026-11-23T16:40:00', name: 'João Exemplo', phone: '(61) 90000-2222', cadUnico: '987654321', answers: { tamanho: 'M' } },
      { id: 's-3', projectId: 'p-informatica', status: 'Lista de espera', createdAt: '2026-11-24T09:05:00', name: 'Ana Ferreira', phone: '(61) 90000-3333', cadUnico: '555111222', answers: { escolaridade: 'Fundamental completo' } },
      { id: 's-4', projectId: 'p-futsal', status: 'Recusada', createdAt: '2026-11-25T14:20:00', name: 'Carlos Lima', phone: '(61) 90000-4444', cadUnico: '444333222', answers: {} },
      { id: 's-5', projectId: 'p-danca', status: 'Nova', createdAt: '2026-11-26T11:30:00', name: 'Lúcia Souza', phone: '(61) 90000-5555', cadUnico: '777888999', answers: { tamanho: 'G' } },
      { id: 's-6', projectId: 'p-futsal', status: 'Nova', createdAt: '2026-11-26T18:45:00', name: 'Rafael Costa', phone: '(61) 90000-6666', cadUnico: '222333444', answers: {} }
    ]
  };
})(window);
