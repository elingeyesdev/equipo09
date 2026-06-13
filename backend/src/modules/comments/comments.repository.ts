import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { randomUUID } from 'crypto';

export interface CampaignComment {
  id: string;
  campaignId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  likesCount: number;
  createdAt: Date;
}

@Injectable()
export class CommentsRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}


  /**
   * Lista comentarios de una campaña, ordenados por fecha desc.
   * Incluye si el usuario actual ya le dio like (si se pasa userId).
   */
  async findByCampaign(campaignId: string, userId?: string): Promise<any[]> {
    const query = `
      SELECT
        cc.id,
        cc.campaign_id      AS campaignId,
        cc.author_id        AS authorId,
        cc.content,
        cc.likes_count      AS likesCount,
        cc.created_at       AS createdAt,
        COALESCE(ip.display_name, CONCAT(ip.first_name, ' ', ip.last_name),
                 ep.display_name, CONCAT(ep.first_name, ' ', ep.last_name),
                 u.email) AS authorName,
        COALESCE(ip.avatar_url, ep.avatar_url) AS authorAvatar,
        ${userId ? `EXISTS(
          SELECT 1 FROM comment_likes cl
          WHERE cl.comment_id = cc.id AND cl.user_id = ?
        )` : 'false'} AS likedByMe
      FROM campaign_comments cc
      JOIN users u ON cc.author_id = u.id
      LEFT JOIN investor_profiles    ip ON ip.user_id    = u.id
      LEFT JOIN entrepreneur_profiles ep ON ep.user_id   = u.id
      WHERE cc.campaign_id = ?
        AND cc.is_deleted  = false
      ORDER BY cc.created_at DESC
      LIMIT 100
    `;
    const params = userId ? [campaignId, userId] : [campaignId];
    const [rows] = await this.pool.execute(query, params);
    return rows as any[];
  }

  /** Crea un nuevo comentario */
  async create(campaignId: string, authorId: string, content: string): Promise<any> {
    const commentId = randomUUID();
    await this.pool.execute(
      `INSERT INTO campaign_comments (id, campaign_id, author_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [commentId, campaignId, authorId, content.trim()],
    );

    const query = `
      SELECT
        cc.id,
        cc.campaign_id      AS campaignId,
        cc.author_id        AS authorId,
        cc.content,
        cc.likes_count      AS likesCount,
        cc.created_at       AS createdAt,
        COALESCE(ip.display_name, CONCAT(ip.first_name, ' ', ip.last_name),
                 ep.display_name, CONCAT(ep.first_name, ' ', ep.last_name),
                 u.email) AS authorName,
        COALESCE(ip.avatar_url, ep.avatar_url) AS authorAvatar,
        false AS likedByMe
      FROM campaign_comments cc
      JOIN users u ON cc.author_id = u.id
      LEFT JOIN investor_profiles    ip ON ip.user_id    = u.id
      LEFT JOIN entrepreneur_profiles ep ON ep.user_id   = u.id
      WHERE cc.id = ?
    `;
    const [rows] = await this.pool.execute(query, [commentId]);
    return (rows as any[])[0];
  }

  /** Toggle like: si ya existe lo elimina, si no lo crea. Devuelve nuevo conteo. */
  async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const [existing] = await this.pool.execute(
      `SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
      [commentId, userId],
    );

    let liked: boolean;
    if ((existing as any[]).length > 0) {
      await this.pool.execute(
        `DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
        [commentId, userId],
      );
      await this.pool.execute(
        `UPDATE campaign_comments SET likes_count = GREATEST(0, likes_count - 1), updated_at = NOW() WHERE id = ?`,
        [commentId],
      );
      liked = false;
    } else {
      const likeId = randomUUID();
      await this.pool.execute(
        `INSERT IGNORE INTO comment_likes (id, comment_id, user_id, created_at) VALUES (?, ?, ?, NOW())`,
        [likeId, commentId, userId],
      );
      await this.pool.execute(
        `UPDATE campaign_comments SET likes_count = likes_count + 1, updated_at = NOW() WHERE id = ?`,
        [commentId],
      );
      liked = true;
    }

    const [countResult] = await this.pool.execute(
      `SELECT likes_count FROM campaign_comments WHERE id = ?`,
      [commentId],
    );
    return { liked, likesCount: Number((countResult as any[])[0]?.likes_count ?? 0) };
  }
}
