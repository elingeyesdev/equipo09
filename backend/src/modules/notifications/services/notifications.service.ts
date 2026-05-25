import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async getMyNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.getNotificationsByUserId(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.countUnread(userId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<{ updated: boolean }> {
    const updated = await this.notificationsRepository.markAsRead(notificationId, userId);
    return { updated };
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const updated = await this.notificationsRepository.markAllAsRead(userId);
    return { updated };
  }

  /**
   * Notifica al emprendedor que recibió una nueva inversión
   */
  async notifyInvestmentReceived(params: {
    entrepreneurUserId: string;
    amount: number;
    currency: string;
    campaignTitle: string;
    campaignId: string;
    investmentId: string;
  }): Promise<void> {
    await this.notificationsRepository.createNotification({
      userId: params.entrepreneurUserId,
      typeCode: 'investment_received',
      title: 'Nueva inversión recibida',
      body: `Recibiste una inversión de ${params.amount} ${params.currency} en "${params.campaignTitle}".`,
      referenceType: 'investment',
      referenceId: params.investmentId,
      actionUrl: `/campaigns/${params.campaignId}`,
      data: {
        amount: params.amount,
        currency: params.currency,
        campaign_title: params.campaignTitle,
        campaign_id: params.campaignId,
      },
    });
  }

  /**
   * Notifica al inversor que su inversión fue confirmada
   */
  async notifyInvestmentConfirmed(params: {
    investorUserId: string;
    amount: number;
    currency: string;
    campaignTitle: string;
    campaignId: string;
    investmentId: string;
  }): Promise<void> {
    await this.notificationsRepository.createNotification({
      userId: params.investorUserId,
      typeCode: 'investment_confirmed',
      title: 'Inversión confirmada',
      body: `Tu inversión de ${params.amount} ${params.currency} en "${params.campaignTitle}" fue procesada exitosamente.`,
      referenceType: 'investment',
      referenceId: params.investmentId,
      actionUrl: `/campaign/${params.campaignId}`,
      data: {
        amount: params.amount,
        currency: params.currency,
        campaign_title: params.campaignTitle,
        campaign_id: params.campaignId,
      },
    });
  }

  /**
   * Notifica al emprendedor y a los inversores cuando la campaña alcanzó su meta
   */
  async notifyCampaignFunded(params: {
    entrepreneurUserId: string;
    campaignTitle: string;
    campaignId: string;
    goalAmount: number;
    currency: string;
  }): Promise<void> {
    // Notificar al emprendedor
    await this.notificationsRepository.createNotification({
      userId: params.entrepreneurUserId,
      typeCode: 'campaign_funded',
      title: '¡Campaña financiada!',
      body: `¡Felicidades! Tu campaña "${params.campaignTitle}" alcanzó su meta de ${params.goalAmount} ${params.currency}.`,
      referenceType: 'campaign',
      referenceId: params.campaignId,
      actionUrl: `/entrepreneur-campaigns/${params.campaignId}`,
      data: {
        campaign_title: params.campaignTitle,
        goal_amount: params.goalAmount,
        currency: params.currency,
      },
    });

    // Notificar a todos los inversores de la campaña
    const investorIds = await this.notificationsRepository.getInvestorsByCampaignId(params.campaignId);
    for (const investorId of investorIds) {
      await this.notificationsRepository.createNotification({
        userId: investorId,
        typeCode: 'campaign_funded',
        title: '¡La campaña alcanzó su meta!',
        body: `La campaña "${params.campaignTitle}" en la que invertiste ha alcanzado su meta de financiamiento.`,
        referenceType: 'campaign',
        referenceId: params.campaignId,
        actionUrl: `/campaign/${params.campaignId}`,
        data: {
          campaign_title: params.campaignTitle,
          goal_amount: params.goalAmount,
          currency: params.currency,
        },
      });
    }
  }

  /**
   * Notifica al emprendedor que su campaña fue aprobada
   */
  async notifyCampaignApproved(params: {
    entrepreneurUserId: string;
    campaignTitle: string;
    campaignId: string;
  }): Promise<void> {
    await this.notificationsRepository.createNotification({
      userId: params.entrepreneurUserId,
      typeCode: 'campaign_approved',
      title: '🎉 ¡Campaña aprobada!',
      body: `Tu campaña "${params.campaignTitle}" fue aprobada. ¡Ya puedes publicarla!`,
      referenceType: 'campaign',
      referenceId: params.campaignId,
      actionUrl: `/my-campaigns`,
      data: { campaign_title: params.campaignTitle, campaign_id: params.campaignId },
    });
  }

  /**
   * Notifica al emprendedor que su campaña fue rechazada
   */
  async notifyCampaignRejected(params: {
    entrepreneurUserId: string;
    campaignTitle: string;
    campaignId: string;
    feedback?: string;
  }): Promise<void> {
    await this.notificationsRepository.createNotification({
      userId: params.entrepreneurUserId,
      typeCode: 'campaign_rejected',
      title: '❌ Campaña requiere cambios',
      body: params.feedback
        ? `Tu campaña "${params.campaignTitle}" fue rechazada. Motivo: ${params.feedback}`
        : `Tu campaña "${params.campaignTitle}" necesita cambios. Revisa el feedback del equipo.`,
      referenceType: 'campaign',
      referenceId: params.campaignId,
      actionUrl: `/my-campaigns`,
      data: { campaign_title: params.campaignTitle, campaign_id: params.campaignId, feedback: params.feedback },
    });
  }

  /**
   * Notifica al receptor de un nuevo mensaje de chat
   */
  async notifyNewMessage(params: {
    recipientUserId: string;
    senderName: string;
    senderId: string;
    conversationId: string;
    messagePreview: string;
  }): Promise<void> {
    const preview = params.messagePreview.length > 80
      ? params.messagePreview.substring(0, 80) + '…'
      : params.messagePreview;
    await this.notificationsRepository.createNotification({
      userId: params.recipientUserId,
      typeCode: 'new_message',
      title: `💬 Mensaje de ${params.senderName}`,
      body: preview,
      referenceType: 'conversation',
      referenceId: params.conversationId,
      actionUrl: `/chat/${params.conversationId}`,
      data: {
        sender_name: params.senderName,
        sender_id: params.senderId,
        conversation_id: params.conversationId,
      },
    });
  }
}
