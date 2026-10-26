/**
 * Contenido del diseño de Figma. Se muestra mientras carga la API o si una
 * sección no trae un campo. Los nombres de campo coinciden con los de
 * GET /api/public/content; los que el backend no tiene son solo del diseño.
 */

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export interface Stat {
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_anchor: string;
  image_url: string;
  badge_label: string;
  badge_title: string;
  stats: Stat[];
}

export interface AboutContent {
  label: string;
  title: string;
  text: string;
  mission: string;
  vision: string;
  quote: string;
  image_url: string;
}

export interface ContactContent {
  label: string;
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  schedule: string;
  map_url: string;
  form_title: string;
  form_text: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface SettingsContent {
  site_name: string;
  footer_text: string;
  tagline: string;
  social: SocialLinks;
}

export const DEFAULT_IMAGES = {
  hero: unsplash('photo-1529156069898-49953e39b3ac'),
  about: unsplash('photo-1556761175-b413da4baf72'),
};

export const HERO_DEFAULTS: HeroContent = {
  eyebrow: 'Cooperación que genera confianza',
  title: 'Juntos construimos un futuro con más oportunidades.',
  subtitle:
    'Somos una cooperativa comprometida con el bienestar financiero, el ahorro responsable y el crecimiento colectivo de nuestros asociados.',
  cta_label: 'Conócenos',
  cta_anchor: '#nosotros',
  image_url: '',
  badge_label: 'Nuestro propósito',
  badge_title: 'Crecer en comunidad',
  stats: [
    { value: '+15 años', label: 'creciendo juntos' },
    { value: '2.400+', label: 'asociados' },
    { value: '100%', label: 'compromiso' },
  ],
};

export const ABOUT_DEFAULTS: AboutContent = {
  label: 'Quiénes somos',
  title: 'Una cooperativa que pone a las personas en el centro.',
  text:
    'En Sostecoop creemos que el crecimiento financiero debe ser cercano, responsable y solidario. Acompañamos a nuestros asociados para que puedan organizar sus ahorros y avanzar hacia sus proyectos.\n\nNuestra gestión se fundamenta en la transparencia, la participación democrática y el compromiso con el desarrollo de nuestra comunidad.',
  mission:
    'Promover hábitos financieros saludables y soluciones de ahorro que generen bienestar colectivo.',
  vision:
    'Ser una cooperativa referente por su cercanía, solidez e innovación al servicio de las personas.',
  quote: 'Cuando cooperamos, cada aporte se convierte en una oportunidad para todos.',
  image_url: '',
};

export const CONTACT_DEFAULTS: ContactContent = {
  label: 'Contáctanos',
  title: 'Estamos para escucharte y orientarte.',
  subtitle:
    'Si tienes preguntas sobre nuestra cooperativa o deseas conocer más, comunícate por cualquiera de nuestros canales.',
  email: 'contacto@fondofuturo.co',
  phone: '(601) 000 0000',
  address: 'Bogotá, Colombia',
  schedule: 'Lun–Vie · 8:00 a. m.–5:00 p. m.',
  map_url: '',
  form_title: '¿Cómo podemos ayudarte?',
  form_text:
    'Nuestro equipo está preparado para resolver tus inquietudes y brindarte información clara.',
};

export const SETTINGS_DEFAULTS: SettingsContent = {
  site_name: 'Sostecoop',
  footer_text: '© Sostecoop Cooperativa. Todos los derechos reservados.',
  tagline: 'Cooperación, confianza y crecimiento para construir juntos un mejor futuro financiero.',
  social: {},
};
