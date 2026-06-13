import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

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
        cc.campaign_id      AS "campaignId",
        cc.author_id        AS "authorId",
        cc.content,
        cc.likes_count      AS "likesCount",
        cc.created_at       AS "createdAt",
        COALESCE(ip.display_name, ip.first_name || ' ' || ip.last_name,
                 ep.display_name, ep.first_name || ' ' || ep.last_name,
                 u.email) AS "authorName",
        COALESCE(ip.avatar_url, ep.avatar_url) AS "authorAvatar",
        ${userId ? `EXISTS(
          SELECT 1 FROM comment_likes cl
          WHERE cl.comment_id = cc.id AND cl.user_id = $2
        )` : 'false'} AS "likedByMe"
      FROM campaign_comments cc
      JOIN users u ON cc.author_id = u.id
      LEFT JOIN investor_profiles    ip ON ip.user_id    = u.id
      LEFT JOIN entrepreneur_profiles ep ON ep.user_id   = u.id
      WHERE cc.campaign_id = $1
        AND cc.is_deleted  = false
      ORDER BY cc.created_at DESC
      LIMIT 100;
    `;
    const params = userId ? [campaignId, userId] : [campaignId];
    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  /** Crea un nuevo comentario */
  async create(campaignId: string, authorId: string, content: string): Promise<any> {
    const insertResult = await this.pool.query(
      `INSERT INTO campaign_comments (campaign_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [campaignId, authorId, content.trim()],
    );
    const commentId = insertResult.rows[0].id;

    const query = `
      SELECT
        cc.id,
        cc.campaign_id      AS "campaignId",
        cc.author_id        AS "authorId",
        cc.content,
        cc.likes_count      AS "likesCount",
        cc.created_at       AS "createdAt",
        COALESCE(ip.display_name, ip.first_name || ' ' || ip.last_name,
                 ep.display_name, ep.first_name || ' ' || ep.last_name,
                 u.email) AS "authorName",
        COALESCE(ip.avatar_url, ep.avatar_url) AS "authorAvatar",
        false AS "likedByMe"
      FROM campaign_comments cc
      JOIN users u ON cc.author_id = u.id
      LEFT JOIN investor_profiles    ip ON ip.user_id    = u.id
      LEFT JOIN entrepreneur_profiles ep ON ep.user_id   = u.id
      WHERE cc.id = $1;
    `;
    const { rows } = await this.pool.query(query, [commentId]);
    return rows[0];
  }

  /** Toggle like: si ya existe lo elimina, si no lo crea. Devuelve nuevo conteo. */
  async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    // Check if already liked
    const existing = await this.pool.query(
      `SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId],
    );

    let liked: boolean;
    if (existing.rows.length > 0) {
      // Remove like
      await this.pool.query(
        `DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2`,
        [commentId, userId],
      );
      await this.pool.query(
        `UPDATE campaign_comments SET likes_count = GREATEST(0, likes_count - 1), updated_at = NOW() WHERE id = $1`,
        [commentId],
      );
      liked = false;
    } else {
      // Add like
      await this.pool.query(
        `INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [commentId, userId],
      );
      await this.pool.query(
        `UPDATE campaign_comments SET likes_count = likes_count + 1, updated_at = NOW() WHERE id = $1`,
        [commentId],
      );
      liked = true;
    }

    const countResult = await this.pool.query(
      `SELECT likes_count FROM campaign_comments WHERE id = $1`,
      [commentId],
    );
    return { liked, likesCount: Number(countResult.rows[0]?.likes_count ?? 0) };
  }
}
