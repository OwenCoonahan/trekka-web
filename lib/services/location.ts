import { Country, State, City } from 'country-state-city'

export interface LocationData {
  country: string
  countryCode: string
  region: string
  subregion: string
  flagEmoji: string
  flag: string
  latitude?: string
  longitude?: string
}

// Country code to region mapping (since country-state-city doesn't include regions)
const COUNTRY_TO_REGION_MAP: Record<string, string> = {
  // North America
  'US': 'North America', 'CA': 'North America', 'MX': 'North America',
  'GL': 'North America', 'PM': 'North America',

  // Central America & Caribbean
  'BZ': 'Central America', 'CR': 'Central America', 'SV': 'Central America',
  'GT': 'Central America', 'HN': 'Central America', 'NI': 'Central America', 'PA': 'Central America',
  'AG': 'Caribbean', 'BS': 'Caribbean', 'BB': 'Caribbean', 'CU': 'Caribbean',
  'DM': 'Caribbean', 'DO': 'Caribbean', 'GD': 'Caribbean', 'HT': 'Caribbean',
  'JM': 'Caribbean', 'KN': 'Caribbean', 'LC': 'Caribbean', 'VC': 'Caribbean',
  'TT': 'Caribbean', 'AI': 'Caribbean', 'AW': 'Caribbean', 'BQ': 'Caribbean',
  'CW': 'Caribbean', 'GP': 'Caribbean', 'MQ': 'Caribbean', 'MS': 'Caribbean',
  'PR': 'Caribbean', 'BL': 'Caribbean', 'MF': 'Caribbean', 'SX': 'Caribbean',
  'TC': 'Caribbean', 'VG': 'Caribbean', 'VI': 'Caribbean', 'KY': 'Caribbean',

  // South America
  'AR': 'South America', 'BO': 'South America', 'BR': 'South America', 'CL': 'South America',
  'CO': 'South America', 'EC': 'South America', 'FK': 'South America', 'GF': 'South America',
  'GY': 'South America', 'PY': 'South America', 'PE': 'South America', 'SR': 'South America',
  'UY': 'South America', 'VE': 'South America',

  // Europe
  'AD': 'Europe', 'AL': 'Europe', 'AT': 'Europe', 'BY': 'Europe', 'BE': 'Europe',
  'BA': 'Europe', 'BG': 'Europe', 'HR': 'Europe', 'CZ': 'Europe', 'DK': 'Europe',
  'EE': 'Europe', 'FI': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'GR': 'Europe',
  'HU': 'Europe', 'IS': 'Europe', 'IE': 'Europe', 'IT': 'Europe', 'XK': 'Europe',
  'LV': 'Europe', 'LI': 'Europe', 'LT': 'Europe', 'LU': 'Europe', 'MT': 'Europe',
  'MD': 'Europe', 'MC': 'Europe', 'ME': 'Europe', 'NL': 'Europe', 'MK': 'Europe',
  'NO': 'Europe', 'PL': 'Europe', 'PT': 'Europe', 'RO': 'Europe', 'RU': 'Europe',
  'SM': 'Europe', 'RS': 'Europe', 'SK': 'Europe', 'SI': 'Europe', 'ES': 'Europe',
  'SE': 'Europe', 'CH': 'Europe', 'UA': 'Europe', 'GB': 'Europe', 'VA': 'Europe',
  'AX': 'Europe', 'FO': 'Europe', 'GG': 'Europe', 'IM': 'Europe', 'JE': 'Europe',
  'SJ': 'Europe', 'CY': 'Europe', 'TR': 'Europe',

  // Asia
  'AF': 'Asia', 'AM': 'Asia', 'AZ': 'Asia', 'BH': 'Asia', 'BD': 'Asia',
  'BT': 'Asia', 'BN': 'Asia', 'KH': 'Asia', 'CN': 'Asia', 'GE': 'Asia',
  'IN': 'Asia', 'ID': 'Asia', 'IR': 'Asia', 'IQ': 'Asia', 'IL': 'Asia',
  'JP': 'Asia', 'JO': 'Asia', 'KZ': 'Asia', 'KW': 'Asia', 'KG': 'Asia',
  'LA': 'Asia', 'LB': 'Asia', 'MY': 'Asia', 'MV': 'Asia', 'MN': 'Asia',
  'MM': 'Asia', 'NP': 'Asia', 'KP': 'Asia', 'OM': 'Asia', 'PK': 'Asia',
  'PS': 'Asia', 'PH': 'Asia', 'QA': 'Asia', 'SA': 'Asia', 'SG': 'Asia',
  'KR': 'Asia', 'LK': 'Asia', 'SY': 'Asia', 'TJ': 'Asia', 'TH': 'Asia',
  'TL': 'Asia', 'TM': 'Asia', 'AE': 'Asia', 'UZ': 'Asia', 'VN': 'Asia',
  'YE': 'Asia', 'HK': 'Asia', 'MO': 'Asia', 'TW': 'Asia',

  // Africa
  'DZ': 'Africa', 'AO': 'Africa', 'BJ': 'Africa', 'BW': 'Africa', 'BF': 'Africa',
  'BI': 'Africa', 'CV': 'Africa', 'CM': 'Africa', 'CF': 'Africa', 'TD': 'Africa',
  'KM': 'Africa', 'CG': 'Africa', 'CD': 'Africa', 'CI': 'Africa', 'DJ': 'Africa',
  'EG': 'Africa', 'GQ': 'Africa', 'ER': 'Africa', 'SZ': 'Africa', 'ET': 'Africa',
  'GA': 'Africa', 'GM': 'Africa', 'GH': 'Africa', 'GN': 'Africa', 'GW': 'Africa',
  'KE': 'Africa', 'LS': 'Africa', 'LR': 'Africa', 'LY': 'Africa', 'MG': 'Africa',
  'MW': 'Africa', 'ML': 'Africa', 'MR': 'Africa', 'MU': 'Africa', 'YT': 'Africa',
  'MA': 'Africa', 'MZ': 'Africa', 'NA': 'Africa', 'NE': 'Africa', 'NG': 'Africa',
  'RE': 'Africa', 'RW': 'Africa', 'SH': 'Africa', 'ST': 'Africa', 'SN': 'Africa',
  'SC': 'Africa', 'SL': 'Africa', 'SO': 'Africa', 'ZA': 'Africa', 'SS': 'Africa',
  'SD': 'Africa', 'TZ': 'Africa', 'TG': 'Africa', 'TN': 'Africa', 'UG': 'Africa',
  'EH': 'Africa', 'ZM': 'Africa', 'ZW': 'Africa',

  // Oceania
  'AS': 'Oceania', 'AU': 'Oceania', 'CK': 'Oceania', 'FJ': 'Oceania', 'PF': 'Oceania',
  'GU': 'Oceania', 'KI': 'Oceania', 'MH': 'Oceania', 'FM': 'Oceania', 'NR': 'Oceania',
  'NC': 'Oceania', 'NZ': 'Oceania', 'NU': 'Oceania', 'NF': 'Oceania', 'MP': 'Oceania',
  'PW': 'Oceania', 'PG': 'Oceania', 'PN': 'Oceania', 'WS': 'Oceania', 'SB': 'Oceania',
  'TK': 'Oceania', 'TO': 'Oceania', 'TV': 'Oceania', 'VU': 'Oceania', 'WF': 'Oceania'
}

