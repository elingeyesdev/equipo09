import { useState, useEffect, useRef, useMemo } from 'react';
import type { QueryCampaignsDto, CampaignFilterPreset } from '../types/campaign.types';

const PRESETS: {
  id: CampaignFilterPreset;
  label: string;
  hint: string;
}[] = [
  { id: 'all', label: 'Todas', hint: 'Sin filtrar por estado' },
  { id: 'draft', label: 'Borradores', hint: 'Aún no publicadas' },
  { id: 'approval', label: 'En revisión', hint: 'Pendientes o en aprobación' },
  { id: 'published', label: 'Activas', hint: 'Publicadas o en curso' },
  { id: 'archived', label: 'Cerradas', hint: 'Finalizadas o rechazadas' },
];

const SORT_OPTIONS: {
  key: string;
  sortBy: QueryCampaignsDto['sortBy'];
  sortOrder: 'ASC' | 'DESC';
  label: string;
}[] = [
  { key: 'created_at__DESC', sortBy: 'created_at', sortOrder: 'DESC', label: 'Últimas creadas' },
  { key: 'created_at__ASC', sortBy: 'created_at', sortOrder: 'ASC', label: 'Más antiguas primero' },
  { key: 'end_date__ASC', sortBy: 'end_date', sortOrder: 'ASC', label: 'Cierran pronto' },
  { key: 'end_date__DESC', sortBy: 'end_date', sortOrder: 'DESC', label: 'Cierre más lejano' },
  { key: 'title__ASC', sortBy: 'title', sortOrder: 'ASC', label: 'Título A → Z' },
  { key: 'current_amount__DESC', sortBy: 'current_amount', sortOrder: 'DESC', label: 'Más recaudación' },
  { key: 'goal_amount__DESC', sortBy: 'goal_amount', sortOrder: 'DESC', label: 'Mayor meta' },
];

function sortKeyFromQuery(q: QueryCampaignsDto): string {
  const sb = q.sortBy ?? 'created_at';
  const so = q.sortOrder ?? 'DESC';
  const found = SORT_OPTIONS.find((o) => o.sortBy === sb && o.sortOrder === so);
  return found?.key ?? 'created_at__DESC';
}

interface Props {
  query: QueryCampaignsDto;
  onChange: (patch: Partial<QueryCampaignsDto>) => void;
}

