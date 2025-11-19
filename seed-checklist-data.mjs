import { drizzle } from "drizzle-orm/mysql2";
import { checklistCategories, checklistItemTemplates } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const categories = [
  { name: "Programas e Documentação", description: "GRO, PGR, PCMSO e documentação de segurança" },
  { name: "Condições do Canteiro", description: "Áreas de vivência, sinalização, ordem e limpeza" },
  { name: "Equipamentos e Ferramentas", description: "Máquinas, equipamentos e ferramentas" },
  { name: "Trabalho em Altura", description: "Proteção contra quedas e EPIs" },
  { name: "Instalações Elétricas", description: "Quadros, fiação e iluminação" },
  { name: "Prevenção de Incêndios", description: "Extintores e rotas de fuga" },
  { name: "Movimentação de Materiais", description: "Transporte manual e mecânico" },
  { name: "Escavações e Fundações", description: "Estabilidade e proteção" },
  { name: "Sustentabilidade", description: "Gestão de resíduos e conservação" },
  { name: "Capacitação", description: "Treinamentos e DDS" },
  { name: "Saúde Ocupacional", description: "Controle de exposição e ergonomia" },
  { name: "Emergências", description: "Primeiros socorros e comunicação" }
];

const templates = {
  "Programas e Documentação": [
    "Canteiro possui Programa de Gerenciamento de Riscos (PGR) elaborado?",
    "Projeto elétrico das instalações temporárias existe?",
    "Projeto dos sistemas de proteção coletiva existe?",
    "EPIs adequados disponíveis para todos os trabalhadores?",
    "PCMSO elaborado e implementado?",
    "ASO de todos os trabalhadores em dia?"
  ],
  "Condições do Canteiro": [
    "Instalações sanitárias adequadas e limpas?",
    "Vestiários em condições adequadas?",
    "Refeitório limpo e organizado?",
    "Água potável disponível?",
    "Sinalização de segurança adequada?",
    "Canteiro organizado e materiais armazenados adequadamente?",
    "Vias de circulação desobstruídas?"
  ],
  "Equipamentos e Ferramentas": [
    "Máquinas com proteções adequadas?",
    "Manutenção preventiva em dia?",
    "Operadores habilitados?",
    "Ferramentas em bom estado?",
    "Guindastes e elevadores com inspeção em dia?"
  ],
  "Trabalho em Altura": [
    "Guarda-corpo instalado em todas as bordas?",
    "Redes de proteção instaladas?",
    "Telas de proteção em fachadas?",
    "Cintos de segurança/trava-quedas disponíveis?",
    "Pontos de ancoragem adequados?",
    "Escadas em bom estado com proteções laterais?"
  ],
  "Instalações Elétricas": [
    "Quadros elétricos aterrados?",
    "Proteção contra intempéries?",
    "Cabos em bom estado?",
    "Iluminação adequada em todas as áreas?"
  ],
  "Prevenção de Incêndios": [
    "Extintores em quantidade adequada?",
    "Extintores com carga válida?",
    "Rotas de fuga desobstruídas?",
    "Sinalização de saída de emergência?"
  ],
  "Movimentação de Materiais": [
    "Técnicas adequadas de levantamento?",
    "Limites de peso respeitados?",
    "Equipamentos adequados para transporte mecânico?",
    "Sinalização durante movimentação?"
  ],
  "Escavações e Fundações": [
    "Taludes estáveis?",
    "Escoramento adequado?",
    "Acesso seguro às escavações?",
    "Proteção contra queda de materiais?"
  ],
  "Sustentabilidade": [
    "Segregação de resíduos implementada?",
    "Destinação adequada de resíduos?",
    "Medidas de economia de água?",
    "Eficiência energética implementada?"
  ],
  "Capacitação": [
    "Todos os trabalhadores receberam integração?",
    "Treinamento de NR-18 realizado?",
    "Treinamento de trabalho em altura (NR-35)?",
    "DDS realizado diariamente?"
  ],
  "Saúde Ocupacional": [
    "Controle de ruído implementado?",
    "Controle de poeira?",
    "Proteção contra agentes químicos?",
    "Avaliação ergonômica realizada?"
  ],
  "Emergências": [
    "Kit de primeiros socorros disponível?",
    "Socorristas treinados?",
    "Procedimentos de emergência definidos?",
    "Registro de ocorrências atualizado?"
  ]
};

async function seed() {
  console.log("Iniciando seed de categorias e templates...");
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    console.log(`Inserindo categoria: ${category.name}`);
    
    const [insertedCategory] = await db.insert(checklistCategories).values({
      name: category.name,
      description: category.description,
      orderIndex: i
    });
    
    const categoryId = insertedCategory.insertId;
    const questions = templates[category.name] || [];
    
    for (let j = 0; j < questions.length; j++) {
      await db.insert(checklistItemTemplates).values({
        categoryId: categoryId,
        question: questions[j],
        orderIndex: j
      });
    }
    
    console.log(`  ${questions.length} templates inseridos`);
  }
  
  console.log("Seed concluído!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