// US States and territories mapping
const US_STATES_MAP: Record<string, string> = {
  // Full state names
  'alabama': 'US', 'alaska': 'US', 'arizona': 'US', 'arkansas': 'US', 'california': 'US',
  'colorado': 'US', 'connecticut': 'US', 'delaware': 'US', 'florida': 'US', 'georgia': 'US',
  'hawaii': 'US', 'idaho': 'US', 'illinois': 'US', 'indiana': 'US', 'iowa': 'US',
  'kansas': 'US', 'kentucky': 'US', 'louisiana': 'US', 'maine': 'US', 'maryland': 'US',
  'massachusetts': 'US', 'michigan': 'US', 'minnesota': 'US', 'mississippi': 'US', 'missouri': 'US',
  'montana': 'US', 'nebraska': 'US', 'nevada': 'US', 'new hampshire': 'US', 'new jersey': 'US',
  'new mexico': 'US', 'new york': 'US', 'north carolina': 'US', 'north dakota': 'US', 'ohio': 'US',
  'oklahoma': 'US', 'oregon': 'US', 'pennsylvania': 'US', 'rhode island': 'US', 'south carolina': 'US',
  'south dakota': 'US', 'tennessee': 'US', 'texas': 'US', 'utah': 'US', 'vermont': 'US',
  'virginia': 'US', 'washington': 'US', 'west virginia': 'US', 'wisconsin': 'US', 'wyoming': 'US',

  // State abbreviations
  'al': 'US', 'ak': 'US', 'az': 'US', 'ar': 'US', 'ca': 'US', 'co': 'US', 'ct': 'US',
  'de': 'US', 'fl': 'US', 'ga': 'US', 'hi': 'US', 'id': 'US', 'il': 'US', 'in': 'US',
  'ia': 'US', 'ks': 'US', 'ky': 'US', 'la': 'US', 'me': 'US', 'md': 'US', 'ma': 'US',
  'mi': 'US', 'mn': 'US', 'ms': 'US', 'mo': 'US', 'mt': 'US', 'ne': 'US', 'nv': 'US',
  'nh': 'US', 'nj': 'US', 'nm': 'US', 'ny': 'US', 'nc': 'US', 'nd': 'US', 'oh': 'US',
  'ok': 'US', 'or': 'US', 'pa': 'US', 'ri': 'US', 'sc': 'US', 'sd': 'US', 'tn': 'US',
  'tx': 'US', 'ut': 'US', 'vt': 'US', 'va': 'US', 'wa': 'US', 'wv': 'US', 'wi': 'US', 'wy': 'US',

  // Territories
  'puerto rico': 'US', 'pr': 'US', 'virgin islands': 'US', 'vi': 'US', 'guam': 'US', 'gu': 'US',
  'american samoa': 'US', 'as': 'US', 'northern mariana islands': 'US', 'mp': 'US'
}

