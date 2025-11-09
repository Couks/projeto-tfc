/**
 * Event Categories
 * Organizes the ~30 event types captured by the analytics system into logical categories
 */

export enum EventCategory {
  SEARCH = 'search',
  NAVIGATION = 'navigation',
  CONVERSION = 'conversion',
  PROPERTY = 'property',
}

/**
 * Maps event names to their respective categories
 */
export const EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  // Search
  search_submit: EventCategory.SEARCH,

  // Navigation
  results_item_click: EventCategory.NAVIGATION,
  results_saber_mais_click: EventCategory.NAVIGATION,
  property_page_view: EventCategory.NAVIGATION,

  // Property Engagement (favorites)
  favorite_toggle: EventCategory.PROPERTY,
  property_favorite_toggle: EventCategory.PROPERTY,

  // Conversion
  conversion_whatsapp_click: EventCategory.CONVERSION,
  conversion_generate_lead: EventCategory.CONVERSION,
  thank_you_view: EventCategory.CONVERSION,

  // Legacy conversion events (kept for historical data)
  conversion_contact_form: EventCategory.CONVERSION,
  contact_form_submit: EventCategory.CONVERSION, // Also a conversion now
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
