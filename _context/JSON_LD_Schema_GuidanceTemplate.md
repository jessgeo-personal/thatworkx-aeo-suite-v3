{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://thatworkx.com/#organization",
      "name": "ThatWorkx",
      "url": "https://thatworkx.com",
      "logo": "https://aeo.thatworkx.com/assets/logo.png",
      "sameAs": [
        "https://www.linkedin.com/company/thatworkx"
      ],
      "location": {
        "@type": "Place",
        "@id": "https://thatworkx.com/#location-powdersville",
        "name": "ThatWorkx Powdersville HQ",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Powdersville",
          "addressRegion": "SC",
          "postalCode": "29673",
          "addressCountry": "US"
        }
      },
      "employee": [
        {
          "@type": "Person",
          "@id": "https://thatworkx.com/#team-founder",
          "name": "Doc",
          "jobTitle": "Master Barber & Founder"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://aeo.thatworkx.com/#aeo-service",
      "provider": {
        "@id": "https://thatworkx.com/#organization"
      },
      "name": "Generative AI Engine Optimization (AEO)",
      "description": "Deterministic raw text reflection, visibility gap metrics, and semantic alignment for machine-readable digital assets."
    },
    {
      type: "DataCatalog",
      "@id": "https://thatworkx.com/catalog/#brand-catalog",
      "name": "ThatWorkx Product and Software Catalog",
      "provider": {
        "@id": "https://yourdomain.com/#organization"
      },
      "dataset": [
        {
          "@type": "Product",
          "@id": "https://aeo.thatworkx.com/#product-visualize",
          "name": "AI Visualize",
          "description": "Lightweight data-reflection mirror showing exact text layouts exposed to generative AI search bots.",
          "brand": {
            "@type": "Brand",
            "name": "ThatWorkx AEO Suite"
          },
          "offers": {
            "@type": "Offer",
            "price": "5.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Crawl Cap Boundary",
              "value": "Up to 20 unique page routes per single manual action pass"
            },
            {
              "@type": "PropertyValue",
              "name": "Processing Overhead",
              "value": "Zero-cost local browser document string parsing"
            }
          ]
        },
        {
          "@type": "Product",
          "@id": "https://aeo.thatworkx.com/#product-optimize",
          "name": "AIOptimize",
          "description": "Prescriptive code remediation dashboard tracking headless engine rendering and exposure gaps.",
          "brand": {
            "@type": "Brand",
            "name": "ThatWorkx AEO Suite"
          },
          "offers": {
            "@type": "Offer",
            "price": "20.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "review": {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Verified Shopify Merchant"
            },
            "reviewBody": "AIOptimize flagged empty JS wrappers hiding my inventory descriptions from ChatGPT. Fixed it instantly using the pre-built edge pre-rendering worker templates."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "@id": "https://aeo.thatworkx.com/docs/#howto-manifest",
      "name": "How to Implement your ai-context.md Manifest Capsule",
      "description": "Deploying zero-markup text maps directly onto Cloudflare Edge or native self-hosted storage paths.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Compile local text arrays",
          "text": "Run an interactive validation pass inside the AI Visualize dashboard canvas to compile your unified structural copy packet."
        },
        {
          "@type": "HowToStep",
          "name": "Inject root storage directories",
          "text": "Drop the generated ai-context.md asset file straight into your web server root path or copy to Shopify Admin Files storage."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://aeo.thatworkx.com/docs/#faqs",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why do budget-constrained AI crawlers miss client-side content?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Fast-moving search engines avoid wasting compute cycles rendering heavy client-side JavaScript, meaning unrendered Single Page Applications often display as completely blank pages."
          }
        }
      ]
    }
  ]
}