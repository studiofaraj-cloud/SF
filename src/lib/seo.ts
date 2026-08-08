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
    description: 'Sviluppo web su misura a Padova. Realizziamo siti, e-commerce e applicazioni con codice personalizzato — clienti in Veneto, Italia ed Europa.',
    locale: 'it_IT',
    defaultTitle: 'Studio Faraj — Agenzia Web a Padova | Sviluppo Siti Web',
    defaultKeywords: [
      // City + provincia
      'agenzia web Padova',
      'sviluppo siti web Padova',
      'web designer Padova',
      'sviluppatore full-stack Padova',
      // Veneto
      'web agency Veneto',
      'sviluppo web Verona',
      'sviluppo web Venezia',
      'sviluppo web Treviso',
      'sviluppo web Vicenza',
      // Nazionale
      'agenzia web Italia',
      'sviluppo web Italia',
      'siti web professionali Italia',
      // Europa
      'web agency Europa',
      'sviluppo web Europa',
      // Servizi
      'siti web personalizzati',
      'e-commerce su misura',
      'SEO Padova Veneto',
      'consulenza digitale PMI',
      'AI e automazione',
    ],
  },
  en: {
    description: 'Custom web development from Padova, Italy. We build websites, e-commerce and apps with bespoke code — serving clients across Italy and Europe.',
    locale: 'en_US',
    defaultTitle: 'Studio Faraj — Web Agency in Padova, Italy',
    defaultKeywords: [
      // City + region
      'web agency Padova',
      'web development Padova',
      'web agency Veneto',
      // Country
      'web agency Italy',
      'custom web development Italy',
      'full-stack development Italy',
      // Europe
      'European web development',
      'bespoke websites Europe',
      'web agency Europe',
      // Services
      'custom websites',
      'custom e-commerce Italy',
      'SEO Italy',
      'AI automation Italy',
      'managed hosting',
      'UI/UX design',
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
  /**
   * Set for content that exists in ONE language but is reachable under both
   * locale prefixes — blog posts and projects, whose text comes from a single
   * set of Firestore fields with no per-locale variant. /en/{slug} serves the
   * exact same Italian document as /it/{slug}.
   *
   * When true, both URLs canonicalise to the default-locale one and no hreflang
   * pair is emitted. Cross-language canonical is normally wrong, but these pages
   * are not translations of each other — they are literally the same document at
   * two URLs, which is exactly what canonical is for. Claiming an hreflang pair
   * here tells Google a translation exists when it doesn't.
   */
  defaultLocaleOnly?: boolean;
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
  defaultLocaleOnly = false,
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
  
  // Optimize description length (target ~155 chars; safety margin under 1000px)
  const fullDescription = description
    ? (description.length > 155 ? description.substring(0, 152) + '...' : description)
    : config.description;
  
  const ogImage = image || siteConfig.ogImage;
  const allImages = images && images.length > 0
    ? [ogImage, ...images].filter(Boolean).slice(0, 10) // Limit to 10 images for OG
    : [ogImage];

  // Normalize: no trailing slashes, no query strings on canonical
  const stripTrailing = (u: string) => u.replace(/\/+$/, '');
  const canonicalUrl = stripTrailing(url || `${siteConfig.url}/${locale}`);

  // Resolve hreflang URLs (BCP-47 codes — Google prefers regional like `it-IT`)
  let itHref: string;
  let enHref: string;
  if (alternateUrls) {
    itHref = stripTrailing(alternateUrls.it);
    enHref = stripTrailing(alternateUrls.en);
  } else {
    const pathAfterLocale = canonicalUrl
      .replace(siteConfig.url, '')
      .replace(new RegExp(`^/${locale}`), '');
    itHref = stripTrailing(`${siteConfig.url}/it${pathAfterLocale}`);
    enHref = stripTrailing(`${siteConfig.url}/en${pathAfterLocale}`);
  }

  // Single-language content: collapse both locale URLs onto the default-locale
  // one and emit no hreflang, rather than advertising a translation that does
  // not exist. See `defaultLocaleOnly` in SEOProps.
  // og:url follows the canonical — a share of the /en URL should resolve to the
  // same page Google indexes, not to the duplicate we point away from.
  const resolvedCanonical = defaultLocaleOnly ? itHref : canonicalUrl;

  const alternates: Metadata['alternates'] = defaultLocaleOnly
    ? { canonical: itHref }
    : {
        canonical: canonicalUrl,
        languages: {
          'it-IT': itHref,
          'en-US': enHref,
          'x-default': itHref,
        },
      };
  
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
      url: resolvedCanonical,
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
      areaServed: ['IT', 'EU'],
      availableLanguage: locale === 'it' ? ['Italian', 'English'] : ['English', 'Italian'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Padova',
      addressRegion: 'Veneto',
      postalCode: '35100',
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
      addressLocality: 'Padova',
      addressRegion: 'Veneto',
      postalCode: '35100',
      addressCountry: 'IT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '45.4064',
      longitude: '11.8768',
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
      { '@type': 'City', name: 'Padova' },
      { '@type': 'AdministrativeArea', name: 'Veneto' },
      { '@type': 'Country', name: locale === 'it' ? 'Italia' : 'Italy' },
      { '@type': 'Place', name: locale === 'it' ? 'Unione Europea' : 'European Union' },
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

/**
 * Combined LocalBusiness + ProfessionalService schema for the homepage.
 * Schema.org allows multi-type via array; this merges what was previously two
 * separate JSON-LD blocks (LocalBusiness on home + ProfessionalService on every
 * page in the layout) into one node — saves ~3KB on every HTML response.
 */
export function generateStructuredDataLocalBusiness(locale: Locale = 'it') {
  const baseUrl = `${siteConfig.url}/${locale}`;
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
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
      addressLocality: 'Padova',
      addressRegion: 'Veneto',
      postalCode: '35100',
      addressCountry: 'IT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '45.4064',
      longitude: '11.8768',
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
      { '@type': 'City', name: 'Padova' },
      { '@type': 'AdministrativeArea', name: 'Veneto' },
      { '@type': 'Country', name: locale === 'it' ? 'Italia' : 'Italy' },
      { '@type': 'Place', name: locale === 'it' ? 'Unione Europea' : 'European Union' },
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '12',
      bestRating: '5',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'it' ? 'Servizi di Sviluppo Web Full-Stack' : 'Full-Stack Web Development Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'Sviluppo Web Full-Stack su Misura' : 'Custom Full-Stack Web Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'E-Commerce Personalizzato' : 'Custom E-Commerce' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'Design UI/UX' : 'UI/UX Design' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'SEO e Web Marketing' : 'SEO & Web Marketing' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'AI e Automazione' : 'AI & Automation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'Hosting Gestito e Cloud' : 'Managed Hosting & Cloud' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'Manutenzione e Supporto' : 'Maintenance & Support' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: locale === 'it' ? 'Consulenza IT Strategica' : 'Strategic IT Consulting' } },
      ],
    },
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
      { '@type': 'City', name: 'Padova' },
      { '@type': 'AdministrativeArea', name: 'Veneto' },
      { '@type': 'Country', name: locale === 'it' ? 'Italia' : 'Italy' },
      { '@type': 'Place', name: locale === 'it' ? 'Unione Europea' : 'European Union' },
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
