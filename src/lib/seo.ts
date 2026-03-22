import { Metadata } from 'next';
import type { Locale } from '@/i18n/config';

export const siteConfig = {
  name: 'Studio Faraj',
  url: 'https://studiofaraj.it',
  ogImage: 'https://studiofaraj.it/assets/og-image.jpg',
  twitterHandle: '@studiofaraj',
  type: 'website',
};

// Locale-specific SEO configurations
export const seoConfig: Record<Locale, {
  description: string;
  locale: string;
  defaultTitle: string;
  defaultKeywords: string[];
}> = {
  it: {
    description: 'Sviluppatori full-stack a Sciacca, Sicilia. Creiamo siti web, e-commerce e applicazioni interamente con codice personalizzato — nessun template, nessuna piattaforma terza. SEO, hosting gestito, AI e automazione.',
    locale: 'it_IT',
    defaultTitle: 'Studio Faraj - Sviluppo Web Full-Stack su Misura | Sciacca, Sicilia',
    defaultKeywords: [
      'sviluppo web Sciacca',
      'sviluppatori full-stack Sicilia',
      'siti web personalizzati',
      'e-commerce custom',
      'agenzia web Sciacca',
      'sviluppo web su misura',
      'SEO Sicilia',
      'hosting gestito',
      'AI automazione',
      'design UI/UX',
      'marketing digitale',
      'consulenza IT',
    ],
  },
  en: {
    description: 'Full-stack developers in Sciacca, Sicily. We build websites, e-commerce and applications entirely with custom code — no templates, no third-party platforms. SEO, managed hosting, AI and automation.',
    locale: 'en_US',
    defaultTitle: 'Studio Faraj - Custom Full-Stack Web Development | Sciacca, Sicily',
    defaultKeywords: [
      'web development Sciacca',
      'full-stack developers Sicily',
      'custom websites',
      'custom e-commerce',
      'web agency Sciacca',
      'bespoke web development',
      'SEO Sicily',
      'managed hosting',
      'AI automation',
      'UI/UX design',
      'digital marketing',
      'IT consulting',
    ],
  },
};

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  images?: string[];
  url?: string;
  locale?: Locale;
  alternateUrls?: Record<Locale, string>;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  images,
  url,
  locale = 'it',
  alternateUrls,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
  nofollow = false,
}: SEOProps): Metadata {
  const config = seoConfig[locale];
  
  const fullTitle = title 
    ? `${title} | ${siteConfig.name}`
    : config.defaultTitle;
  
  // Optimize description length (150-160 chars for SEO)
  const fullDescription = description 
    ? (description.length > 160 ? description.substring(0, 157) + '...' : description)
    : config.description;
  
  const ogImage = image || siteConfig.ogImage;
  const allImages = images && images.length > 0 
    ? [ogImage, ...images].filter(Boolean).slice(0, 10) // Limit to 10 images for OG
    : [ogImage];
  const canonicalUrl = url || `${siteConfig.url}/${locale}`;
  
  // Build hreflang alternates
  const alternates: Metadata['alternates'] = {
    canonical: canonicalUrl,
  };
  
  // Add hreflang tags for internationalization
  if (alternateUrls) {
    alternates.languages = {
      'x-default': alternateUrls['it'] || Object.values(alternateUrls)[0],
    };
    Object.entries(alternateUrls).forEach(([loc, altUrl]) => {
      alternates.languages![loc] = altUrl;
    });
  } else {
    // Auto-generate alternate URLs if not provided
    // Extract path after locale prefix (e.g. /it/servizi -> /servizi)
    const pathAfterLocale = canonicalUrl.replace(siteConfig.url, '').replace(new RegExp(`^/${locale}`), '');
    alternates.languages = {
      'it': `${siteConfig.url}/it${pathAfterLocale}`,
      'en': `${siteConfig.url}/en${pathAfterLocale}`,
      'x-default': `${siteConfig.url}/it${pathAfterLocale}`,
    };
  }
  
  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords?.length ? keywords.join(', ') : config.defaultKeywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      locale: config.locale,
      url: canonicalUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: siteConfig.name,
      images: allImages.map(img => ({
        url: img,
        width: 1200,
        height: 630,
        alt: fullTitle,
      })),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(type === 'article' && {
        section: locale === 'it' ? 'Blog' : 'Blog',
        tags: keywords,
      }),
      // Add alternate locales for OpenGraph
      ...(alternateUrls && {
        alternateLocale: Object.keys(alternateUrls).map(loc => seoConfig[loc as Locale].locale),
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: allImages.slice(0, 1), // Twitter only uses first image
      creator: siteConfig.twitterHandle,
    },
    alternates,
    metadataBase: new URL(siteConfig.url),
  };

  return metadata;
}

