import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import {
  EntrepreneurCampaign,
  CampaignFinancialProgress,
  RecentInvestment,
  EntrepreneurFinancialSummary,
  mapRowToEntrepreneurCampaign,
} from '../models';
import { QueryCampaignsDto } from '../dto';

/**
 * Repository: Campañas del Emprendedor
 * Queries optimizadas para el dashboard del emprendedor.
 * Solo lectura — la creación de campañas es responsabilidad de otro módulo.
 */
@Injectable()
export class EntrepreneurCampaignRepository extends BaseRepository {
  /**
   * EDT 1.3 — Lista campañas del emprendedor con filtros y paginación.
   */
  async findByCreatorId(
    creatorId: string,
    query: QueryCampaignsDto,
  ): Promise<{ campaigns: EntrepreneurCampaign[]; total: number }> {
    // Construir WHERE dinámico
    const conditions: string[] = ['c.creator_id = $1'];
    const params: any[] = [creatorId];
    let paramIndex = 2;

    if (query.status) {
      conditions.push(`c.status = $${paramIndex}`);
      params.push(query.status);
      paramIndex++;
    }

    if (query.campaignType) {
      conditions.push(`c.campaign_type = $${paramIndex}`);
      params.push(query.campaignType);
      paramIndex++;
    }

    if (query.search) {
      conditions.push(`c.title ILIKE $${paramIndex}`);
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Validar sortBy contra whitelist (ya validado en DTO pero doble check)
    const allowedSorts = ['created_at', 'current_amount', 'goal_amount', 'end_date', 'title'];
    const sortBy = allowedSorts.includes(query.sortBy ?? '')
      ? query.sortBy
      : 'created_at';
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total
       FROM campaigns c
       WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult?.total ?? '0', 10);

    // Obtener campañas con categoría
    const campaigns = await this.queryMany(
      `SELECT
        c.id, c.title, c.slug, c.short_description, c.campaign_type,
        c.status, c.goal_amount, c.current_amount, c.investor_count,
        c.currency, c.cover_image_url, c.start_date, c.end_date,
        c.funded_at, c.is_featured, c.view_count,
        c.created_at, c.updated_at, c.published_at,
        cat.display_name AS category_name,
        cat.slug AS category_slug
       FROM campaigns c
       JOIN categories cat ON c.category_id = cat.id
       WHERE ${whereClause}
       ORDER BY c.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, query.limit, query.offset],
    );

    return {
      campaigns: campaigns.map(mapRowToEntrepreneurCampaign),
      total,
    };
  }

  /**
   * EDT 1.3 — Obtiene una campaña específica verificando que pertenece al emprendedor.
   */
  async findOneByCreatorId(
    campaignId: string,
    creatorId: string,
  ): Promise<EntrepreneurCampaign | null> {
    const row = await this.queryOne(
      `SELECT
        c.id, c.title, c.slug, c.short_description, c.campaign_type,
        c.status, c.goal_amount, c.current_amount, c.investor_count,
        c.currency, c.cover_image_url, c.start_date, c.end_date,
        c.funded_at, c.is_featured, c.view_count,
        c.created_at, c.updated_at, c.published_at,
        cat.display_name AS category_name,
        cat.slug AS category_slug
       FROM campaigns c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1 AND c.creator_id = $2`,
      [campaignId, creatorId],
    );

    return row ? mapRowToEntrepreneurCampaign(row) : null;
  }

  /**
   * EDT 1.4 — Progreso financiero detallado de una campaña.
   * Query compleja que agrega datos de inversiones.
   */
  async getFinancialProgress(
    campaignId: string,
    creatorId: string,
  ): Promise<CampaignFinancialProgress | null> {
    // 1. Datos base de la campaña + verificar ownership
    const campaign = await this.queryOne(
      `SELECT
        c.id, c.title, c.slug, c.status,
        c.goal_amount, c.current_amount, c.investor_count,
        c.currency, c.start_date, c.end_date, c.funded_at
       FROM campaigns c
       WHERE c.id = $1 AND c.creator_id = $2`,
      [campaignId, creatorId],
    );

    if (!campaign) return null;

    // 2. Agregados de inversiones por estado
    const investmentStats = await this.queryOne(
      `SELECT
        COUNT(*)::int                                                         AS total_investments,
        COUNT(*) FILTER (WHERE status = 'completed')::int                     AS completed_investments,
        COUNT(*) FILTER (WHERE status = 'pending')::int                       AS pending_investments,
        COUNT(*) FILTER (WHERE status = 'failed')::int                        AS failed_investments,
        COUNT(*) FILTER (WHERE status IN ('refunded','partially_refunded'))::int AS refunded_investments,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)          AS confirmed_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0)            AS pending_amount,
        COALESCE(SUM(refunded_amount) FILTER (WHERE status IN ('refunded','partially_refunded')), 0) AS refunded_amount,
        COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0)          AS avg_investment,
        COALESCE(MAX(amount) FILTER (WHERE status = 'completed'), 0)          AS max_investment,
        COALESCE(MIN(amount) FILTER (WHERE status = 'completed'), 0)          AS min_investment
       FROM investments
       WHERE campaign_id = $1`,
      [campaignId],
    );

    // 3. Últimas 10 inversiones
    const recentRows = await this.queryMany(
      `SELECT
        i.id, i.amount, i.currency, i.status,
        i.is_anonymous, i.created_at,
        CASE
          WHEN i.is_anonymous THEN NULL
          ELSE COALESCE(ip.display_name, ip.first_name || ' ' || ip.last_name)
        END AS investor_display_name
       FROM investments i
       LEFT JOIN investor_profiles ip ON i.investor_id = ip.user_id
       WHERE i.campaign_id = $1
       ORDER BY i.created_at DESC
       LIMIT 10`,
      [campaignId],
    );

    const goalAmount = Number(campaign.goal_amount);
    const currentAmount = Number(campaign.current_amount);

    // Calcular días restantes
    let daysRemaining: number | null = null;
    if (campaign.end_date) {
      const msRemaining = new Date(campaign.end_date).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    }

    return {
      campaignId: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      status: campaign.status,
      goalAmount,
      currentAmount,
      remainingAmount: Math.max(0, goalAmount - currentAmount),
      fundingPercentage: goalAmount > 0
        ? Math.round((currentAmount / goalAmount) * 10000) / 100
        : 0,
      investorCount: Number(campaign.investor_count),
      currency: campaign.currency,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      daysRemaining,
      fundedAt: campaign.funded_at,
      investments: {
        total: investmentStats?.total_investments ?? 0,
        completed: investmentStats?.completed_investments ?? 0,
        pending: investmentStats?.pending_investments ?? 0,
        failed: investmentStats?.failed_investments ?? 0,
        refunded: investmentStats?.refunded_investments ?? 0,
      },
      amounts: {
        confirmed: Number(investmentStats?.confirmed_amount ?? 0),
        pending: Number(investmentStats?.pending_amount ?? 0),
        refunded: Number(investmentStats?.refunded_amount ?? 0),
      },
      averageInvestment: Number(investmentStats?.avg_investment ?? 0),
      largestInvestment: Number(investmentStats?.max_investment ?? 0),
      smallestInvestment: Number(investmentStats?.min_investment ?? 0),
      recentInvestments: recentRows.map((row): RecentInvestment => ({
        id: row.id,
        amount: Number(row.amount),
        currency: row.currency,
        status: row.status,
        isAnonymous: row.is_anonymous,
        investorDisplayName: row.investor_display_name,
        createdAt: row.created_at,
      })),
    };
  }

  /**
   * EDT 1.4 — Resumen financiero global del emprendedor.
   */
  async getFinancialSummary(
    creatorId: string,
  ): Promise<EntrepreneurFinancialSummary> {
    const row = await this.queryOne(
      `SELECT
        COUNT(*)::int AS total_campaigns,
        COUNT(*) FILTER (WHERE status IN ('published', 'funded'))::int AS active_campaigns,
        COUNT(*) FILTER (WHERE status IN ('funded', 'completed'))::int AS funded_campaigns,
        COALESCE(SUM(current_amount) FILTER (WHERE status IN ('published', 'funded', 'completed')), 0) AS total_raised,
        COALESCE(SUM(investor_count) FILTER (WHERE status IN ('published', 'funded', 'completed')), 0)::int AS total_investors,
        CASE
          WHEN COUNT(*) FILTER (WHERE status IN ('published', 'funded', 'completed')) > 0
          THEN COALESCE(
            SUM(current_amount) FILTER (WHERE status IN ('published', 'funded', 'completed'))
            / COUNT(*) FILTER (WHERE status IN ('published', 'funded', 'completed')),
            0
          )
          ELSE 0
        END AS avg_per_campaign
       FROM campaigns
       WHERE creator_id = $1`,
      [creatorId],
    );

    return {
      totalCampaigns: row?.total_campaigns ?? 0,
      activeCampaigns: row?.active_campaigns ?? 0,
      fundedCampaigns: row?.funded_campaigns ?? 0,
      totalRaised: Number(row?.total_raised ?? 0),
      totalInvestors: row?.total_investors ?? 0,
      averagePerCampaign: Number(row?.avg_per_campaign ?? 0),
      currency: 'USD',
    };
  }
}
