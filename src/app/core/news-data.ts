/**
 * Noticias del sitio. Vienen de la sección "noticias" del backend (ver newsFeed);
 * el arreglo NEWS solo se usa mientras carga la API o si el backend no tiene noticias.
 */

import { computed, Signal } from '@angular/core';
import { resolveImage } from './api';
import { slugify } from './modules';
import { SiteContent } from './site-content';

/** Bloques del cuerpo de una noticia: párrafo, subtítulo, lista o cita destacada. */
export type NewsBlock = { p: string } | { h: string } | { list: string[] } | { quote: string };

export interface NewsArticle {
  slug: string;
  category: string;
  date: string;
  /** Fecha ISO para <time datetime>. */
  isoDate: string;
  readingMinutes: number;
  author: string;
  title: string;
  /** Resumen para la tarjeta y entradilla del artículo. */
  text: string;
  image: string;
  imageAlt: string;
  body: NewsBlock[];
}

const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const NEWS: NewsArticle[] = [
  {
    slug: 'cinco-habitos-para-fortalecer-tu-ahorro',
    category: 'Educación financiera',
    date: '12 JUN 2025',
    isoDate: '2025-06-12',
    readingMinutes: 4,
    author: 'Equipo de Educación Financiera',
    title: 'Cinco hábitos sencillos para fortalecer tu ahorro',
    text: 'Pequeñas decisiones cotidianas pueden ayudarte a construir mayor tranquilidad financiera.',
    image: unsplash('photo-1554224155-8d04cb21cd6c'),
    imageAlt: 'Persona revisando sus gastos con una calculadora en el celular',
    body: [
      {
        p: 'Ahorrar no depende solo de cuánto ganas, sino de lo que haces con lo que recibes cada mes. En la cooperativa vemos a diario que los asociados que logran sus metas no son necesariamente quienes más ingresos tienen, sino quienes convierten el ahorro en una costumbre.',
      },
      { p: 'Estos son cinco hábitos que puedes empezar hoy mismo, sin cambiar tu vida de un día para otro.' },
      { h: '1. Págate primero' },
      {
        p: 'Apenas recibas tu ingreso, separa un porcentaje para el ahorro antes de pagar cualquier otra cosa. Aunque sea un 5 %, lo importante es que ocurra siempre y de forma automática. Un ahorro programado en la cooperativa te ayuda a no depender de la fuerza de voluntad.',
      },
      { h: '2. Registra tus gastos durante un mes' },
      {
        p: 'Anota todo lo que gastas, incluso lo pequeño: el café, el transporte, las recargas. Al final del mes vas a descubrir gastos hormiga que, sumados, pueden equivaler a una cuota de ahorro.',
      },
      { h: '3. Define para qué ahorras' },
      {
        p: 'Un ahorro sin propósito se gasta con facilidad. Ponle nombre a cada meta —la matrícula, el fondo de emergencia, las vacaciones— y asígnale un valor y una fecha.',
      },
      { quote: 'Cuando el ahorro tiene nombre y fecha, deja de ser lo que sobra y se vuelve una prioridad.' },
      { h: '4. Construye un fondo de emergencia' },
      {
        p: 'Procura reunir, poco a poco, el equivalente a tres meses de tus gastos básicos. Ese colchón evita que un imprevisto te obligue a endeudarte en malas condiciones.',
      },
      { h: '5. Revisa tu plan cada tres meses' },
      { p: 'Tus ingresos y gastos cambian. Agenda una revisión trimestral y hazte tres preguntas:' },
      {
        list: [
          '¿Estoy ahorrando el porcentaje que me propuse?',
          '¿Alguna meta cambió de prioridad?',
          '¿Puedo subir un poco la cuota de ahorro?',
        ],
      },
      {
        p: 'Si quieres armar tu plan con acompañamiento, escríbenos. Nuestro equipo te ayuda a definir una cuota de ahorro programado que se ajuste a tu realidad.',
      },
    ],
  },
  {
    slug: 'asi-construimos-bienestar-con-nuestros-asociados',
    category: 'Cooperativa',
    date: '05 JUN 2025',
    isoDate: '2025-06-05',
    readingMinutes: 3,
    author: 'Comunicaciones Sostecoop',
    title: 'Así construimos bienestar junto a nuestros asociados',
    text: 'Conoce las iniciativas que promueven la colaboración, la confianza y el crecimiento colectivo.',
    image: unsplash('photo-1521737711867-e3b97375f902'),
    imageAlt: 'Grupo de personas conversando alrededor de una mesa de trabajo',
    body: [
      {
        p: 'En una cooperativa, los resultados no se miden solo en cifras: se miden en proyectos cumplidos, en familias más tranquilas y en comunidades que crecen. Durante este semestre impulsamos varias iniciativas pensadas para que cada asociado sienta ese respaldo.',
      },
      { h: 'Talleres de educación financiera' },
      {
        p: 'Realizamos encuentros presenciales y virtuales sobre presupuesto familiar, manejo responsable del crédito y planeación para la vejez. Más de 300 asociados participaron y muchos de ellos ya aplican lo aprendido en su día a día.',
      },
      { h: 'Acompañamiento personalizado' },
      {
        p: 'Fortalecimos la atención uno a uno para quienes quieren organizar sus finanzas o tomar una decisión importante, como comprar vivienda o iniciar un emprendimiento. La idea es simple: que nadie tome decisiones financieras solo.',
      },
      { quote: 'Cooperar es entender que el progreso de uno suma al progreso de todos.' },
      { h: 'Participación democrática' },
      {
        p: 'Cada asociado tiene voz y voto. Por eso abrimos más espacios para escuchar propuestas y rendir cuentas de forma clara sobre la gestión de los recursos comunes.',
      },
      { p: 'Estas acciones tienen un mismo fin:' },
      {
        list: [
          'Que la información financiera sea clara y accesible.',
          'Que los beneficios lleguen a más familias.',
          'Que la confianza se construya con hechos.',
        ],
      },
      {
        p: 'Si tienes una idea para una nueva iniciativa, nos encantaría conocerla. Escríbenos desde el formulario de contacto.',
      },
    ],
  },
  {
    slug: 'como-organizar-tus-metas-financieras',
    category: 'Consejos',
    date: '28 MAY 2025',
    isoDate: '2025-05-28',
    readingMinutes: 5,
    author: 'Equipo de Asesoría',
    title: 'Cómo organizar tus metas financieras por prioridades',
    text: 'Una guía práctica para convertir tus proyectos personales en objetivos claros y alcanzables.',
    image: unsplash('photo-1450101499163-c8848c66ca85'),
    imageAlt: 'Persona escribiendo un plan en una libreta junto a documentos',
    body: [
      {
        p: 'Casi todos tenemos varios proyectos al mismo tiempo: pagar una deuda, ahorrar para la casa, estudiar, viajar. El problema aparece cuando intentamos avanzar en todo a la vez y al final no avanzamos en nada. Ordenar las metas por prioridad cambia el panorama.',
      },
      { h: 'Paso 1: haz la lista completa' },
      {
        p: 'Escribe todas tus metas, grandes y pequeñas, sin filtrarlas todavía. Al lado de cada una anota cuánto cuesta y para cuándo te gustaría lograrla.',
      },
      { h: 'Paso 2: clasifícalas por plazo' },
      {
        list: [
          'Corto plazo (menos de un año): fondo de emergencia, pequeñas compras, deudas pequeñas.',
          'Mediano plazo (de uno a cinco años): estudios, vehículo, cuota inicial de vivienda.',
          'Largo plazo (más de cinco años): vivienda propia, pensión voluntaria, educación de los hijos.',
        ],
      },
      { h: 'Paso 3: decide qué va primero' },
      {
        p: 'Como regla general, primero protege tu estabilidad (fondo de emergencia y deudas costosas) y después financia los proyectos que mejoran tu calidad de vida. Una meta urgente no siempre es la más importante.',
      },
      { quote: 'No se trata de renunciar a tus sueños, sino de darles un orden para que sí lleguen.' },
      { h: 'Paso 4: asigna una cuota a cada meta' },
      {
        p: 'Divide el valor de cada meta entre los meses que tienes para lograrla. Si la suma de las cuotas supera lo que puedes ahorrar, ajusta los plazos de las metas menos prioritarias en lugar de abandonar las importantes.',
      },
      { h: 'Paso 5: mide y celebra' },
      {
        p: 'Revisa tus avances cada mes y celebra cada meta cumplida. Ver el progreso es la mejor motivación para seguir.',
      },
      {
        p: 'En Sostecoop podemos ayudarte a convertir esta lista en un plan de ahorro concreto. Agenda una asesoría sin costo con nuestro equipo.',
      },
    ],
  },
];

