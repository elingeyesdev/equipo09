import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import { Notification, mapRowToNotification } from '../models/notification.model';

@Injectable()
export class NotificationsRepository extends BaseRepository {

  /**
   * Inserta una notificación. Busca el type_id automáticamente por código.
   */
  async createNotification(params: {
    userId: string;
    typeCode: string;
    title: string;
    body: string;
    referenceType?: string;
    referenceId?: string;
    actionUrl?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    await this.query(
      `INSERT INTO notifications (user_id, type_id, title, body, channel, reference_type, reference_id, action_url, data)
       SELECT $1, nt.id, $3, $4, 'in_app', $5, $6, $7, $8
       FROM notification_types nt
       WHERE nt.code = $2
       LIMIT 1`,
      [
        params.userId,
        params.typeCode,
        params.title,
        params.body,
        params.referenceType ?? null,
        params.referenceId ?? null,
        params.actionUrl ?? null,
        JSON.stringify(params.data ?? {}),
      ]
    );
  }

  /**
   * Obtiene las notificaciones de un usuario (más recientes primero)
   */
  async getNotificationsByUserId(userId: string, limit = 30): Promise<Notification[]> {
    const result = await this.query(
      `SELECT n.*, nt.code AS type_code
       FROM notifications n
       LEFT JOIN notification_types nt ON nt.id = n.type_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows.map(mapRowToNotification);
  }

  /**
   * Cuenta notificaciones no leídas del usuario
   */
  async countUnread(userId: string): Promise<number> {
    const result = await this.query(
      `SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0]?.total ?? '0', 10);
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND is_read = false`,
      [notificationId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Marca todas las notificaciones del usuario como leídas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return result.rowCount ?? 0;
  }

  /**
   * Obtiene los user_ids de todos los inversores que han invertido en una campaña
   */
  async getInvestorsByCampaignId(campaignId: string): Promise<string[]> {
    const result = await this.query(
      `SELECT DISTINCT investor_id FROM investments
       WHERE campaign_id = $1 AND status = 'completed'`,
      [campaignId]
    );
    return result.rows.map((r: any) => r.investor_id as string);
  }
}