// Canadian provinces and territories
const CANADIAN_PROVINCES_MAP: Record<string, string> = {
  // Full province names
  'alberta': 'CA', 'british columbia': 'CA', 'manitoba': 'CA', 'new brunswick': 'CA',
  'newfoundland and labrador': 'CA', 'northwest territories': 'CA', 'nova scotia': 'CA',
  'nunavut': 'CA', 'ontario': 'CA', 'prince edward island': 'CA', 'quebec': 'CA',
  'saskatchewan': 'CA', 'yukon': 'CA',

  // Province abbreviations
  'ab': 'CA', 'bc': 'CA', 'mb': 'CA', 'nb': 'CA', 'nl': 'CA', 'nt': 'CA', 'ns': 'CA',
  'nu': 'CA', 'on': 'CA', 'pe': 'CA', 'qc': 'CA', 'sk': 'CA', 'yt': 'CA'
}

// Common city-to-country mappings for better matching
const CITY_TO_COUNTRY_MAP: Record<string, string> = {
  // United States cities (major cities)
  'new york': 'US', 'nyc': 'US', 'manhattan': 'US', 'brooklyn': 'US',
  'los angeles': 'US', 'la': 'US', 'san francisco': 'US', 'sf': 'US',
  'chicago': 'US', 'miami': 'US', 'las vegas': 'US', 'seattle': 'US',
  'boston': 'US', 'washington': 'US', 'atlanta': 'US', 'philadelphia': 'US',
  'phoenix': 'US', 'denver': 'US', 'orlando': 'US', 'honolulu': 'US',

  // More US cities
  'austin': 'US', 'dallas': 'US', 'houston': 'US', 'san antonio': 'US', 'fort worth': 'US',
  'charlotte': 'US', 'detroit': 'US', 'portland': 'US', 'nashville': 'US', 'memphis': 'US',
  'baltimore': 'US', 'milwaukee': 'US', 'albuquerque': 'US', 'tucson': 'US', 'fresno': 'US',
  'sacramento': 'US', 'kansas city': 'US', 'mesa': 'US', 'virginia beach': 'US', 'omaha': 'US',
  'colorado springs': 'US', 'raleigh': 'US', 'long beach': 'US', 'miami beach': 'US',
  'salt lake city': 'US', 'cleveland': 'US', 'pittsburgh': 'US', 'cincinnati': 'US',
  'minneapolis': 'US', 'tampa': 'US', 'st louis': 'US', 'new orleans': 'US',
  'buffalo': 'US', 'jersey city': 'US', 'rochester': 'US', 'spokane': 'US',

  // Utah cities specifically
  'moab': 'US', 'park city': 'US', 'provo': 'US', 'ogden': 'US', 'st george': 'US',

  // UK cities
  'london': 'GB', 'manchester': 'GB', 'birmingham': 'GB', 'liverpool': 'GB',
  'edinburgh': 'GB', 'glasgow': 'GB', 'bristol': 'GB', 'leeds': 'GB',

  // Canada
  'toronto': 'CA', 'vancouver': 'CA', 'montreal': 'CA', 'calgary': 'CA',
  'ottawa': 'CA', 'quebec city': 'CA',

  // Australia
  'sydney': 'AU', 'melbourne': 'AU', 'perth': 'AU', 'brisbane': 'AU',
  'adelaide': 'AU', 'darwin': 'AU',

  // European cities
  'paris': 'FR', 'berlin': 'DE', 'rome': 'IT', 'madrid': 'ES',
  'amsterdam': 'NL', 'vienna': 'AT', 'zurich': 'CH', 'geneva': 'CH',
  'brussels': 'BE', 'stockholm': 'SE', 'oslo': 'NO', 'copenhagen': 'DK',
  'prague': 'CZ', 'warsaw': 'PL', 'budapest': 'HU', 'athens': 'GR',
  'lisbon': 'PT', 'barcelona': 'ES', 'milan': 'IT', 'florence': 'IT',
  'venice': 'IT', 'dublin': 'IE', 'helsinki': 'FI',

  // Asian cities
  'tokyo': 'JP', 'osaka': 'JP', 'kyoto': 'JP', 'seoul': 'KR',
  'beijing': 'CN', 'shanghai': 'CN', 'hong kong': 'HK', 'singapore': 'SG',
  'bangkok': 'TH', 'manila': 'PH', 'jakarta': 'ID', 'kuala lumpur': 'MY',
  'mumbai': 'IN', 'delhi': 'IN', 'bangalore': 'IN', 'chennai': 'IN',
  'dubai': 'AE', 'abu dhabi': 'AE', 'doha': 'QA', 'riyadh': 'SA',
  'tel aviv': 'IL', 'jerusalem': 'IL', 'istanbul': 'TR', 'ankara': 'TR',

  // South American cities
  'rio de janeiro': 'BR', 'sao paulo': 'BR', 'buenos aires': 'AR',
  'bogota': 'CO', 'lima': 'PE', 'santiago': 'CL', 'caracas': 'VE',

  // African cities
  'cairo': 'EG', 'cape town': 'ZA', 'johannesburg': 'ZA', 'lagos': 'NG',
  'casablanca': 'MA', 'nairobi': 'KE', 'tunis': 'TN', 'algiers': 'DZ'
}

