/**
 * Event Categories
 * Organizes the ~30 event types captured by the analytics system into logical categories
 */

export enum EventCategory {
  SEARCH = 'search',
  FILTERS = 'filters',
  NAVIGATION = 'navigation',
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  FUNNEL = 'funnel',
  PROPERTY = 'property',
  FORM = 'form',
  SESSION = 'session',
  PERFORMANCE = 'performance',
}

/**
 * Maps event names to their respective categories
 */
export const EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  // Search
  search_submit: EventCategory.SEARCH,

  // Filters
  search_filter_changed: EventCategory.FILTERS,
  search_filter_group_changed: EventCategory.FILTERS,
  search_filter_range_changed: EventCategory.FILTERS,
  search_filter_toggle: EventCategory.FILTERS,
  search_filter_manual_input: EventCategory.FILTERS,
  search_filter_city: EventCategory.FILTERS,
  search_filter_bairro: EventCategory.FILTERS,
  advanced_filters_toggle: EventCategory.FILTERS,
  results_order_changed: EventCategory.FILTERS,

  // Navigation
  results_item_click: EventCategory.NAVIGATION,
  results_saber_mais_click: EventCategory.NAVIGATION,
  property_page_view: EventCategory.NAVIGATION,
  property_gallery_navigation: EventCategory.NAVIGATION,
  property_image_click: EventCategory.NAVIGATION,

  // Engagement
  favorite_toggle: EventCategory.ENGAGEMENT,
  property_favorite_toggle: EventCategory.ENGAGEMENT,
  property_share_click: EventCategory.ENGAGEMENT,
  scroll_depth: EventCategory.ENGAGEMENT,

  // Conversion
  conversion_complete: EventCategory.CONVERSION,
  conversion_contact_form: EventCategory.CONVERSION,
  conversion_whatsapp_click: EventCategory.CONVERSION,
  conversion_phone_click: EventCategory.CONVERSION,
  conversion_email_click: EventCategory.CONVERSION,
  thank_you_page_view: EventCategory.CONVERSION,

  // Funnel
  funnel_stage_reached: EventCategory.FUNNEL,

  // Property (CTAs)
  cta_fazer_proposta_click: EventCategory.PROPERTY,
  cta_alugar_imovel_click: EventCategory.PROPERTY,
  cta_mais_informacoes_click: EventCategory.PROPERTY,

  // Form
  contact_form_started: EventCategory.FORM,
  contact_form_field_focus: EventCategory.FORM,
  contact_form_field_filled: EventCategory.FORM,
  contact_form_submit: EventCategory.FORM,
  contact_form_abandoned: EventCategory.FORM,

  // Session
  session_start: EventCategory.SESSION,

  // Performance
  page_exit: EventCategory.PERFORMANCE,
  bounce_detected: EventCategory.PERFORMANCE,
};

/**
 * Get the category for a given event name
 * @param eventName Name of the event
 * @returns EventCategory or undefined if not found
 */
export function getEventCategory(eventName: string): EventCategory | undefined {
  return EVENT_CATEGORY_MAP[eventName];
}

/**
 * Get all events in a specific category
 * @param category EventCategory to filter by
 * @returns Array of event names in that category
 */
export function getEventsByCategory(category: EventCategory): string[] {
  return Object.entries(EVENT_CATEGORY_MAP)
    .filter(([, cat]) => cat === category)
    .map(([eventName]) => eventName);
}

/**
 * Check if an event belongs to a specific category
 * @param eventName Name of the event
 * @param category Category to check
 * @returns boolean
 */
export function isEventInCategory(
  eventName: string,
  category: EventCategory,
): boolean {
  return EVENT_CATEGORY_MAP[eventName] === category;
}
