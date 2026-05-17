import { Injectable, NotFoundException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { InvestmentsRepository } from '../repositories/investments.repository';
import { InvestmentDto } from '../dto/investment.dto';
import { InvestmentResult, InvestmentHistoryItem } from '../models/investment.model';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class InvestmentsService {
  constructor(
    private readonly investmentsRepository: InvestmentsRepository,
    private readonly notificationsService: NotificationsService,
  ) { }

  /**
   * Crea una nueva inversión y dispara notificaciones al terminar
   */
  async createInvestment(userId: string, dto: InvestmentDto): Promise<InvestmentResult> {
    return this.investmentsRepository.createInvestmentTransaction(
      userId,
      dto,
      async (params) => {
        // Notificar al emprendedor: nueva inversión recibida
        await this.notificationsService.notifyInvestmentReceived({
          entrepreneurUserId: params.entrepreneurUserId,
          amount: params.amount,
          currency: params.campaignCurrency,
          campaignTitle: params.campaignTitle,
          campaignId: params.campaignId,
          investmentId: params.investmentId,
        });

        // Notificar al inversor: inversión confirmada
        await this.notificationsService.notifyInvestmentConfirmed({
          investorUserId: params.investorUserId,
          amount: params.amount,
          currency: params.campaignCurrency,
          campaignTitle: params.campaignTitle,
          campaignId: params.campaignId,
          investmentId: params.investmentId,
        });

        // Si la campaña alcanzó su meta: notificar a todos los involucrados
        if (params.isFunded) {
          await this.notificationsService.notifyCampaignFunded({
            entrepreneurUserId: params.entrepreneurUserId,
            campaignTitle: params.campaignTitle,
            campaignId: params.campaignId,
            goalAmount: params.goalAmount,
            currency: params.campaignCurrency,
          });
        }
      },
    );
  }

  /**
   * Obtiene el historial de inversiones de un usuario
   */
  async getMyInvestments(userId: string): Promise<InvestmentHistoryItem[]> {
    return this.investmentsRepository.getInvestmentsByUserId(userId, 50, 0);
  }

  /**
   * Genera el PDF del comprobante de inversión
   */
  async generateReceiptPdf(userId: string, investmentId: string): Promise<PassThrough> {
    const details = await this.investmentsRepository.getInvestmentDetails(userId, investmentId);
    if (!details) {
      throw new NotFoundException('Inversión no encontrada o no pertenece a este usuario.');
    }

    // Configurar el documento sin márgenes iniciales para poder pintar la cabecera de lado a lado
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const stream = new PassThrough();
    doc.pipe(stream);

    // Paleta de colores de la aplicación (basada en el frontend)
    const primaryGreen = '#2e7d32';
    const darkGreen = '#1c2b1e';
    const accentEmerald = '#00897b';
    const bgApp = '#f4f7f4';
    const limeDeco = '#aed581';

    // Cabecera con fondo verde
    doc.rect(0, 0, doc.page.width, 140).fill(primaryGreen);
    
    // Título en la cabecera
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('CROWDFUNDING', 0, 50, { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Comprobante Oficial de Inversión', 0, 85, { align: 'center' });
    
    // Línea decorativa
    doc.rect(0, 135, doc.page.width, 5).fill(limeDeco);

    // Ajustar márgenes para el resto del documento
    const marginX = 50;
    let currentY = 180;

    // Función auxiliar para dibujar secciones
    const drawSectionTitle = (title: string, y: number) => {
      doc.fillColor(primaryGreen).fontSize(16).font('Helvetica-Bold').text(title, marginX, y);
      doc.moveTo(marginX, y + 22).lineTo(doc.page.width - marginX, y + 22).lineWidth(1.5).stroke(accentEmerald);
      return y + 40;
    };

    const drawRow = (label: string, value: string, y: number, isBoldValue: boolean = false) => {
      doc.fillColor(darkGreen).fontSize(11).font('Helvetica-Bold').text(label, marginX, y);
      doc.fillColor(darkGreen).fontSize(11).font(isBoldValue ? 'Helvetica-Bold' : 'Helvetica').text(value, marginX + 160, y, {
        width: doc.page.width - marginX * 2 - 160,
        align: 'left'
      });
      // Calcular el salto de línea necesario si el texto es muy largo
      const height = doc.heightOfString(value, { width: doc.page.width - marginX * 2 - 160 });
      return y + Math.max(25, height + 10);
    };

    // Detalles del Inversor
    currentY = drawSectionTitle('Datos del Inversor', currentY);
    const investorName = details.investor_first_name ? `${details.investor_first_name} ${details.investor_last_name || ''}` : 'Usuario Anónimo';
    currentY = drawRow('Nombre:', investorName, currentY);
    currentY = drawRow('Correo Electrónico:', details.investor_email, currentY);
    
    currentY += 15;

    // Detalles de la Inversión
    currentY = drawSectionTitle('Detalles de la Operación', currentY);
    currentY = drawRow('ID de Transacción:', details.investment_id, currentY);
    currentY = drawRow('Fecha:', new Date(details.investment_date).toLocaleString(), currentY);
    currentY = drawRow('Campaña:', `${details.campaign_title} (${details.campaign_type.toUpperCase()})`, currentY);
    if (details.reward_title) {
      currentY = drawRow('Recompensa:', details.reward_title, currentY);
    }
    currentY = drawRow('Estado:', details.investment_status.toUpperCase(), currentY, true);

    currentY += 25;

    // Resumen Financiero
    currentY = drawSectionTitle('Resumen Financiero', currentY);
    
    // Caja de fondo para el monto
    doc.rect(marginX, currentY, doc.page.width - marginX * 2, 70).fill(bgApp);
    doc.fillColor(darkGreen).fontSize(14).font('Helvetica-Bold').text('Monto Invertido', marginX + 25, currentY + 28);
    doc.fillColor(primaryGreen).fontSize(22).font('Helvetica-Bold').text(`$${Number(details.amount).toLocaleString()} ${details.currency}`, marginX, currentY + 23, { align: 'right', width: doc.page.width - marginX * 2 - 25 });

    // Pie de página
    doc.fillColor('grey').fontSize(9).font('Helvetica-Oblique').text(
      'Este documento es un comprobante digital generado automáticamente y no requiere firma manuscrita.', 
      marginX, 
      doc.page.height - 70, 
      { align: 'center', width: doc.page.width - marginX * 2 }
    );

    doc.end();

    return stream;
  }
}
