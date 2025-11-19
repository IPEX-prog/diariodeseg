import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const categoriesData = [
  { name: "Programas e Documentação", description: "GRO, PGR, PCMSO e documentação de segurança", templates: [
    "Canteiro possui Programa de Gerenciamento de Riscos (PGR) elaborado?",
    "Projeto elétrico das instalações temporárias existe?",
    "Projeto dos sistemas de proteção coletiva existe?",
    "EPIs adequados disponíveis para todos os trabalhadores?",
    "PCMSO elaborado e implementado?",
    "ASO de todos os trabalhadores em dia?"
  ]},
  { name: "Condições do Canteiro", description: "Áreas de vivência, sinalização, ordem e limpeza", templates: [
    "Instalações sanitárias adequadas e limpas?",
    "Vestiários em condições adequadas?",
    "Refeitório limpo e organizado?",
    "Água potável disponível?",
    "Sinalização de segurança adequada?",
    "Canteiro organizado e materiais armazenados adequadamente?",
    "Vias de circulação desobstruídas?"
  ]},
  { name: "Equipamentos e Ferramentas", description: "Máquinas, equipamentos e ferramentas", templates: [
    "Máquinas com proteções adequadas?",
    "Manutenção preventiva em dia?",
    "Operadores habilitados?",
    "Ferramentas em bom estado?",
    "Guindastes e elevadores com inspeção em dia?"
  ]},
  { name: "Trabalho em Altura", description: "Proteção contra quedas e EPIs", templates: [
    "Guarda-corpo instalado em todas as bordas?",
    "Redes de proteção instaladas?",
    "Telas de proteção em fachadas?",
    "Cintos de segurança/trava-quedas disponíveis?",
    "Pontos de ancoragem adequados?",
    "Escadas em bom estado com proteções laterais?"
  ]},
  { name: "Instalações Elétricas", description: "Quadros, fiação e iluminação", templates: [
    "Quadros elétricos aterrados?",
    "Proteção contra intempéries?",
    "Cabos em bom estado?",
    "Iluminação adequada em todas as áreas?"
  ]},
  { name: "Prevenção de Incêndios", description: "Extintores e rotas de fuga", templates: [
    "Extintores em quantidade adequada?",
    "Extintores com carga válida?",
    "Rotas de fuga desobstruídas?",
    "Sinalização de saída de emergência?"
  ]},
  { name: "Movimentação de Materiais", description: "Transporte manual e mecânico", templates: [
    "Técnicas adequadas de levantamento?",
    "Limites de peso respeitados?",
    "Equipamentos adequados para transporte mecânico?",
    "Sinalização durante movimentação?"
  ]},
  { name: "Escavações e Fundações", description: "Estabilidade e proteção", templates: [
    "Taludes estáveis?",
    "Escoramento adequado?",
    "Acesso seguro às escavações?",
    "Proteção contra queda de materiais?"
  ]},
  { name: "Sustentabilidade", description: "Gestão de resíduos e conservação", templates: [
    "Segregação de resíduos implementada?",
    "Destinação adequada de resíduos?",
    "Medidas de economia de água?",
    "Eficiência energética implementada?"
  ]},
  { name: "Capacitação", description: "Treinamentos e DDS", templates: [
    "Todos os trabalhadores receberam integração?",
    "Treinamento de NR-18 realizado?",
    "Treinamento de trabalho em altura (NR-35)?",
    "DDS realizado diariamente?"
  ]},
  { name: "Saúde Ocupacional", description: "Controle de exposição e ergonomia", templates: [
    "Controle de ruído implementado?",
    "Controle de poeira?",
    "Proteção contra agentes químicos?",
    "Avaliação ergonômica realizada?"
  ]},
  { name: "Emergências", description: "Primeiros socorros e comunicação", templates: [
    "Kit de primeiros socorros disponível?",
    "Socorristas treinados?",
    "Procedimentos de emergência definidos?",
    "Registro de ocorrências atualizado?"
  ]}
];

async function seed() {
  console.log("Iniciando seed...");
  
  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    console.log(`Categoria: ${cat.name}`);
    
    const result = await db.insert(schema.checklistCategories).values({
      name: cat.name,
      description: cat.description,
      orderIndex: i
    });
    
    const catId = result[0].insertId;
    
    for (let j = 0; j < cat.templates.length; j++) {
      await db.insert(schema.checklistItemTemplates).values({
        categoryId: catId,
        question: cat.templates[j],
        orderIndex: j
      });
    }
    
    console.log(`  ${cat.templates.length} templates`);
  }
  
  console.log("Concluído!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
