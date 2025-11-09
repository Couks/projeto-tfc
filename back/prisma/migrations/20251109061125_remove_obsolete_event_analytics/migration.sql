-- This migration removes materialized views and logic related to events that are no longer captured.
-- It simplifies the analytics schema to align with the streamlined `capture-filters.js` SDK.

-- Drop obsolete materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_conversion_funnel_daily;
DROP MATERIALIZED VIEW IF EXISTS mv_filters_usage_daily;
DROP MATERIALIZED VIEW IF EXISTS mv_top_properties_daily; -- This view relied on obsolete interaction events.

-- Drop and recreate mv_property_analytics_daily to remove obsolete columns (shares, cta_clicks)
DROP MATERIALIZED VIEW IF EXISTS mv_property_analytics_daily;
CREATE MATERIALIZED VIEW mv_property_analytics_daily AS
SELECT
    "siteKey" as site_key,
    DATE(ts) as bucket_date,
    properties->>'codigo' as property_code,
    COUNT(CASE WHEN name = 'property_page_view' THEN 1 END) as views,
    COUNT(CASE WHEN name = 'property_favorite_toggle' AND properties->>'action' = 'add' THEN 1 END) as favorites
FROM "Event"
WHERE "siteKey" IS NOT NULL
    AND properties->>'codigo' IS NOT NULL
    AND name IN (
        'property_page_view',
        'property_favorite_toggle'
    )
GROUP BY "siteKey", DATE(ts), properties->>'codigo';

-- Recreate indexes for the simplified property analytics view
CREATE INDEX idx_mv_property_analytics_site_date ON mv_property_analytics_daily (site_key, bucket_date);
CREATE INDEX idx_mv_property_analytics_code ON mv_property_analytics_daily (property_code);


-- Update the main refresh function to remove the dropped views
DROP FUNCTION IF EXISTS insights_refresh(DATE, DATE);
CREATE OR REPLACE FUNCTION insights_refresh(from_date DATE, to_date DATE)
RETURNS void AS $$
BEGIN
    -- Refresh core overview views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_overview_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_events_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_cities_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_devices_daily;

    -- Refresh simplified categorized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_search_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_property_analytics_daily;
    -- Note: mv_form_analytics, mv_bounce_analytics, etc., were removed in a previous migration.
END;
$$ LANGUAGE plpgsql;

-- Perform an initial refresh of the modified views
REFRESH MATERIALIZED VIEW mv_property_analytics_daily;
