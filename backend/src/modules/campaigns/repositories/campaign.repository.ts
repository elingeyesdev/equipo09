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
}
