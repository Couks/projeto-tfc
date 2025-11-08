-- Remove engagement analytics materialized views and related indexes

-- Drop indexes first
DROP INDEX IF EXISTS idx_mv_bounce_analytics_site_date;
DROP INDEX IF EXISTS idx_mv_bounce_analytics_type;
DROP INDEX IF EXISTS idx_mv_scroll_analytics_site_date;
DROP INDEX IF EXISTS idx_mv_scroll_analytics_depth;

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_bounce_analytics_daily;
DROP MATERIALIZED VIEW IF EXISTS mv_scroll_analytics_daily;

-- Update refresh function to remove bounce and scroll views
DROP FUNCTION IF EXISTS insights_refresh(DATE, DATE);

CREATE OR REPLACE FUNCTION insights_refresh(from_date DATE, to_date DATE)
RETURNS void AS $$
BEGIN
    -- Refresh existing overview views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_overview_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_events_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_cities_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_devices_daily;

    -- Refresh categorized views (without bounce and scroll)
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_search_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_filters_usage_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_funnel_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_property_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_properties_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_form_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_form_field_analytics_daily;
END;
$$ LANGUAGE plpgsql;
