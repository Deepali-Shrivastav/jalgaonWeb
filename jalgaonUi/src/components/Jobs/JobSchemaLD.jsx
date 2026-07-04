import React from 'react';
import { Helmet } from 'react-helmet';

const JobSchemaLD = ({ job }) => {
    if (!job) return null;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    // Map internal job types to schema.org EmploymentType
    const getEmploymentType = (type) => {
        const typeMap = {
            'full_time': 'FULL_TIME',
            'part_time': 'PART_TIME',
            'contract': 'CONTRACTOR',
            'internship': 'INTERN'
        };
        return typeMap[type] || 'FULL_TIME';
    };

    const schemaData = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description || job.title,
        "identifier": {
            "@type": "PropertyValue",
            "name": job.company,
            "value": job.slug
        },
        "datePosted": job.created_at,
        "validThrough": job.deadline ? `${job.deadline}T23:59:00` : new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        "employmentType": getEmploymentType(job.job_type),
        "hiringOrganization": {
            "@type": "Organization",
            "name": job.company,
            "sameAs": "https://www.jalgaon.com",
            "logo": job.company_logo ? (job.company_logo.startsWith('http') ? job.company_logo : `https://api.jalgaon.com${job.company_logo}`) : ""
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location,
                "addressRegion": "Maharashtra",
                "addressCountry": "IN"
            }
        },
    };

    if (job.salary_min || job.salary_max) {
        schemaData.baseSalary = {
            "@type": "MonetaryAmount",
            "currency": "INR",
            "value": {
                "@type": "QuantitativeValue",
                "minValue": job.salary_min || 0,
                "maxValue": job.salary_max || job.salary_min || 0,
                "unitText": "MONTH"
            }
        };
    }

    return (
        <Helmet>
            <title>{job.meta_title || `${job.title} Jobs in Jalgaon | Jalgaon.com`}</title>
            <meta name="description" content={job.meta_description || `Apply for ${job.title} at ${job.company} in ${job.location}. Find more jobs in Jalgaon on Jalgaon.com.`} />
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default JobSchemaLD;
