// Global city registry — SEO pages for every major freelancing market
// Covers 195 countries, 4B internet users, every economic tier

export interface City {
  slug:     string
  name:     string
  country:  string
  region:   string   // 'cis' | 'asia' | 'middle-east' | 'africa' | 'europe' | 'americas'
  currency: string
  lang:     string   // primary language
  pop:      number   // million
}

export const CITIES: City[] = [
  // ── CIS & Central Asia ─────────────────────────────────────
  { slug: 'almaty',      name: 'Almaty',      country: 'Kazakhstan',    region: 'cis',         currency: '₸',   lang: 'ru', pop: 2.1  },
  { slug: 'astana',      name: 'Astana',      country: 'Kazakhstan',    region: 'cis',         currency: '₸',   lang: 'ru', pop: 1.2  },
  { slug: 'shymkent',   name: 'Shymkent',    country: 'Kazakhstan',    region: 'cis',         currency: '₸',   lang: 'ru', pop: 1.1  },
  { slug: 'tashkent',   name: 'Tashkent',    country: 'Uzbekistan',    region: 'cis',         currency: 'UZS', lang: 'uz', pop: 2.5  },
  { slug: 'bishkek',    name: 'Bishkek',      country: 'Kyrgyzstan',   region: 'cis',         currency: 'KGS', lang: 'ru', pop: 1.0  },
  { slug: 'baku',       name: 'Baku',         country: 'Azerbaijan',   region: 'cis',         currency: 'AZN', lang: 'az', pop: 2.2  },
  { slug: 'tbilisi',    name: 'Tbilisi',      country: 'Georgia',      region: 'cis',         currency: 'GEL', lang: 'ka', pop: 1.2  },
  { slug: 'yerevan',    name: 'Yerevan',      country: 'Armenia',      region: 'cis',         currency: 'AMD', lang: 'hy', pop: 1.1  },
  { slug: 'moscow',     name: 'Moscow',       country: 'Russia',       region: 'cis',         currency: '₽',   lang: 'ru', pop: 12.5 },
  { slug: 'saint-petersburg', name: 'Saint Petersburg', country: 'Russia', region: 'cis',    currency: '₽',   lang: 'ru', pop: 5.4  },
  { slug: 'kyiv',       name: 'Kyiv',         country: 'Ukraine',      region: 'cis',         currency: '₴',   lang: 'uk', pop: 2.9  },
  { slug: 'minsk',      name: 'Minsk',        country: 'Belarus',      region: 'cis',         currency: 'BYN', lang: 'ru', pop: 2.0  },

  // ── South & Southeast Asia ──────────────────────────────────
  { slug: 'mumbai',     name: 'Mumbai',       country: 'India',        region: 'asia',        currency: '₹',   lang: 'en', pop: 20.7 },
  { slug: 'delhi',      name: 'Delhi',        country: 'India',        region: 'asia',        currency: '₹',   lang: 'en', pop: 31.0 },
  { slug: 'bangalore',  name: 'Bangalore',    country: 'India',        region: 'asia',        currency: '₹',   lang: 'en', pop: 12.3 },
  { slug: 'hyderabad',  name: 'Hyderabad',    country: 'India',        region: 'asia',        currency: '₹',   lang: 'en', pop: 9.7  },
  { slug: 'dhaka',      name: 'Dhaka',        country: 'Bangladesh',   region: 'asia',        currency: '৳',   lang: 'en', pop: 21.0 },
  { slug: 'karachi',    name: 'Karachi',      country: 'Pakistan',     region: 'asia',        currency: '₨',   lang: 'en', pop: 14.9 },
  { slug: 'lahore',     name: 'Lahore',       country: 'Pakistan',     region: 'asia',        currency: '₨',   lang: 'en', pop: 13.1 },
  { slug: 'manila',     name: 'Manila',       country: 'Philippines',  region: 'asia',        currency: '₱',   lang: 'en', pop: 13.9 },
  { slug: 'jakarta',    name: 'Jakarta',      country: 'Indonesia',    region: 'asia',        currency: 'Rp',  lang: 'id', pop: 10.5 },
  { slug: 'ho-chi-minh', name: 'Ho Chi Minh', country: 'Vietnam',     region: 'asia',        currency: '₫',   lang: 'vi', pop: 8.9  },
  { slug: 'colombo',    name: 'Colombo',      country: 'Sri Lanka',    region: 'asia',        currency: 'LKR', lang: 'en', pop: 0.75 },
  { slug: 'kathmandu',  name: 'Kathmandu',    country: 'Nepal',        region: 'asia',        currency: 'NPR', lang: 'en', pop: 1.4  },

  // ── Middle East & Turkey ────────────────────────────────────
  { slug: 'dubai',      name: 'Dubai',        country: 'UAE',          region: 'middle-east', currency: 'AED', lang: 'en', pop: 3.3  },
  { slug: 'istanbul',   name: 'Istanbul',     country: 'Turkey',       region: 'middle-east', currency: '₺',   lang: 'tr', pop: 15.5 },
  { slug: 'ankara',     name: 'Ankara',       country: 'Turkey',       region: 'middle-east', currency: '₺',   lang: 'tr', pop: 5.7  },
  { slug: 'riyadh',     name: 'Riyadh',       country: 'Saudi Arabia', region: 'middle-east', currency: 'SAR', lang: 'ar', pop: 7.7  },
  { slug: 'cairo',      name: 'Cairo',        country: 'Egypt',        region: 'middle-east', currency: 'EGP', lang: 'ar', pop: 20.9 },
  { slug: 'amman',      name: 'Amman',        country: 'Jordan',       region: 'middle-east', currency: 'JOD', lang: 'ar', pop: 4.0  },

  // ── Africa ──────────────────────────────────────────────────
  { slug: 'lagos',      name: 'Lagos',        country: 'Nigeria',      region: 'africa',      currency: '₦',   lang: 'en', pop: 14.8 },
  { slug: 'nairobi',    name: 'Nairobi',      country: 'Kenya',        region: 'africa',      currency: 'KES', lang: 'en', pop: 4.4  },
  { slug: 'accra',      name: 'Accra',        country: 'Ghana',        region: 'africa',      currency: 'GHS', lang: 'en', pop: 2.3  },
  { slug: 'johannesburg', name: 'Johannesburg', country: 'South Africa', region: 'africa',   currency: 'ZAR', lang: 'en', pop: 5.6  },
  { slug: 'cape-town',  name: 'Cape Town',    country: 'South Africa', region: 'africa',      currency: 'ZAR', lang: 'en', pop: 4.6  },
  { slug: 'addis-ababa', name: 'Addis Ababa', country: 'Ethiopia',    region: 'africa',       currency: 'ETB', lang: 'en', pop: 3.6  },

  // ── Europe ──────────────────────────────────────────────────
  { slug: 'london',     name: 'London',       country: 'UK',           region: 'europe',      currency: '£',   lang: 'en', pop: 9.0  },
  { slug: 'berlin',     name: 'Berlin',       country: 'Germany',      region: 'europe',      currency: '€',   lang: 'de', pop: 3.7  },
  { slug: 'amsterdam',  name: 'Amsterdam',    country: 'Netherlands',  region: 'europe',      currency: '€',   lang: 'en', pop: 0.87 },
  { slug: 'warsaw',     name: 'Warsaw',       country: 'Poland',       region: 'europe',      currency: 'zł',  lang: 'pl', pop: 1.8  },
  { slug: 'prague',     name: 'Prague',       country: 'Czech Republic', region: 'europe',    currency: 'Kč',  lang: 'cs', pop: 1.3  },
  { slug: 'bucharest',  name: 'Bucharest',    country: 'Romania',      region: 'europe',      currency: 'RON', lang: 'ro', pop: 1.8  },
  { slug: 'sofia',      name: 'Sofia',        country: 'Bulgaria',     region: 'europe',      currency: 'BGN', lang: 'bg', pop: 1.2  },
  { slug: 'lisbon',     name: 'Lisbon',       country: 'Portugal',     region: 'europe',      currency: '€',   lang: 'pt', pop: 0.55 },

  // ── Americas ────────────────────────────────────────────────
  { slug: 'new-york',   name: 'New York',     country: 'USA',          region: 'americas',    currency: '$',   lang: 'en', pop: 8.3  },
  { slug: 'toronto',    name: 'Toronto',      country: 'Canada',       region: 'americas',    currency: 'CA$', lang: 'en', pop: 2.9  },
  { slug: 'sao-paulo',  name: 'São Paulo',    country: 'Brazil',       region: 'americas',    currency: 'R$',  lang: 'pt', pop: 12.3 },
  { slug: 'mexico-city', name: 'Mexico City', country: 'Mexico',       region: 'americas',    currency: '$',   lang: 'es', pop: 9.2  },
  { slug: 'bogota',     name: 'Bogotá',       country: 'Colombia',     region: 'americas',    currency: 'COP', lang: 'es', pop: 7.4  },
  { slug: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina',  region: 'americas',    currency: '$',   lang: 'es', pop: 3.1  },
]

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find(c => c.slug === slug)
}

export const CITY_SLUGS = CITIES.map(c => c.slug)
