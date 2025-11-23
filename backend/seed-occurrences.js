const axios = require('axios');

// Configurações
const API_URL = 'http://localhost:3000';
const NUM_OCCURRENCES = 100;

// Enums
const categories = ['vistoria_ambiental', 'risco_vegetacao', 'incendio_vegetacao', 'outras'];
const origins = ['Processo', 'E-mail/WhatsApp', 'Via Fone', 'Via Ofício', 'Corpo de Bombeiros'];
const teamActions = [
  'Isolamento/Sinalização',
  'Notificação',
  'Elaborar Parecer Técnico',
  'Evacuação',
  'Interdição',
  'Avaliação',
  'Desinterdição',
  'Apoio Logístico'
];
const organisms = [
  'Bombeiros',
  'SAAE',
  'Polícia Ambiental',
  'CPFL',
  'Cetesb',
  'Guarda Municipal',
  'Trânsito',
  'Ação Social'
];
const statuses = ['aberta', 'andamento', 'fechada'];

// Dados realistas
const bairros = [
  'Centro', 'Jardim Europa', 'Vila Industrial', 'Parque das Flores',
  'Jardim América', 'Vila São João', 'Alto da Boa Vista', 'Jardim Tropical',
  'Vila Maria', 'Parque dos Lagos', 'Cidade Nova', 'Jardim Primavera',
  'Vila Operária', 'Parque Residencial', 'Jardim das Acácias', 'Vila Santa Rita',
  'Jardim Paulista', 'Parque Industrial', 'Vila Nova', 'Jardim São Paulo'
];

const ruas = [
  'Rua das Palmeiras', 'Avenida Brasil', 'Rua Santa Cruz', 'Avenida Paulista',
  'Rua São José', 'Rua das Flores', 'Avenida Central', 'Rua do Comércio',
  'Rua Tiradentes', 'Avenida dos Estados', 'Rua XV de Novembro', 'Rua Barão de Mauá',
  'Avenida Independência', 'Rua Marechal Deodoro', 'Rua Santos Dumont', 'Avenida JK',
  'Rua Getúlio Vargas', 'Rua Dom Pedro II', 'Avenida São Paulo', 'Rua Prudente de Morais'
];

const instituicoes = [
  'Prefeitura Municipal',
  'Secretaria do Meio Ambiente',
  'Defesa Civil',
  'Corpo de Bombeiros',
  'Polícia Ambiental',
  'CETESB',
  'SAAE',
  'Secretaria de Obras',
  'Secretaria de Planejamento',
  'Guarda Municipal'
];

const solicitantes = [
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa',
  'Carlos Souza', 'Juliana Almeida', 'Roberto Pereira', 'Fernanda Lima',
  'Marcos Rodrigues', 'Patricia Ferreira', 'Ricardo Martins', 'Camila Rocha',
  'Eduardo Carvalho', 'Luciana Dias', 'Paulo Araújo', 'Beatriz Mendes'
];

const veiculos = [
  'Viatura AB-01',
  'Caminhão Pipa CP-02',
  'Viatura VT-03',
  'Caminhonete CT-04',
  'Van Logística VL-05',
  'Viatura AB-06',
  'Pick-up PK-07'
];

const materiais = [
  'Cones de sinalização, fita zebrada',
  'Extintores, mangueiras',
  'EPI completo, ferramentas',
  'Material de primeiros socorros',
  'Equipamento de combate a incêndio',
  'Ferramentas de corte e poda',
  'Material de isolamento',
  'Equipamento de medição ambiental'
];

