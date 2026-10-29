export interface MenuItemDefault {
  label: string;
  anchor: string;
}

/** Enlaces base del sitio: siempre aparecen y no se pueden quitar del menú. */
export const DEFAULT_MENU: readonly MenuItemDefault[] = [
  { label: 'Inicio', anchor: '#inicio' },
  { label: 'Quiénes somos', anchor: '#nosotros' },
  { label: 'Noticias', anchor: '#noticias' },
  { label: 'Contáctanos', anchor: '#contacto' },
];

export const REQUIRED_MENU_ANCHORS = new Set(DEFAULT_MENU.map((item) => item.anchor));
export const MAX_MENU_ITEMS = 10;

/** Conserva el orden guardado, agrega los enlaces base que falten al final y evita duplicados. */
export function withRequiredMenuItems(value: unknown): MenuItemDefault[] {
  const items = Array.isArray(value)
    ? (value as Partial<MenuItemDefault>[]).filter(
        (item): item is MenuItemDefault =>
          typeof item?.label === 'string' && typeof item.anchor === 'string',
      )
    : [];
  const defaultsByAnchor = new Map(DEFAULT_MENU.map((item) => [item.anchor, item]));
  const ordered: MenuItemDefault[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.anchor)) continue;
    seen.add(item.anchor);
    const base = defaultsByAnchor.get(item.anchor);
    ordered.push({
      ...item,
      label: item.label.trim() || base?.label || item.label,
    });
  }

  for (const item of DEFAULT_MENU) {
    if (!seen.has(item.anchor)) ordered.push({ ...item });
  }

  return ordered;
}
