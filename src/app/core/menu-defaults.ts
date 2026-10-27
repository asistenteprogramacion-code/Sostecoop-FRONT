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

/** Agrega los enlaces base que falten y conserva los enlaces extra del usuario. */
export function withRequiredMenuItems(value: unknown): MenuItemDefault[] {
  const items = Array.isArray(value)
    ? (value as Partial<MenuItemDefault>[]).filter(
        (item): item is MenuItemDefault =>
          typeof item?.label === 'string' && typeof item.anchor === 'string',
      )
    : [];
  const required = DEFAULT_MENU.map((base) => {
    const saved = items.find((item) => item.anchor === base.anchor);
    return { ...base, label: saved?.label.trim() || base.label };
  });
  const optional = items.filter((item) => !REQUIRED_MENU_ANCHORS.has(item.anchor));
  return [...required, ...optional];
}
