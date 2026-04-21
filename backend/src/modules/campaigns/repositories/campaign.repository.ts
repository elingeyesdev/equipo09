import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { EntrepreneurCampaign, CreateCampaignDto } from '../models';

export interface PaginatedCampaigns {
  data: EntrepreneurCampaign[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

@Injectable()
export class CampaignRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  private mapRowToCampaign(row: any): EntrepreneurCampaign {
    return {
      id: row.id,
      creatorId: row.creator_id,
      categoryId: row.category_id,
      title: row.title,
      slug: row.slug,
      subtitle: row.subtitle,
      description: row.description,
      shortDescription: row.short_description,
      campaignType: row.campaign_type,
      status: row.status,
      goalAmount: parseFloat(row.goal_amount),
      currentAmount: parseFloat(row.current_amount),
      minInvestment: parseFloat(row.min_investment || '0'),
      maxInvestment: row.max_investment ? parseFloat(row.max_investment) : null,
      equityPercentage: row.equity_percentage ? parseFloat(row.equity_percentage) : null,
      startDate: row.start_date,
      endDate: row.end_date,
      fundsRaised: parseFloat(row.funds_raised || '0'),
      investorsCount: parseInt(row.investors_count || '0', 10),
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(userId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign> {
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let categoryId = dto.categoryId;
    if (!categoryId) {
      const cat = await this.pool.query(`SELECT id FROM categories LIMIT 1`);
      if (!cat.rows[0]) {
        throw new BadRequestException(
          'No hay categorías en la base de datos. Ejecuta el seed de categorías.',
        );
      }
      categoryId = cat.rows[0].id;
    }

    const query = `
      INSERT INTO campaigns (
        creator_id, category_id, title, slug, description, short_description, 
        campaign_type, status, goal_amount, end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_review', $8, $9)
      RETURNING *;
    `;

    // El frontend enviaba endDate como string con fecha, convertimos si existe.
    const endDateStr = dto.endDate ? new Date(dto.endDate).toISOString() : null;

    const values = [
      userId,
      categoryId,
      dto.title,
      slug,
      dto.description,
      dto.shortDescription || null,
      dto.campaignType,
      dto.goalAmount,
      endDateStr,
    ];

    const { rows } = await this.pool.query(query, values);
    return this.mapRowToCampaign(rows[0]);
  }

  async findByCreatorId(userId: string, page: number = 1, limit: number = 10, sortBy: string = 'created_at', sortOrder: string = 'DESC'): Promise<PaginatedCampaigns> {
    const offset = (page - 1) * limit;

    const queryData = `
      SELECT * FROM campaigns
      WHERE creator_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3;
    `;
    const dataValues = [userId, limit, offset];
    
    const queryCount = `SELECT COUNT(*) FROM campaigns WHERE creator_id = $1;`;
    const countValues = [userId];

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(queryData, dataValues),
      this.pool.query(queryCount, countValues),
    ]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: dataResult.rows.map(row => this.mapRowToCampaign(row)),
      meta: {
        totalItems,
        itemCount: dataResult.rows.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findByIdAndCreator(id: string, creatorId: string): Promise<EntrepreneurCampaign | null> {
    const query = `SELECT * FROM campaigns WHERE id = $1 AND creator_id = $2;`;
    const { rows } = await this.pool.query(query, [id, creatorId]);
    return rows.length > 0 ? this.mapRowToCampaign(rows[0]) : null;
  }

  // =========================================================================
  // CAMPAÑAS PÚBLICAS — Queries optimizadas
  // =========================================================================

  private readonly PUBLIC_STATUSES = ['published', 'funded', 'partially_funded'];

  private readonly PUBLIC_SELECT = `
    SELECT
      c.id, c.title, c.slug, c.short_description,
      c.campaign_type, c.status,
      c.goal_amount, c.current_amount, c.investor_count,
      c.cover_image_url, c.end_date, c.created_at,
      ep.first_name || ' ' || ep.last_name AS entrepreneur_name,
      ep.display_name AS entrepreneur_display_name,
      ep.avatar_url AS entrepreneur_avatar,
      cat.display_name AS category_name,
      cat.slug AS category_slug
    FROM campaigns c
    JOIN entrepreneur_profiles ep ON c.creator_id = ep.user_id
    JOIN categories cat ON c.category_id = cat.id
  `;

  private mapRowToPublicCampaign(row: any): any {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      shortDescription: row.short_description,
      campaignType: row.campaign_type,
      status: row.status,
      goalAmount: parseFloat(row.goal_amount),
      currentAmount: parseFloat(row.current_amount),
      investorCount: parseInt(row.investor_count || '0', 10),
      coverImageUrl: row.cover_image_url,
      endDate: row.end_date,
      createdAt: row.created_at,
      entrepreneurName: row.entrepreneur_name,
      entrepreneurDisplayName: row.entrepreneur_display_name,
      entrepreneurAvatar: row.entrepreneur_avatar,
      categoryName: row.category_name,
      categorySlug: row.category_slug,
    };
  }

  async findPublicCampaigns(
    page: number = 1,
    limit: number = 12,
    sortBy: string = 'created_at',
    sortOrder: string = 'DESC',
    categoryId?: string,
    campaignType?: string,
    search?: string,
  ): Promise<PaginatedCampaigns> {
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [`c.status IN ('published', 'funded', 'partially_funded')`];
    const params: any[] = [];
    let paramIndex = 1;

    if (categoryId) {
      conditions.push(`c.category_id = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    if (campaignType) {
      conditions.push(`c.campaign_type = $${paramIndex}`);
      params.push(campaignType);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(c.title ILIKE $${paramIndex} OR c.short_description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Whitelist sortBy to prevent SQL injection
    const allowedSorts = ['created_at', 'current_amount', 'goal_amount', 'end_date'];
    const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Count
    const countQuery = `SELECT COUNT(*) FROM campaigns c WHERE ${whereClause}`;
    const countResult = await this.pool.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    // Data
    const dataQuery = `
      ${this.PUBLIC_SELECT}
      WHERE ${whereClause}
      ORDER BY c.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    const dataResult = await this.pool.query(dataQuery, [...params, limit, offset]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: dataResult.rows.map(row => this.mapRowToPublicCampaign(row)),
      meta: {
        totalItems,
        itemCount: dataResult.rows.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findPublicById(id: string): Promise<any | null> {
    const query = `
      SELECT
        c.id, c.title, c.slug, c.subtitle, c.short_description,
        c.description, c.campaign_type, c.status,
        c.goal_amount, c.current_amount, c.investor_count,
        c.cover_image_url, c.currency,
        c.min_investment, c.max_investment,
        c.start_date, c.end_date, c.created_at,
        ep.first_name || ' ' || ep.last_name AS entrepreneur_name,
        ep.display_name AS entrepreneur_display_name,
        ep.avatar_url AS entrepreneur_avatar,
        ep.bio AS entrepreneur_bio,
        cat.display_name AS category_name,
        cat.slug AS category_slug
      FROM campaigns c
      JOIN entrepreneur_profiles ep ON c.creator_id = ep.user_id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1 AND c.status IN ('published', 'funded', 'partially_funded');
    `;
    const { rows } = await this.pool.query(query, [id]);
    if (rows.length === 0) return null;

    // Fetch reward tiers for this campaign
    let rewardTiers: any[] = [];
    try {
      const tiersResult = await this.pool.query(
        `SELECT id, title, description, amount, currency, max_claims,
                current_claims, estimated_delivery, image_url, sort_order
         FROM reward_tiers
         WHERE campaign_id = $1 AND is_active = true
         ORDER BY amount ASC`,
        [id],
      );
      rewardTiers = tiersResult.rows.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        amount: parseFloat(t.amount),
        currency: t.currency,
        maxClaims: t.max_claims,
        currentClaims: parseInt(t.current_claims || '0', 10),
        estimatedDelivery: t.estimated_delivery,
        imageUrl: t.image_url,
      }));
    } catch (e) {
      console.warn('Could not fetch reward tiers:', e);
    }

    const row = rows[0];
    return {
      ...this.mapRowToPublicCampaign(row),
      description: row.description,
      subtitle: row.subtitle,
      currency: row.currency,
      startDate: row.start_date,
      minInvestment: parseFloat(row.min_investment || '0'),
      maxInvestment: row.max_investment ? parseFloat(row.max_investment) : null,
      entrepreneurBio: row.entrepreneur_bio,
      rewardTiers,
    };
  }
}
