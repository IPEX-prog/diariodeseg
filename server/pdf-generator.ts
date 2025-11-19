import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import type { Checklist, ChecklistItem, ChecklistPhoto, ChecklistCategory, ChecklistItemTemplate } from '../drizzle/schema';

interface ChecklistWithItems extends Checklist {
  items: (ChecklistItem & { photos: ChecklistPhoto[] })[];
}

interface CategoryWithTemplates extends ChecklistCategory {
  templates: ChecklistItemTemplate[];
}

export async function generateChecklistPDF(
  checklist: ChecklistWithItems,
  categories: CategoryWithTemplates[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with logo placeholder
      doc.fontSize(20).fillColor('#1a1a1a').text('IPEX CONSTRUTORA', { align: 'center' });
      doc.fontSize(16).fillColor('#4a4a4a').text('Checklist de Segurança', { align: 'center' });
      doc.moveDown();

      // Separator line
      doc.strokeColor('#cccccc').lineWidth(1)
        .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Inspection Info
      doc.fontSize(12).fillColor('#1a1a1a').text('INFORMAÇÕES DA INSPEÇÃO', { underline: true });
      doc.moveDown(0.5);

      const inspectionDate = new Date(checklist.inspectionDate).toLocaleDateString('pt-BR');
      const inspectionType = checklist.inspectionType === 'diaria' ? 'Diária' :
                            checklist.inspectionType === 'semanal' ? 'Semanal' :
                            'Conforme Necessidade';

      doc.fontSize(10).fillColor('#333333');
      doc.text(`Local da Obra: ${checklist.constructionSite}`, { continued: false });
      doc.text(`Data: ${inspectionDate}  |  Hora: ${checklist.inspectionTime}  |  Tipo: ${inspectionType}`);
      doc.text(`Inspetor: ${checklist.inspectorName}  |  Cargo: ${checklist.inspectorRole}`);
      
      if (checklist.weatherConditions) {
        doc.text(`Condições Climáticas: ${checklist.weatherConditions}`);
      }
      if (checklist.workersCount) {
        doc.text(`Número de Trabalhadores: ${checklist.workersCount}`);
      }

      doc.moveDown();
      doc.strokeColor('#cccccc').lineWidth(0.5)
        .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Checklist Items by Category
      for (const category of categories) {
        if (category.templates.length === 0) continue;

        // Category header
        doc.fontSize(14).fillColor('#1a1a1a').text(category.name, { underline: true });
        if (category.description) {
          doc.fontSize(9).fillColor('#666666').text(category.description);
        }
        doc.moveDown(0.5);

        for (const template of category.templates) {
          const item = checklist.items?.find(i => i.templateId === template.id);

          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();
          }

          // Question
          doc.fontSize(10).fillColor('#333333').text(`• ${template.question}`, {
            indent: 10,
          });

          // Status
          if (item?.status) {
            const statusText = item.status === 'conforme' ? '✓ Conforme' :
                             item.status === 'nao_conforme' ? '✗ Não Conforme' :
                             '- N/A';
            const statusColor = item.status === 'conforme' ? '#22c55e' :
                              item.status === 'nao_conforme' ? '#ef4444' :
                              '#94a3b8';
            
            doc.fontSize(9).fillColor(statusColor).text(`   ${statusText}`, { indent: 20 });
          } else {
            doc.fontSize(9).fillColor('#94a3b8').text('   Não avaliado', { indent: 20 });
          }

          // Observations
          if (item?.observations) {
            doc.fontSize(9).fillColor('#666666').text(`   Obs: ${item.observations}`, {
              indent: 20,
              width: 480,
            });
          }

          // Corrective actions
          if (item?.correctiveAction) {
            doc.fontSize(9).fillColor('#d97706').text(`   Ação Corretiva: ${item.correctiveAction}`, {
              indent: 20,
              width: 480,
            });
            if (item.responsible) {
              doc.text(`   Responsável: ${item.responsible}`, { indent: 20 });
            }
            if (item.deadline) {
              const deadlineDate = new Date(item.deadline).toLocaleDateString('pt-BR');
              doc.text(`   Prazo: ${deadlineDate}`, { indent: 20 });
            }
          }

          // Photos count
          if (item?.photos && item.photos.length > 0) {
            doc.fontSize(8).fillColor('#3b82f6').text(`   📷 ${item.photos.length} foto(s) anexada(s)`, {
              indent: 20,
            });
          }

          doc.moveDown(0.3);
        }

        doc.moveDown();
      }

      // General observations
      if (checklist.generalObservations) {
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.fontSize(12).fillColor('#1a1a1a').text('OBSERVAÇÕES GERAIS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#333333').text(checklist.generalObservations, {
          width: 495,
          align: 'justify',
        });
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8).fillColor('#999999').text(
        `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.fontSize(7).fillColor('#999999').text(
        'Conforme normas PBQP-H e NR-18',
        50,
        doc.page.height - 35,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
