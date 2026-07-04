import React from 'react';
import { Helmet } from 'react-helmet';

const EventSchemaLD = ({ event }) => {
    if (!event) return null;

    const djangoApi = import.meta.env.VITE_DJANGO_API;

    const imageUrl = event.featured_image
        ? (event.featured_image.startsWith('http') ? event.featured_image : `${djangoApi}${event.featured_image}`)
        : '';

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    // If backend provided pre-built JSON-LD schema dict (FR-EVT-08), use it
    const schemaData = event.schema_json_ld || {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.meta_title || event.title,
        "description": event.meta_description || event.short_description,
        "startDate": event.start_datetime,
        "endDate": event.end_datetime,
        "image": imageUrl ? [imageUrl] : [],
        "location": {
            "@type": "Place",
            "name": event.venue_name,
            "address": event.venue_address
        },
        "organizer": {
            "@type": "Organization",
            "name": event.organizer_name
        },
        "url": currentUrl
    };

    return (
        <Helmet>
            {/* Meta Tags */}
            <title>{event.meta_title || event.title} | Jalgaon Events</title>
            <meta name="description" content={event.meta_description || event.short_description} />

            {/* Open Graph Tags */}
            <meta property="og:title" content={event.meta_title || event.title} />
            <meta property="og:description" content={event.meta_description || event.short_description} />
            {imageUrl && <meta property="og:image" content={imageUrl} />}
            <meta property="og:type" content="event" />
            <meta property="og:url" content={currentUrl} />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={event.meta_title || event.title} />
            <meta name="twitter:description" content={event.meta_description || event.short_description} />
            {imageUrl && <meta name="twitter:image" content={imageUrl} />}

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default EventSchemaLD;
