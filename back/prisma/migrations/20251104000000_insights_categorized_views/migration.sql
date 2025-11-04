-- Categorized Insights Materialized Views
-- Migration for creating organized analytics views by category

-- =====================================================
-- 1. SEARCH ANALYTICS
-- =====================================================

-- Search Analytics Daily: Aggregates search_submit events
CREATE MATERIALIZED VIEW mv_search_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT "sessionId") as unique_sessions,
    properties->>'finalidade' as finalidade,
    properties->>'source' as search_source,
    COUNT(*) as search_count
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND name = 'search_submit'
GROUP BY "siteKey", DATE(ts), properties->>'finalidade', properties->>'source';

-- Filters Usage Daily: Aggregates all filter-related events
CREATE MATERIALIZED VIEW mv_filters_usage_daily AS
WITH filter_events AS (
    SELECT
        "siteKey" as site_key,
        DATE(ts) as bucket_date,
        name as event_name,
        properties->>'field' as filter_field,
        properties->>'value' as filter_value
    FROM "Event"
    WHERE "siteKey" IS NOT NULL
        AND name IN (
            'search_filter_changed',
            'search_filter_group_changed',
            'search_filter_range_changed',
            'search_filter_toggle',
            'search_filter_manual_input',
            'search_filter_city',
            'search_filter_bairro',
            'advanced_filters_toggle'
        )
)
SELECT
    site_key,
    bucket_date,
    event_name,
    filter_field,
    COUNT(*) as usage_count
FROM filter_events
GROUP BY site_key, bucket_date, event_name, filter_field;

-- =====================================================
-- 2. CONVERSION ANALYTICS
-- =====================================================

-- Conversion Analytics Daily: Aggregates all conversion events
CREATE MATERIALIZED VIEW mv_conversion_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    name as conversion_type,
    COUNT(*) as conversion_count,
    COUNT(DISTINCT "userId") as unique_users,
    COUNT(DISTINCT "sessionId") as unique_sessions,
    properties->>'codigo' as property_code,
    properties->>'source' as conversion_source
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND name IN (
        'conversion_complete',
        'conversion_contact_form',
        'conversion_whatsapp_click',
        'conversion_phone_click',
        'conversion_email_click'
    )
GROUP BY "siteKey", DATE(ts), name, properties->>'codigo', properties->>'source';

-- Conversion Funnel Daily: Tracks funnel stages
CREATE MATERIALIZED VIEW mv_conversion_funnel_daily AS
WITH funnel_stages AS (
    SELECT
        "siteKey" as site_key,
        DATE(ts) as bucket_date,
        "sessionId" as session_id,
        properties->>'stage' as stage,
        MIN(ts) as first_occurrence
    FROM "Event"
    WHERE "siteKey" IS NOT NULL
        AND name = 'funnel_stage_reached'
        AND properties->>'stage' IS NOT NULL
    GROUP BY "siteKey", DATE(ts), "sessionId", properties->>'stage'
)
SELECT
    site_key,
    bucket_date,
    stage,
    COUNT(DISTINCT session_id) as sessions_count
FROM funnel_stages
GROUP BY site_key, bucket_date, stage;

-- =====================================================
-- 3. PROPERTY ANALYTICS
-- =====================================================

-- Property Analytics Daily: Aggregates property-related events
CREATE MATERIALIZED VIEW mv_property_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    properties->>'codigo' as property_code,
    COUNT(CASE WHEN name = 'property_page_view' THEN 1 END) as views,
    COUNT(CASE WHEN name = 'property_favorite_toggle' AND properties->>'action' = 'add' THEN 1 END) as favorites,
    COUNT(CASE WHEN name = 'property_share_click' THEN 1 END) as shares,
    COUNT(CASE WHEN name = 'cta_fazer_proposta_click' THEN 1 END) as proposta_clicks,
    COUNT(CASE WHEN name = 'cta_alugar_imovel_click' THEN 1 END) as alugar_clicks,
    COUNT(CASE WHEN name = 'cta_mais_informacoes_click' THEN 1 END) as info_clicks
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND properties->>'codigo' IS NOT NULL
    AND name IN (
        'property_page_view',
        'property_favorite_toggle',
        'property_share_click',
        'cta_fazer_proposta_click',
        'cta_alugar_imovel_click',
        'cta_mais_informacoes_click'
    )
GROUP BY "siteKey", DATE(ts), properties->>'codigo';

-- Top Properties Daily: Most viewed/engaged properties
CREATE MATERIALIZED VIEW mv_top_properties_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    properties->>'codigo' as property_code,
    COUNT(DISTINCT "sessionId") as unique_sessions,
    COUNT(*) as total_interactions,
    AVG(CAST(properties->>'time_on_page' AS INTEGER)) as avg_time_on_page
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND properties->>'codigo' IS NOT NULL
    AND properties->>'codigo' != ''
    AND name IN (
        'property_page_view',
        'property_favorite_toggle',
        'property_share_click',
        'property_gallery_navigation',
        'property_image_click'
    )
GROUP BY "siteKey", DATE(ts), properties->>'codigo';

-- =====================================================
-- 4. FORM ANALYTICS
-- =====================================================

-- Form Analytics Daily: Aggregates form interaction events
CREATE MATERIALIZED VIEW mv_form_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    COUNT(CASE WHEN name = 'contact_form_started' THEN 1 END) as forms_started,
    COUNT(CASE WHEN name = 'contact_form_submit' THEN 1 END) as forms_submitted,
    COUNT(CASE WHEN name = 'contact_form_abandoned' THEN 1 END) as forms_abandoned,
    COUNT(DISTINCT CASE WHEN name = 'contact_form_field_focus' THEN properties->>'field' END) as unique_fields_focused,
    properties->>'codigo' as property_code
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND name IN (
        'contact_form_started',
        'contact_form_submit',
        'contact_form_abandoned',
        'contact_form_field_focus',
        'contact_form_field_filled'
    )