// Descrições por categoria
const descricoes = {
  vistoria_ambiental: [
    'Solicitação de vistoria em área com suspeita de contaminação do solo',
    'Vistoria técnica para avaliação de impacto ambiental em terreno baldio',
    'Inspeção em área de preservação permanente com indícios de degradação',
    'Vistoria solicitada por denúncia de descarte irregular de resíduos',
    'Avaliação técnica de área para licenciamento ambiental',
    'Vistoria em área de manancial com risco de poluição',
    'Inspeção técnica em área verde urbana com indícios de desmatamento',
    'Vistoria para avaliar condições ambientais de loteamento',
    'Avaliação de área com denúncia de queimada irregular',
    'Inspeção em área industrial com suspeita de contaminação'
  ],
  risco_vegetacao: [
    'Árvore com risco de queda em via pública, necessário poda emergencial',
    'Vegetação em risco sobre fiação elétrica, necessário intervenção urgente',
    'Galhos secos com risco iminente de queda sobre residências',
    'Árvore inclinada apresentando risco à estrutura de imóvel',
    'Necessária avaliação de risco de queda de árvores em parque municipal',
    'Vegetação invasora causando danos à estrutura de contenção',
    'Árvore de grande porte com raízes comprometendo calçada e muro',
    'Risco de queda de árvore em área escolar',
    'Vegetação obstruindo sinalização de trânsito',
    'Árvore com cupim apresentando risco estrutural'
  ],
  incendio_vegetacao: [
    'Incêndio em vegetação de médio porte em área de mata',
    'Foco de incêndio em terreno baldio com vegetação seca',
    'Queimada urbana próxima a residências, necessário combate imediato',
    'Incêndio em área verde próximo a escola municipal',
    'Foco de incêndio em APP próximo a corpo d\'água',
    'Queimada em lote vago ameaçando propriedades adjacentes',
    'Incêndio em mata ciliar necessitando intervenção urgente',
    'Fogo em vegetação próximo a rede elétrica',
    'Incêndio de grandes proporções em área rural',
    'Queimada irregular em terreno particular'
  ],
  outras: [
    'Denúncia de poluição sonora por atividade comercial',
    'Vazamento de produto químico em via pública',
    'Acidente ambiental envolvendo transporte de produtos perigosos',
    'Mortandade de peixes em corpo d\'água',
    'Denúncia de maus-tratos a animais em propriedade rural',
    'Ocorrência de deslizamento de terra em área urbana',
    'Rompimento de adutora com risco ambiental',
    'Derramamento de óleo em via pública',
    'Alagamento com risco de contaminação ambiental',
    'Denúncia de atividade poluidora irregular'
  ]
};

const reportsDetalhados = {
  vistoria_ambiental: [
    'Realizada vistoria completa na área indicada. Constatado indícios de contaminação superficial do solo. Coletadas amostras para análise laboratorial. Área isolada preventivamente. Solicitada interdição parcial até resultado das análises.',
    'Equipe realizou inspeção detalhada. Identificada vegetação nativa preservada, porém com sinais de degradação recente. Registradas coordenadas GPS dos pontos críticos. Elaborado parecer técnico recomendando recuperação da área.',
    'Vistoria técnica realizada. Constatado descarte irregular de aproximadamente 2m³ de entulho e resíduos diversos. Área fotografada e documentada. Acionado setor de limpeza urbana para remoção. Iniciado processo de identificação do responsável.',
  ],
  risco_vegetacao: [
    'Equipe técnica avaliou o exemplar arbóreo. Constatado risco iminente de queda devido à inclinação acentuada e comprometimento do sistema radicular. Realizada poda emergencial de segurança. Programado monitoramento quinzenal.',
    'Realizada avaliação técnica. Identificada vegetação em contato com rede elétrica de média tensão. Acionada concessionária de energia. Realizado isolamento preventivo da área. Programada poda técnica para próxima semana.',
    'Inspeção revelou árvore de grande porte com sinais de ataque por cupins. Realizada análise de risco estrutural. Constatada necessidade de supressão. Iniciado processo administrativo para autorização de corte.',
  ],
  incendio_vegetacao: [
    'Equipe de combate acionada às 14h30. Incêndio controlado após 2h de trabalho. Área aproximada de 500m² de vegetação atingida. Realizado rescaldo e monitoramento. Não houve danos a edificações. Brigadista permaneceu no local por 4h adicionais.',
    'Combate iniciado imediatamente. Foco de incêndio em vegetação seca. Utilizado abafador e água. Área isolada e sinalizada. Incêndio extinto em aproximadamente 45 minutos. Acionada perícia para investigação da causa.',
    'Grande mobilização de equipes. Incêndio de proporções consideráveis atingiu aproximadamente 3 hectares. Utilizados 2 caminhões-pipa. Combate durou 5h. Realizado monitoramento por 12h. Não houve vítimas.',
  ],
  outras: [
    'Atendida ocorrência de vazamento. Equipe técnica realizou contenção do produto. Acionado corpo de bombeiros e defesa civil. Área isolada. Realizada absorção do material com serragem. Coletado para descarte adequado.',
    'Equipe realizou vistoria no local. Constatada situação de risco ambiental. Acionados órgãos competentes. Realizado registro fotográfico completo. Elaborado relatório técnico detalhado para encaminhamento ao Ministério Público.',
    'Atendimento emergencial. Situação controlada pela equipe técnica. Realizadas medidas de contenção e mitigação. Área monitorada. Não houve necessidade de evacuação. Emitido auto de infração.',
  ]
};

