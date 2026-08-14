// JSON-LD structured data generators for SEO

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rental Waivers",
    url: "https://www.rentalwaivers.com",
    logo: "https://www.rentalwaivers.com/favicon.png",
    description:
      "Digital liability waiver software for rental businesses. Collect legally-binding e-signatures online with pay-per-waiver pricing.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://www.rentalwaivers.com/docs",
    },
    sameAs: [],
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Rental Waivers",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.rentalwaivers.com",
    description:
      "Rental waiver software for collecting legally binding online liability waivers from guests.",
    offers: {
      "@type": "Offer",
      price: "0.06",
      priceCurrency: "USD",
      description: "Pay per signed waiver. No monthly fee. 250 free credits on signup.",
    },
    // No aggregateRating: Google requires ratings to come from reviews that are
    // actually displayed on the page. Fabricated ratings risk a manual action.
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTimeISO?: string; // e.g. "PT10M"
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    ...(opts.totalTimeISO ? { totalTime: opts.totalTimeISO } : {}),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  serviceType: string;
  areaServed?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: {
      "@type": "Organization",
      name: "Rental Waivers",
      url: "https://www.rentalwaivers.com",
    },
    areaServed: opts.areaServed ?? "United States",
    url: opts.url,
    offers: {
      "@type": "Offer",
      price: "0.06",
      priceCurrency: "USD",
      description: "Pay-per-waiver pricing starting at 6¢ per signature. No monthly fee.",
    },
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  author: string;
  authorRole?: string;
  datePublished: string;
  dateModified: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    author: {
      "@type": "Person",
      name: opts.author,
      ...(opts.authorRole ? { jobTitle: opts.authorRole } : {}),
    },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    publisher: {
      "@type": "Organization",
      name: "Rental Waivers",
      url: "https://www.rentalwaivers.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.rentalwaivers.com/favicon.png",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    url: opts.url,
  };
}

export function legalServiceSchema(opts: {
  state: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Liability waiver software",
    name: `${opts.state} Liability Waiver Guide & Software`,
    description: opts.description,
    areaServed: { "@type": "State", name: opts.state },
    url: opts.url,
    provider: {
      "@type": "Organization",
      name: "Rental Waivers",
      url: "https://www.rentalwaivers.com",
    },
  };
}
