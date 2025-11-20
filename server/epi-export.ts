import { EPIChecklist, EPIItem } from "../drizzle/schema";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, TextRun } from "docx";

export function generateEPICSV(checklist: EPIChecklist, items: EPIItem[]): string {
  const headers = ["Nome do EPI", "CA", "Estado de Conservação", "Colaborador", "Observações"];
  const rows = items.map(item => [
    item.epiName,
    item.ca,
    item.conservationState === "novo" ? "Novo" :
    item.conservationState === "parcialmente_utilizado" ? "Parcialmente Utilizado" :
    item.conservationState === "desgaste" ? "Desgaste" : "Descarte",
    item.collaboratorName,
    item.observations || ""
  ]);

  const csvContent = [
    `Checklist de EPI - ${checklist.constructionSite}`,
    `Data: ${new Date(checklist.inspectionDate).toLocaleDateString('pt-BR')} - Hora: ${checklist.inspectionTime}`,
    `Inspetor: ${checklist.inspectorName}`,
    `Status: ${checklist.status === "concluido" ? "Concluído" : "Em Andamento"}`,
    "",
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  return csvContent;
}

export async function generateEPIPDF(checklist: EPIChecklist, items: EPIItem[]): Promise<Buffer> {
  const conservationStateMap: Record<string, string> = {
    "novo": "Novo",
    "parcialmente_utilizado": "Parcialmente Utilizado",
    "desgaste": "Desgaste",
    "descarte": "Descarte"
  };

  const tableRows = [
    new TableRow({
      height: { value: 400, rule: "atLeast" },
      children: [
        new TableCell({ 
          children: [new Paragraph({ text: "Nome do EPI", run: { bold: true } })], 
          width: { size: 25, type: WidthType.PERCENTAGE } 
        }),
        new TableCell({ 
          children: [new Paragraph({ text: "CA", run: { bold: true } })], 
          width: { size: 15, type: WidthType.PERCENTAGE } 
        }),
        new TableCell({ 
          children: [new Paragraph({ text: "Estado", run: { bold: true } })], 
          width: { size: 20, type: WidthType.PERCENTAGE } 
        }),
        new TableCell({ 
          children: [new Paragraph({ text: "Colaborador", run: { bold: true } })], 
          width: { size: 20, type: WidthType.PERCENTAGE } 
        }),
        new TableCell({ 
          children: [new Paragraph({ text: "Observações", run: { bold: true } })], 
          width: { size: 20, type: WidthType.PERCENTAGE } 
        }),
      ],
    })
  ];

  items.forEach(item => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(item.epiName)] }),
          new TableCell({ children: [new Paragraph(item.ca)] }),
          new TableCell({ children: [new Paragraph(conservationStateMap[item.conservationState || "novo"])] }),
          new TableCell({ children: [new Paragraph(item.collaboratorName)] }),
          new TableCell({ children: [new Paragraph(item.observations || "")] }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: "CHECKLIST DE EPI",
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          run: { bold: true }
        }),
        new Paragraph({
          text: `Obra: ${checklist.constructionSite}`,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: `Data: ${new Date(checklist.inspectionDate).toLocaleDateString('pt-BR')} - Hora: ${checklist.inspectionTime}`,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: `Inspetor: ${checklist.inspectorName}${checklist.inspectorRole ? ` (${checklist.inspectorRole})` : ""}`,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: `Status: ${checklist.status === "concluido" ? "Concluído" : "Em Andamento"}`,
          spacing: { after: 300 }
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          }
        }),
        new Paragraph({
          text: "",
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: "IPEX Construtora - Sistema de Checklist de Segurança",
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          border: {
            top: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 }
          }
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