export function generateStructuredDataOrganization(locale: Locale = 'it') {
  const baseUrl = `${siteConfig.url}/${locale}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}#organization`,
    name: siteConfig.name,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/assets/logo.png`,
      width: 512,
      height: 512,
    },
    image: siteConfig.ogImage,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+39-320-222-3322',
      contactType: 'customer service',
      areaServed: ['IT', 'EU', 'US'],
      availableLanguage: locale === 'it' ? ['Italian', 'English'] : ['English', 'Italian'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sciacca',
      addressRegion: locale === 'it' ? 'Sicilia' : 'Sicily',
      postalCode: '92019',
      addressCountry: 'IT',
    },
    foundingDate: '2024',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '1-10',
    },
    sameAs: [
      'https://www.instagram.com/studiofaraj',
      'https://www.linkedin.com/company/studiofaraj',
      'https://www.facebook.com/studiofaraj',
    ],
  };
}

export function generateStructuredDataProfessionalService(locale: Locale = 'it') {
  const baseUrl = `${siteConfig.url}/${locale}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.url}#service`,
    name: siteConfig.name,
    url: baseUrl,
    image: siteConfig.ogImage,
    telephone: '+39-320-222-3322',
    email: 'info@studiofaraj.it',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sciacca',
      addressRegion: locale === 'it' ? 'Sicilia' : 'Sicily',
      postalCode: '92019',
      addressCountry: 'IT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '37.5069',
      longitude: '13.0886',
    },
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'it' ? 'Servizi di Sviluppo Web Full-Stack' : 'Full-Stack Web Development Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'Sviluppo Web Full-Stack su Misura' : 'Custom Full-Stack Web Development',
            description: locale === 'it' ? 'Siti web e applicazioni sviluppati interamente con codice personalizzato' : 'Websites and applications built entirely with custom code',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'E-Commerce Personalizzato' : 'Custom E-Commerce',
            description: locale === 'it' ? 'Piattaforme e-commerce sviluppate da zero senza template o piattaforme terze' : 'E-commerce platforms built from scratch without templates or third-party platforms',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'Design UI/UX' : 'UI/UX Design',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'SEO e Web Marketing' : 'SEO & Web Marketing',
            description: locale === 'it' ? 'Strategie SEO, abbonamenti di ottimizzazione continua e campagne di marketing digitale' : 'SEO strategies, ongoing optimization subscriptions and digital marketing campaigns',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'AI e Automazione' : 'AI & Automation',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'Hosting Gestito e Cloud' : 'Managed Hosting & Cloud',
            description: locale === 'it' ? 'Infrastruttura cloud ad alte prestazioni con supporto 24/7' : 'High-performance cloud infrastructure with 24/7 support',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'Manutenzione e Supporto' : 'Maintenance & Support',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'it' ? 'Consulenza IT Strategica' : 'Strategic IT Consulting',
          },
        },
      ],
    },
    areaServed: [
      { '@type': 'Country', name: locale === 'it' ? 'Italia' : 'Italy' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
    ],
    availableLanguage: ['Italian', 'English'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '12',
      bestRating: '5',
    },
  };
}