class LocationService {
  private countries: any[]
  private countryMap: Map<string, any>
  private countryByCode: Map<string, any>

  constructor() {
    this.countries = Country.getAllCountries()
    this.countryMap = new Map()
    this.countryByCode = new Map()

    // Build lookup maps for fast searching
    this.countries.forEach(country => {
      // Map by country name (various forms)
      this.countryMap.set(country.name.toLowerCase(), country)
      this.countryMap.set(country.isoCode.toLowerCase(), country)
      this.countryByCode.set(country.isoCode, country)

      // Add common name variations
      if (country.name.includes('United States')) {
        this.countryMap.set('usa', country)
        this.countryMap.set('us', country)
        this.countryMap.set('united states', country)
        this.countryMap.set('america', country)
      }
      if (country.name.includes('United Kingdom')) {
        this.countryMap.set('uk', country)
        this.countryMap.set('england', country)
        this.countryMap.set('britain', country)
        this.countryMap.set('great britain', country)
      }
      if (country.name.includes('United Arab Emirates')) {
        this.countryMap.set('uae', country)
      }
    })
  }

  /**
   * Get location data from a destination string (e.g., "Paris, France" or "Tokyo")
   */
  getLocationData(destination: string): LocationData | null {
    if (!destination) return null

    const dest = destination.toLowerCase().trim()
    let country = null

    // First, check city-to-country mapping for exact matches
    const cityCountryCode = CITY_TO_COUNTRY_MAP[dest]
    if (cityCountryCode) {
      country = this.countryByCode.get(cityCountryCode)
    }

    // If no city match, check if destination contains a comma (likely "City, State/Country" format)
    if (!country && dest.includes(',')) {
      const parts = dest.split(',').map(part => part.trim())
      const lastPart = parts[parts.length - 1]

      // Check if the last part is a known city
      const lastPartCountryCode = CITY_TO_COUNTRY_MAP[lastPart]
      if (lastPartCountryCode) {
        country = this.countryByCode.get(lastPartCountryCode)
      } else {
        // Check if the last part is a US state
        const stateCountryCode = US_STATES_MAP[lastPart]
        if (stateCountryCode) {
          country = this.countryByCode.get(stateCountryCode)
        } else {
          // Check if the last part is a Canadian province
          const provinceCountryCode = CANADIAN_PROVINCES_MAP[lastPart]
          if (provinceCountryCode) {
            country = this.countryByCode.get(provinceCountryCode)
          } else {
            // Try country name matching
            country = this.countryMap.get(lastPart)
          }
        }
      }

      // If last part didn't work, try first part (in case format is "Country, City")
      if (!country) {
        const firstPart = parts[0]
        const firstPartCountryCode = CITY_TO_COUNTRY_MAP[firstPart]
        if (firstPartCountryCode) {
          country = this.countryByCode.get(firstPartCountryCode)
        } else {
          country = this.countryMap.get(firstPart)
        }
      }
    }

    // If no country found with comma, try the entire destination as a country
    if (!country) {
      country = this.countryMap.get(dest)
    }

    // If still no match, try more targeted partial matching (only for longer strings to avoid false matches)
    if (!country && dest.length > 3) {
      for (const [key, value] of this.countryMap.entries()) {
        // Only match if the country name is contained as a whole word
        if (key.length > 3 && dest.includes(key) && key !== 'new') {
          country = value
          break
        }
      }
    }

    if (!country) return null

    const region = COUNTRY_TO_REGION_MAP[country.isoCode] || 'Other'

    return {
      country: country.name,
      countryCode: country.isoCode,
      region: region,
      subregion: country.subregion || '',
      flagEmoji: country.flag,
      flag: country.flag,
      latitude: country.latitude,
      longitude: country.longitude
    }
  }