/** Noticia tal como la guarda el backend en content.items de la sección "noticias". */
interface ApiNewsItem {
  active?: boolean;
  slug?: string;
  title?: string;
  category?: string;
  date?: string;
  author?: string;
  reading_minutes?: number;
  summary?: string;
  image_url?: string;
  image_alt?: string;
  body?: string;
}

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/** Imágenes del diseño para noticias sin foto propia. */
const FALLBACK_IMAGES = NEWS.map((n) => n.image);

/**
 * Noticias publicadas, de la más reciente a la más antigua. Usa la API cuando
 * la sección "noticias" tiene elementos y, si no, las del diseño.
 */
export function newsFeed(content: SiteContent): Signal<NewsArticle[]> {
  const section = content.raw('noticias');
  return computed(() => {
    const data = section();
    if (data === undefined) return NEWS;
    const items = data?.content['items'];
    if (!Array.isArray(items)) return data === null ? [] : NEWS;
    return (items as ApiNewsItem[])
      .filter((item) => item.active !== false && item.title?.trim())
      .map(fromApi)
      .sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  });
}

function fromApi(item: ApiNewsItem, index: number): NewsArticle {
  const body = item.body ?? '';
  const words = body.split(/\s+/).filter(Boolean).length;
  const isoDate = /^\d{4}-\d{2}-\d{2}/.test(item.date ?? '') ? item.date!.slice(0, 10) : '';
  return {
    slug: item.slug?.trim() || slugify(item.title ?? '') || `noticia-${index + 1}`,
    category: item.category?.trim() || 'Noticias',
    date: formatDate(isoDate),
    isoDate,
    readingMinutes: item.reading_minutes || Math.max(1, Math.round(words / 200)),
    author: item.author?.trim() || 'Sostecoop',
    title: item.title!.trim(),
    text: item.summary?.trim() ?? '',
    image: resolveImage(item.image_url, FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]),
    imageAlt: item.image_alt?.trim() || item.title!.trim(),
    body: parseBody(body),
  };
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
}

/**
 * Texto del admin → bloques. Párrafos separados por línea en blanco;
 * "## " subtítulo, "- " lista, "> " cita.
 */
export function parseBody(text: string): NewsBlock[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): NewsBlock => {
      const lines = chunk.split('\n').map((l) => l.trim());
      if (chunk.startsWith('## ')) return { h: chunk.slice(3).trim() };
      if (lines.every((l) => l.startsWith('- '))) return { list: lines.map((l) => l.slice(2).trim()) };
      if (chunk.startsWith('> ')) return { quote: lines.map((l) => l.replace(/^>\s?/, '')).join(' ') };
      return { p: lines.join(' ') };
    });
}

/** Bloques → texto con el formato que entiende parseBody (para cargar noticias al backend). */
export function bodyToText(blocks: NewsBlock[]): string {
  return blocks
    .map((b) =>
      'h' in b ? `## ${b.h}` : 'list' in b ? b.list.map((i) => `- ${i}`).join('\n') : 'quote' in b ? `> ${b.quote}` : b.p,
    )
    .join('\n\n');
}
