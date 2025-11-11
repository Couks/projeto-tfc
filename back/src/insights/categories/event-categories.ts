/**
 * Categorias de eventos
 * Organiza os tipos de eventos capturados pelo sistema de analytics em categorias lógicas
 */

export enum EventCategory {
  SEARCH = 'search',
  NAVIGATION = 'navigation',
  CONVERSION = 'conversion',
  PROPERTY = 'property',
}

/**
 * Mapeia os nomes dos eventos para suas categorias correspondentes
 */
export const EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  // Busca
  search_submit: EventCategory.SEARCH,

  // Navegação
  results_item_click: EventCategory.NAVIGATION,
  results_saber_mais_click: EventCategory.NAVIGATION,
  property_page_view: EventCategory.NAVIGATION,

  // Engajamento com imóvel (favoritos)
  favorite_toggle: EventCategory.PROPERTY,
  property_favorite_toggle: EventCategory.PROPERTY,

  // Conversão
  conversion_whatsapp_click: EventCategory.CONVERSION,
  conversion_generate_lead: EventCategory.CONVERSION,
  thank_you_view: EventCategory.CONVERSION,

  // Eventos de conversão antigos (mantidos para histórico)
  conversion_contact_form: EventCategory.CONVERSION,
  contact_form_submit: EventCategory.CONVERSION, // Também considerado conversão agora
};

/**
 * Retorna a categoria para um dado nome de evento
 * @param eventName Nome do evento
 * @returns EventCategory ou undefined se não encontrado
 */
export function getEventCategory(eventName: string): EventCategory | undefined {
  return EVENT_CATEGORY_MAP[eventName];
}

/**
 * Retorna todos os eventos de uma determinada categoria
 * @param category Categoria de evento para filtrar
 * @returns Array de nomes de eventos nessa categoria
 */
export function getEventsByCategory(category: EventCategory): string[] {
  return Object.entries(EVENT_CATEGORY_MAP)
    .filter(([, cat]) => cat === category)
    .map(([eventName]) => eventName);
}

/**
 * Verifica se um evento pertence a uma categoria específica
 * @param eventName Nome do evento
 * @param category Categoria para checar
 * @returns boolean
 */
export function isEventInCategory(
  eventName: string,
  category: EventCategory,
): boolean {
  return EVENT_CATEGORY_MAP[eventName] === category;
}