GROUP BY "siteKey", DATE(ts), properties->>'codigo';

-- Form Field Analytics Daily: Per-field analytics
CREATE MATERIALIZED VIEW mv_form_field_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    properties->>'field' as field_name,
    COUNT(CASE WHEN name = 'contact_form_field_focus' THEN 1 END) as focus_count,
    COUNT(CASE WHEN name = 'contact_form_field_filled' THEN 1 END) as fill_count
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND properties->>'field' IS NOT NULL
    AND name IN ('contact_form_field_focus', 'contact_form_field_filled')
GROUP BY "siteKey", DATE(ts), properties->>'field';

-- =====================================================
-- 5. PERFORMANCE & ENGAGEMENT ANALYTICS
-- =====================================================

-- Bounce Analytics Daily: Aggregates bounce detection events
CREATE MATERIALIZED VIEW mv_bounce_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    properties->>'type' as bounce_type,
    COUNT(*) as bounce_count,
    AVG(CAST(properties->>'time_on_page' AS INTEGER)) as avg_time_on_page,
    AVG(CAST(properties->>'max_scroll' AS INTEGER)) as avg_max_scroll,
    context->>'url' as page_url
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND name = 'bounce_detected'
GROUP BY "siteKey", DATE(ts), properties->>'type', context->>'url';

-- Scroll Analytics Daily: Aggregates scroll depth events
CREATE MATERIALIZED VIEW mv_scroll_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    CAST(properties->>'depth' AS INTEGER) as scroll_depth,
    COUNT(*) as depth_count,
    context->>'url' as page_url
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND name = 'scroll_depth'
    AND properties->>'depth' IS NOT NULL
GROUP BY "siteKey", DATE(ts), CAST(properties->>'depth' AS INTEGER), context->>'url';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Search Analytics Indexes
CREATE INDEX idx_mv_search_analytics_site_date ON mv_search_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_search_analytics_finalidade ON mv_search_analytics_daily (finalidade);

-- Filters Usage Indexes
CREATE INDEX idx_mv_filters_usage_site_date ON mv_filters_usage_daily (site_key, bucket_date);
CREATE INDEX idx_mv_filters_usage_field ON mv_filters_usage_daily (filter_field);

-- Conversion Analytics Indexes
CREATE INDEX idx_mv_conversion_analytics_site_date ON mv_conversion_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_conversion_analytics_type ON mv_conversion_analytics_daily (conversion_type);

-- Conversion Funnel Indexes
CREATE INDEX idx_mv_conversion_funnel_site_date ON mv_conversion_funnel_daily (site_key, bucket_date);
CREATE INDEX idx_mv_conversion_funnel_stage ON mv_conversion_funnel_daily (stage);

-- Property Analytics Indexes
CREATE INDEX idx_mv_property_analytics_site_date ON mv_property_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_property_analytics_code ON mv_property_analytics_daily (property_code);

-- Top Properties Indexes
CREATE INDEX idx_mv_top_properties_site_date ON mv_top_properties_daily (site_key, bucket_date);
CREATE INDEX idx_mv_top_properties_code ON mv_top_properties_daily (property_code);

-- Form Analytics Indexes
CREATE INDEX idx_mv_form_analytics_site_date ON mv_form_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_form_field_analytics_site_date ON mv_form_field_analytics_daily (site_key, bucket_date);

-- Bounce Analytics Indexes
CREATE INDEX idx_mv_bounce_analytics_site_date ON mv_bounce_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_bounce_analytics_type ON mv_bounce_analytics_daily (bounce_type);

-- Scroll Analytics Indexes
CREATE INDEX idx_mv_scroll_analytics_site_date ON mv_scroll_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_scroll_analytics_depth ON mv_scroll_analytics_daily (scroll_depth);

-- =====================================================
-- UPDATE REFRESH FUNCTION
-- =====================================================

-- Drop and recreate the refresh function to include new views
DROP FUNCTION IF EXISTS insights_refresh(DATE, DATE);

CREATE OR REPLACE FUNCTION insights_refresh(from_date DATE, to_date DATE)
RETURNS void AS $$
BEGIN
    -- Refresh existing overview views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_overview_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_events_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_cities_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_devices_daily;

    -- Refresh new categorized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_search_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_filters_usage_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_funnel_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_property_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_properties_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_form_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_form_field_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_bounce_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_scroll_analytics_daily;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Initial refresh (non-concurrent for first run)
REFRESH MATERIALIZED VIEW mv_search_analytics_daily;
REFRESH MATERIALIZED VIEW mv_filters_usage_daily;
REFRESH MATERIALIZED VIEW mv_conversion_analytics_daily;
REFRESH MATERIALIZED VIEW mv_conversion_funnel_daily;
REFRESH MATERIALIZED VIEW mv_property_analytics_daily;
REFRESH MATERIALIZED VIEW mv_top_properties_daily;
REFRESH MATERIALIZED VIEW mv_form_analytics_daily;
REFRESH MATERIALIZED VIEW mv_form_field_analytics_daily;
REFRESH MATERIALIZED VIEW mv_bounce_analytics_daily;
REFRESH MATERIALIZED VIEW mv_scroll_analytics_daily;