  /**
   * Get continent/region from destination
   */
  getRegion(destination: string): string {
    const locationData = this.getLocationData(destination)
    return locationData?.region || 'Other'
  }

  /**
   * Get country flag emoji
   */
  getFlagEmoji(destination: string): string {
    const locationData = this.getLocationData(destination)
    return locationData?.flagEmoji || '🏴'
  }

  /**
   * Get all available regions for filtering
   */
  getAllRegions(): string[] {
    const regions = new Set<string>()
    Object.values(COUNTRY_TO_REGION_MAP).forEach(region => {
      regions.add(region)
    })
    return Array.from(regions).sort()
  }

  /**
   * Get all countries for a specific region
   */
  getCountriesInRegion(region: string): any[] {
    return this.countries.filter(country => {
      return COUNTRY_TO_REGION_MAP[country.isoCode] === region
    })
  }

  /**
   * Search countries by name
   */
  searchCountries(query: string): any[] {
    const lowerQuery = query.toLowerCase()
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(lowerQuery) ||
      country.isoCode.toLowerCase().includes(lowerQuery)
    ).slice(0, 10) // Limit results
  }

  /**
   * Get country by code
   */
  getCountryByCode(code: string): any | null {
    return this.countryByCode.get(code) || null
  }
}

// Export singleton instance
export const locationService = new LocationService()
export default locationService