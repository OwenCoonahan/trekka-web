interface Country {
  name: {
    common: string
    official: string
  }
  flag: string
  cca2: string
}

// Cache for country data to avoid repeated API calls
let countriesCache: Country[] | null = null

export async function getCountries(): Promise<Country[]> {
  if (countriesCache) {
    return countriesCache
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,cca2')
    const countries = await response.json()
    countriesCache = countries
    return countries
  } catch (error) {
    console.error('Failed to fetch countries:', error)
    return []
  }
}

export function extractCountryFromDestination(destination: string): string | null {
  // Common patterns: "Paris, France", "Tokyo, Japan", "New York, USA"
  const parts = destination.split(',').map(part => part.trim())

  if (parts.length >= 2) {
    return parts[parts.length - 1] // Last part is usually the country
  }

  // If no comma, the whole string might be a country
  return destination.trim()
}

export async function getCountryFlag(destination: string): Promise<string | null> {
  const countryName = extractCountryFromDestination(destination)
  if (!countryName) return null

  const countries = await getCountries()

  // Try exact match first
  let country = countries.find(c =>
    c.name.common.toLowerCase() === countryName.toLowerCase() ||
    c.name.official.toLowerCase() === countryName.toLowerCase()
  )

  // If no exact match, try partial match
  if (!country) {
    country = countries.find(c =>
      c.name.common.toLowerCase().includes(countryName.toLowerCase()) ||
      c.name.official.toLowerCase().includes(countryName.toLowerCase()) ||
      countryName.toLowerCase().includes(c.name.common.toLowerCase())
    )
  }

  return country?.flag || null
}

// Common country name mappings for better matching
const countryAliases: Record<string, string> = {
  'usa': 'United States',
  'uk': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'south korea': 'Republic of Korea',
  'north korea': 'Democratic People\'s Republic of Korea',
  'russia': 'Russian Federation',
  'vietnam': 'Viet Nam',
  'czech republic': 'Czechia',
  'ivory coast': 'Côte d\'Ivoire',
}

export async function getCountryFlagWithAliases(destination: string): Promise<string | null> {
  const countryName = extractCountryFromDestination(destination)
  if (!countryName) return null

  const normalizedName = countryName.toLowerCase()
  const aliasedName = countryAliases[normalizedName] || countryName

  const countries = await getCountries()

  // Try with alias first, then original
  for (const searchName of [aliasedName, countryName]) {
    const country = countries.find(c =>
      c.name.common.toLowerCase() === searchName.toLowerCase() ||
      c.name.official.toLowerCase() === searchName.toLowerCase() ||
      c.name.common.toLowerCase().includes(searchName.toLowerCase()) ||
      c.name.official.toLowerCase().includes(searchName.toLowerCase())
    )

    if (country) return country.flag
  }

  return null
}