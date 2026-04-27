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

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);

    // Cabecera
    doc.fontSize(20).font('Helvetica-Bold').text('CROWDFUNDING', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Comprobante Oficial de Inversión', { align: 'center' });
    doc.moveDown(2);

    // Detalles del Inversor
    doc.fontSize(14).font('Helvetica-Bold').text('Datos del Inversor');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    const investorName = details.investor_first_name ? `${details.investor_first_name} ${details.investor_last_name || ''}` : 'Usuario Anónimo';
    doc.text(`Nombre: ${investorName}`);
    doc.text(`Correo Electrónico: ${details.investor_email}`);
    doc.moveDown(1.5);

    // Detalles de la Inversión
    doc.fontSize(14).font('Helvetica-Bold').text('Detalles de la Operación');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`ID de Transacción: ${details.investment_id}`);
    doc.text(`Fecha: ${new Date(details.investment_date).toLocaleString()}`);
    doc.text(`Campaña: ${details.campaign_title} (${details.campaign_type.toUpperCase()})`);

    if (details.reward_title) {
      doc.text(`Recompensa Seleccionada: ${details.reward_title}`);
    }

    doc.text(`Estado: ${details.investment_status.toUpperCase()}`);
    doc.moveDown(1.5);

    // Resumen Financiero
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen Financiero');
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text(`Monto Invertido: $${Number(details.amount).toLocaleString()} ${details.currency}`, { align: 'right' });

    doc.moveDown(4);
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('grey').text('Este documento es un comprobante digital generado automáticamente y no requiere firma manuscrita.', { align: 'center' });

    doc.end();

    return stream;
  }
}