function SearchIcon() {
  return (
    <svg className="campaign-filters-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM20 20l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterPanelIcon() {
  return (
    <svg className="campaign-filters-panel-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CampaignFilters({ query, onChange }: Props) {
  const [searchDraft, setSearchDraft] = useState(query.search ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const presetActive = query.filterPreset ?? 'all';
  const sortSelectValue = sortKeyFromQuery(query);

  const hasExtraFilters = useMemo(() => {
    return (
      !!query.createdFrom ||
      !!query.createdTo ||
      !!query.endDateFrom ||
      !!query.endDateTo
    );
  }, [query.createdFrom, query.createdTo, query.endDateFrom, query.endDateTo]);

  const showClear = useMemo(() => {
    return (
      presetActive !== 'all' ||
      !!query.search?.trim() ||
      hasExtraFilters ||
      sortSelectValue !== 'created_at__DESC'
    );
  }, [presetActive, query.search, hasExtraFilters, sortSelectValue]);

  useEffect(() => {
    setSearchDraft(query.search ?? '');
  }, [query.search]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchDraft.trim();
      const cur = (query.search ?? '').trim();
      if (next === cur) return;
      onChangeRef.current({ search: next || undefined, page: 1 });
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchDraft, query.search]);

  const clearAll = () => {
    setSearchDraft('');
    onChange({
      filterPreset: 'all',
      search: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      endDateFrom: undefined,
      endDateTo: undefined,
      sortBy: 'created_at',
      sortOrder: 'DESC',
      page: 1,
    });
  };

  const onSortChange = (key: string) => {
    const opt = SORT_OPTIONS.find((o) => o.key === key);
    if (!opt) return;
    onChange({ sortBy: opt.sortBy, sortOrder: opt.sortOrder, page: 1 });
  };

  const presetLabel = PRESETS.find((p) => p.id === presetActive)?.label ?? 'Todas';
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortSelectValue)?.label ?? '';

  return (
    <section
      className={`campaign-filters ${filtersOpen ? 'campaign-filters--expanded' : 'campaign-filters--collapsed'}`}
      aria-label="Filtros de campañas"
    >
      {!filtersOpen ? (
        <button
          type="button"
          className="campaign-filters-trigger"
          onClick={() => setFiltersOpen(true)}
          aria-expanded="false"
        >
          <FilterPanelIcon />
          <span className="campaign-filters-trigger-text">
            <span className="campaign-filters-trigger-title">Filtros de listado</span>
            <span className="campaign-filters-trigger-hint">Opcional · búsqueda, estado, orden y fechas</span>
          </span>
          {showClear ? (
            <span className="campaign-filters-trigger-badge" title="Hay filtros aplicados">
              Activo
            </span>
          ) : null}
          <span className="campaign-filters-trigger-chevron" aria-hidden>
            ▾
          </span>
        </button>
      ) : null}

      {filtersOpen ? (
        <>
          <div className="campaign-filters-head">
            <div>
              <h2 className="campaign-filters-title">Filtrar campañas</h2>
              <p className="campaign-filters-subtitle">
                Busca por título y elige cómo quieres ver el listado.
              </p>
            </div>
            <div className="campaign-filters-head-actions">
              {showClear && (
                <button type="button" className="btn btn-ghost campaign-filters-clear" onClick={clearAll}>
                  Limpiar
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost campaign-filters-hide"
                onClick={() => setFiltersOpen(false)}
              >
                Ocultar filtros
              </button>
            </div>
          </div>

          <div className="campaign-filters-search-wrap">
        <label className="campaign-filters-search-label" htmlFor="campaign-search">
          <SearchIcon />
          <span className="sr-only">Buscar por título</span>
        </label>
        <input
          id="campaign-search"
          type="search"
          className="campaign-filters-search-input"
          placeholder="Buscar por nombre de campaña…"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="campaign-filters-block">
        <p className="campaign-filters-block-label" id="filter-preset-label">
          Estado
        </p>
        <div className="campaign-filter-chips-scroll" role="group" aria-labelledby="filter-preset-label">
          {PRESETS.map(({ id, label, hint }) => (
            <button
              key={id}
              type="button"
              className={`campaign-filter-chip ${presetActive === id ? 'is-active' : ''}`}
              onClick={() => onChange({ filterPreset: id, page: 1 })}
              title={hint}
              aria-pressed={presetActive === id}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="campaign-filters-toolbar">
        <label className="campaign-filters-sort-field">
          <span className="campaign-filters-sort-label">Ordenar por</span>
          <select
            className="campaign-filters-sort-select"
            value={sortSelectValue}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <details className={`campaign-filters-details ${hasExtraFilters ? 'has-value' : ''}`}>
        <summary className="campaign-filters-details-summary">
          <div className="campaign-filters-details-text">
            <span className="campaign-filters-details-title">Filtros por fecha</span>
            <span className="campaign-filters-details-hint">Opcional · por creación o cierre de campaña</span>
          </div>
          <span className="campaign-filters-details-chevron" aria-hidden>
            ›
          </span>
        </summary>
        <div className="campaign-filters-details-body">
          <div className="campaign-filters-date-block">
            <span className="campaign-filters-date-heading">Fecha de creación</span>
            <div className="campaign-filter-date-group">
              <input
                type="date"
                className="campaign-filter-date-input"
                aria-label="Creada desde"
                value={query.createdFrom ?? ''}
                onChange={(e) =>
                  onChange({
                    createdFrom: e.target.value || undefined,
                    page: 1,
                  })
                }
              />
              <span className="campaign-filter-date-sep">hasta</span>
              <input
                type="date"
                className="campaign-filter-date-input"
                aria-label="Creada hasta"
                value={query.createdTo ?? ''}
                onChange={(e) =>
                  onChange({
                    createdTo: e.target.value || undefined,
                    page: 1,
                  })
                }
              />
            </div>
          </div>
          <div className="campaign-filters-date-block">
            <span className="campaign-filters-date-heading">Fecha de cierre</span>
            <div className="campaign-filter-date-group">
              <input
                type="date"
                className="campaign-filter-date-input"
                aria-label="Cierra desde"
                value={query.endDateFrom ?? ''}
                onChange={(e) =>
                  onChange({
                    endDateFrom: e.target.value || undefined,
                    page: 1,
                  })
                }
              />
              <span className="campaign-filter-date-sep">hasta</span>
              <input
                type="date"
                className="campaign-filter-date-input"
                aria-label="Cierra hasta"
                value={query.endDateTo ?? ''}
                onChange={(e) =>
                  onChange({
                    endDateTo: e.target.value || undefined,
                    page: 1,
                  })
                }
              />
            </div>
          </div>
        </div>
      </details>

          <div className="campaign-filters-footer">
            <p className="campaign-filters-footer-summary">
              Vista: <strong>{presetLabel}</strong>
              {sortLabel ? (
                <>
                  {' '}
                  · orden: <strong>{sortLabel}</strong>
                </>
              ) : null}
              {query.search?.trim() ? (
                <>
                  {' '}
                  · búsqueda: «{query.search.trim().length > 32
                    ? `${query.search.trim().slice(0, 32)}…`
                    : query.search.trim()}
                  »
                </>
              ) : null}
              {hasExtraFilters ? <> · <strong>fechas</strong> aplicadas</> : null}
            </p>
            <button
              type="button"
              className="btn btn-ghost campaign-filters-footer-hide"
              onClick={() => setFiltersOpen(false)}
            >
              Ocultar filtros
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