// Função auxiliar para gerar data aleatória entre duas datas
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Função auxiliar para adicionar horas a uma data
function addHours(date, hours) {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}

// Função para obter elemento aleatório de um array
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Função para gerar número de telefone
function randomPhone() {
  const ddd = ['11', '12', '13', '14', '15', '16', '17', '18', '19'];
  return `(${randomChoice(ddd)}) ${9}${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Função para gerar coordenadas (São Carlos - SP aproximadamente)
function randomCoordinates() {
  return {
    latitude: -22.0 + (Math.random() * 0.1 - 0.05),
    longitude: -47.89 + (Math.random() * 0.1 - 0.05),
    altitude: 850 + Math.floor(Math.random() * 100)
  };
}

// Função para fazer login e obter token
async function login() {
  try {
    console.log('Realizando login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'senha123'
    });
    console.log('Login realizado com sucesso!');
    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao fazer login:', error.response?.data || error.message);
    throw error;
  }
}

// Função para criar uma ocorrência
async function createOccurrence(token, data) {
  try {
    const response = await axios.post(
      `${API_URL}/occurrences`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error.response?.data || error.message);
    throw error;
  }
}

// Função para gerar uma ocorrência aleatória
function generateOccurrence(index) {
  const category = randomChoice(categories);
  const startDate = randomDate(new Date('2024-01-01'), new Date('2025-10-31'));
  const numOrigins = Math.floor(Math.random() * 3) + 1;
  const selectedOrigins = [];

  for (let i = 0; i < numOrigins; i++) {
    const origin = randomChoice(origins);
    if (!selectedOrigins.includes(origin)) {
      selectedOrigins.push(origin);
    }
  }

  const coords = randomCoordinates();
  const bairro = randomChoice(bairros);
  const rua = randomChoice(ruas);
  const numero = Math.floor(Math.random() * 1000) + 1;

  // Escolher status baseado na data (mais antigas tendem a estar fechadas)
  const daysSinceStart = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
  let status;
  if (daysSinceStart > 180) {
    status = 'fechada';
  } else if (daysSinceStart > 30) {
    status = Math.random() > 0.3 ? 'fechada' : 'andamento';
  } else {
    status = randomChoice(statuses);
  }

  const endDate = status === 'fechada'
    ? addHours(startDate, Math.floor(Math.random() * 48) + 2)
    : null;

  // Gerar ações baseadas na categoria
  const numActions = Math.floor(Math.random() * 3) + 1;
  const actions = [];
  for (let i = 0; i < numActions; i++) {
    actions.push({
      teamAction: randomChoice(teamActions),
      activatedOrganism: Math.random() > 0.5 ? randomChoice(organisms) : undefined
    });
  }

  // Gerar recursos
  const numResources = Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 1 : 0;
  const resources = [];
  for (let i = 0; i < numResources; i++) {
    resources.push({
      vehicle: Math.random() > 0.3 ? randomChoice(veiculos) : undefined,
      materials: Math.random() > 0.3 ? randomChoice(materiais) : undefined
    });
  }

  const occurrence = {
    sspdsNumber: Math.random() > 0.5 ? `SSPDS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}` : undefined,
    startDateTime: startDate.toISOString(),
    endDateTime: endDate ? endDate.toISOString() : undefined,
    origins: selectedOrigins,
    cobradeCode: Math.random() > 0.5 ? `${Math.floor(Math.random() * 9000) + 1000}` : undefined,
    isConfidential: Math.random() > 0.9,
    category: category,
    subcategory: category === 'incendio_vegetacao' ? randomChoice(['Baixa Intensidade', 'Média Intensidade', 'Alta Intensidade']) : undefined,
    description: randomChoice(descricoes[category]),
    areaType: randomChoice(['Urbana', 'Rural', 'Industrial', 'Residencial', 'Comercial']),
    affectedArea: `${Math.floor(Math.random() * 5000) + 100}m²`,
    temperature: `${Math.floor(Math.random() * 15) + 20}°C`,
    humidity: `${Math.floor(Math.random() * 40) + 40}%`,
    hasWaterBody: Math.random() > 0.7,
    impactType: randomChoice(['Baixo', 'Médio', 'Alto']),
    impactMagnitude: randomChoice(['Pequeno', 'Moderado', 'Grande', 'Muito Grande']),
    requesterName: randomChoice(solicitantes),
    institution: Math.random() > 0.3 ? randomChoice(instituicoes) : undefined,
    phone: randomPhone(),
    location: {
      ...coords,
      address: rua,
      number: String(numero),
      neighborhood: bairro,
      reference: Math.random() > 0.5 ? `Próximo ao ${randomChoice(['Banco do Brasil', 'Supermercado', 'Igreja', 'Escola', 'Posto de Gasolina', 'Praça'])}` : undefined
    },
    actions: actions,
    resources: resources.length > 0 ? resources : undefined,
    detailedReport: status === 'fechada' || status === 'andamento'
      ? randomChoice(reportsDetalhados[category])
      : undefined,
    observations: Math.random() > 0.5
      ? randomChoice([
        'Acionada equipe técnica especializada',
        'Necessário acompanhamento periódico',
        'Situação sob controle',
        'Requer monitoramento contínuo',
        'Solicitada perícia técnica',
        'Encaminhado para análise jurídica'
      ])
      : undefined,
    responsibleAgents: Math.random() > 0.3
      ? randomChoice([
        'Agente João Silva, Agente Maria Santos',
        'Técnico Pedro Oliveira',
        'Equipe Defesa Civil - Coordenador Carlos Souza',
        'Agente Ana Costa, Técnico Roberto Pereira',
        'Supervisor Marcos Rodrigues'
      ])
      : undefined,
    status: status
  };

  return occurrence;
}

// Função principal
async function main() {
  console.log('============================================');
  console.log('Script de Criação em Massa de Ocorrências');
  console.log('============================================\n');

  try {
    // Fazer login
    const token = await login();
    console.log();

    // Criar ocorrências
    console.log(`Criando ${NUM_OCCURRENCES} ocorrências...`);
    console.log();

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < NUM_OCCURRENCES; i++) {
      try {
        const occurrence = generateOccurrence(i);
        const result = await createOccurrence(token, occurrence);
        successCount++;
        console.log(`✓ [${i + 1}/${NUM_OCCURRENCES}] Ocorrência criada: RA ${result.raNumber} - ${occurrence.category}`);

        // Pequeno delay para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        console.error(`✗ [${i + 1}/${NUM_OCCURRENCES}] Erro ao criar ocorrência`);
      }
    }

    console.log();
    console.log('============================================');
    console.log('Resumo da Execução');
    console.log('============================================');
    console.log(`Total de ocorrências: ${NUM_OCCURRENCES}`);
    console.log(`✓ Criadas com sucesso: ${successCount}`);
    console.log(`✗ Erros: ${errorCount}`);
    console.log('============================================');

  } catch (error) {
    console.error('Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar
main();