export function generateStructuredDataWebSite(locale: Locale = 'it') {
  const baseUrl = `${siteConfig.url}/${locale}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: baseUrl,
    inLanguage: locale === 'it' ? 'it-IT' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    alternateName: locale === 'it' ? 'Studio Faraj Web Development' : 'Studio Faraj Sviluppo Web',
  };
}

export function generateStructuredDataLocalBusiness(locale: Locale = 'it') {
  const baseUrl = `${siteConfig.url}/${locale}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}#localbusiness`,
    name: siteConfig.name,
    image: [
      `${siteConfig.url}/assets/logo.png`,
      siteConfig.ogImage,
    ],
    url: baseUrl,
    telephone: '+39-320-222-3322',
    email: 'info@studiofaraj.it',
    description: seoConfig[locale].description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sciacca',
      addressRegion: locale === 'it' ? 'Sicilia' : 'Sicily',
      postalCode: '92019',
      addressCountry: 'IT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '37.5069',
      longitude: '13.0886',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'EUR',
    paymentAccepted: locale === 'it' ? 'Bonifico Bancario, PayPal' : 'Bank Transfer, PayPal',
    areaServed: [
      { '@type': 'Country', name: locale === 'it' ? 'Italia' : 'Italy' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
    ],
    availableLanguage: ['Italian', 'English'],
    knowsAbout: [
      'Full-Stack Web Development',
      'Custom E-Commerce Development',
      'React', 'Next.js', 'TypeScript', 'Node.js', 'Python',
      'UI/UX Design',
      'SEO & Web Marketing',
      'Cloud Hosting & Infrastructure',
      'AI & Automation',
      'Firebase', 'Vercel', 'Docker',
      'REST API', 'Headless CMS',
    ],
    sameAs: [
      'https://www.instagram.com/studiofaraj',
      'https://www.linkedin.com/company/studiofaraj',
      'https://www.facebook.com/studiofaraj',
    ],
  };
}

export function generateStructuredDataService(name: string, description: string, url: string, locale: Locale = 'it') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    provider: {
      '@type': 'LocalBusiness',
      name: siteConfig.name,
      url: `${siteConfig.url}/${locale}`,
    },
    areaServed: [
      {
        '@type': 'Country',
        name: locale === 'it' ? 'Italia' : 'Italy',
      },
      {
        '@type': 'Country',
        name: 'United States',
      },
      {
        '@type': 'Country',
        name: 'United Kingdom',
      },
    ],
    description: description,
    url: url,
    inLanguage: locale === 'it' ? 'it-IT' : 'en-US',
  };
}

export function generateStructuredDataBlogPosting(
  title: string,
  description: string,
  url: string,
  image: string,
  publishedTime: string,
  modifiedTime?: string,
  author?: string,
  images?: string[]
) {
  const allImages = images && images.length > 0 
    ? [image, ...images].filter(Boolean)
    : [image];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: allImages.length === 1 ? allImages[0] : allImages,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Organization',
      name: author || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/assets/logo.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export function generateStructuredDataArticle(
  title: string,
  description: string,
  url: string,
  image: string,
  publishedTime: string,
  modifiedTime?: string,
  author?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Organization',
      name: author || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/assets/logo.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export function generateStructuredDataBreadcrumbList(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateStructuredDataFAQPage(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateStructuredDataCollectionPage(
  name: string,
  description: string,
  url: string,
  items: Array<{ name: string; url: string; image?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
        ...(item.image && { image: item.image }),
      })),
    },
  };
}

export function generateStructuredDataCreativeWork(
  name: string,
  description: string,
  url: string,
  image: string,
  datePublished: string,
  dateModified?: string,
  creator?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: name,
    description: description,
    url: url,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    creator: {
      '@type': 'Organization',
      name: creator || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/assets/logo.png`,
        width: 512,
        height: 512,
      },
    },
  };
}
