import { useEffect, useState } from 'react';
import { getCategories } from '../api/categories.api';
import type { Category } from '../types/category.types';

// Mapa de emojis por nombre de categoría (fallback si no hay ícono)
const CATEGORY_EMOJIS: Record<string, string> = {
  technology:   '💻',
  health:       '🏥',
  education:    '🎓',
  environment:  '🌱',
  art:          '🎨',
  social_impact:'🤝',
  food:         '🍽️',
  fashion:      '👗',
  gaming:       '🎮',
  real_estate:  '🏢',
  fintech:      '💰',
  agriculture:  '🌾',
  mobility:     '🚗',
  media:        '📻',
  community:    '🏘️',
};

interface Props {
  selected: string[];           // IDs de categorías seleccionadas
  onChange: (ids: string[]) => void;
}

export function CategorySelector({ selected, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ padding: '24px 0' }}>
        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
        <span style={{ fontSize: '0.8rem' }}>Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ fontSize: '0.8rem' }}>
        ⚠ {error}
      </div>
    );
  }

  return (
    <div>
      {/* Contador de seleccionados */}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
        {selected.length === 0
          ? 'Selecciona los sectores de tu interés'
          : `${selected.length} sector${selected.length > 1 ? 'es' : ''} seleccionado${selected.length > 1 ? 's' : ''}`}
      </p>

      {/* Grid de chips */}
      <div className="category-grid">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat.id);
          const emoji = CATEGORY_EMOJIS[cat.name] ?? '📌';
          return (
            <button
              key={cat.id}
              type="button"
              id={`cat-${cat.name}`}
              className={`category-chip ${isSelected ? 'category-chip--selected' : ''}`}
              style={isSelected ? { '--chip-color': cat.color ?? '#3b82f6' } as React.CSSProperties : {}}
              onClick={() => toggle(cat.id)}
              aria-pressed={isSelected}
            >
              <span className="category-chip__emoji">{emoji}</span>
              <span className="category-chip__label">{cat.displayName}</span>
              {isSelected && <span className="category-chip__check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
