'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

// Use a geography file with proper ISO codes
// This one has ISO_A2 codes in properties
const geoUrl = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'

// Comprehensive ISO_A3 to ISO_A2 mapping
const ISO3_TO_ISO2: { [key: string]: string } = {
  'AFG': 'AF', 'ALA': 'AX', 'ALB': 'AL', 'DZA': 'DZ', 'ASM': 'AS', 'AND': 'AD',
  'AGO': 'AO', 'AIA': 'AI', 'ATA': 'AQ', 'ATG': 'AG', 'ARG': 'AR', 'ARM': 'AM',
  'ABW': 'AW', 'AUS': 'AU', 'AUT': 'AT', 'AZE': 'AZ', 'BHS': 'BS', 'BHR': 'BH',
  'BGD': 'BD', 'BRB': 'BB', 'BLR': 'BY', 'BEL': 'BE', 'BLZ': 'BZ', 'BEN': 'BJ',
  'BMU': 'BM', 'BTN': 'BT', 'BOL': 'BO', 'BES': 'BQ', 'BIH': 'BA', 'BWA': 'BW',
  'BVT': 'BV', 'BRA': 'BR', 'IOT': 'IO', 'BRN': 'BN', 'BGR': 'BG', 'BFA': 'BF',
  'BDI': 'BI', 'CPV': 'CV', 'KHM': 'KH', 'CMR': 'CM', 'CAN': 'CA', 'CYM': 'KY',
  'CAF': 'CF', 'TCD': 'TD', 'CHL': 'CL', 'CHN': 'CN', 'CXR': 'CX', 'CCK': 'CC',
  'COL': 'CO', 'COM': 'KM', 'COG': 'CG', 'COD': 'CD', 'COK': 'CK', 'CRI': 'CR',
  'CIV': 'CI', 'HRV': 'HR', 'CUB': 'CU', 'CUW': 'CW', 'CYP': 'CY', 'CZE': 'CZ',
  'DNK': 'DK', 'DJI': 'DJ', 'DMA': 'DM', 'DOM': 'DO', 'ECU': 'EC', 'EGY': 'EG',
  'SLV': 'SV', 'GNQ': 'GQ', 'ERI': 'ER', 'EST': 'EE', 'ETH': 'ET', 'FLK': 'FK',
  'FRO': 'FO', 'FJI': 'FJ', 'FIN': 'FI', 'FRA': 'FR', 'GUF': 'GF', 'PYF': 'PF',
  'ATF': 'TF', 'GAB': 'GA', 'GMB': 'GM', 'GEO': 'GE', 'DEU': 'DE', 'GHA': 'GH',
  'GIB': 'GI', 'GRC': 'GR', 'GRL': 'GL', 'GRD': 'GD', 'GLP': 'GP', 'GUM': 'GU',
  'GTM': 'GT', 'GGY': 'GG', 'GIN': 'GN', 'GNB': 'GW', 'GUY': 'GY', 'HTI': 'HT',
  'HMD': 'HM', 'VAT': 'VA', 'HND': 'HN', 'HKG': 'HK', 'HUN': 'HU', 'ISL': 'IS',
  'IND': 'IN', 'IDN': 'ID', 'IRN': 'IR', 'IRQ': 'IQ', 'IRL': 'IE', 'IMN': 'IM',
  'ISR': 'IL', 'ITA': 'IT', 'JAM': 'JM', 'JPN': 'JP', 'JEY': 'JE', 'JOR': 'JO',
  'KAZ': 'KZ', 'KEN': 'KE', 'KIR': 'KI', 'PRK': 'KP', 'KOR': 'KR', 'KWT': 'KW',
  'KGZ': 'KG', 'LAO': 'LA', 'LVA': 'LV', 'LBN': 'LB', 'LSO': 'LS', 'LBR': 'LR',
  'LBY': 'LY', 'LIE': 'LI', 'LTU': 'LT', 'LUX': 'LU', 'MAC': 'MO', 'MKD': 'MK',
  'MDG': 'MG', 'MWI': 'MW', 'MYS': 'MY', 'MDV': 'MV', 'MLI': 'ML', 'MLT': 'MT',
  'MHL': 'MH', 'MTQ': 'MQ', 'MRT': 'MR', 'MUS': 'MU', 'MYT': 'YT', 'MEX': 'MX',
  'FSM': 'FM', 'MDA': 'MD', 'MCO': 'MC', 'MNG': 'MN', 'MNE': 'ME', 'MSR': 'MS',
  'MAR': 'MA', 'MOZ': 'MZ', 'MMR': 'MM', 'NAM': 'NA', 'NRU': 'NR', 'NPL': 'NP',
  'NLD': 'NL', 'NCL': 'NC', 'NZL': 'NZ', 'NIC': 'NI', 'NER': 'NE', 'NGA': 'NG',
  'NIU': 'NU', 'NFK': 'NF', 'MNP': 'MP', 'NOR': 'NO', 'OMN': 'OM', 'PAK': 'PK',
  'PLW': 'PW', 'PSE': 'PS', 'PAN': 'PA', 'PNG': 'PG', 'PRY': 'PY', 'PER': 'PE',
  'PHL': 'PH', 'PCN': 'PN', 'POL': 'PL', 'PRT': 'PT', 'PRI': 'PR', 'QAT': 'QA',
  'REU': 'RE', 'ROU': 'RO', 'RUS': 'RU', 'RWA': 'RW', 'BLM': 'BL', 'SHN': 'SH',
  'KNA': 'KN', 'LCA': 'LC', 'MAF': 'MF', 'SPM': 'PM', 'VCT': 'VC', 'WSM': 'WS',
  'SMR': 'SM', 'STP': 'ST', 'SAU': 'SA', 'SEN': 'SN', 'SRB': 'RS', 'SYC': 'SC',
  'SLE': 'SL', 'SGP': 'SG', 'SXM': 'SX', 'SVK': 'SK', 'SVN': 'SI', 'SLB': 'SB',
  'SOM': 'SO', 'ZAF': 'ZA', 'SGS': 'GS', 'SSD': 'SS', 'ESP': 'ES', 'LKA': 'LK',
  'SDN': 'SD', 'SUR': 'SR', 'SJM': 'SJ', 'SWZ': 'SZ', 'SWE': 'SE', 'CHE': 'CH',
  'SYR': 'SY', 'TWN': 'TW', 'TJK': 'TJ', 'TZA': 'TZ', 'THA': 'TH', 'TLS': 'TL',
  'TGO': 'TG', 'TKL': 'TK', 'TON': 'TO', 'TTO': 'TT', 'TUN': 'TN', 'TUR': 'TR',
  'TKM': 'TM', 'TCA': 'TC', 'TUV': 'TV', 'UGA': 'UG', 'UKR': 'UA', 'ARE': 'AE',
  'GBR': 'GB', 'USA': 'US', 'UMI': 'UM', 'URY': 'UY', 'UZB': 'UZ', 'VUT': 'VU',
  'VEN': 'VE', 'VNM': 'VN', 'VGB': 'VG', 'VIR': 'VI', 'WLF': 'WF', 'ESH': 'EH',
  'YEM': 'YE', 'ZMB': 'ZM', 'ZWE': 'ZW'
}

interface WorldMapProps {
  onCountryClick: (countryCode: string) => void
}

// Mapping from numeric UN M49 codes to ISO_A2 (world-atlas uses these)
const NUMERIC_TO_ISO2: { [key: string]: string } = {
  '4': 'AF', '8': 'AL', '12': 'DZ', '16': 'AS', '20': 'AD', '24': 'AO',
  '28': 'AG', '31': 'AZ', '32': 'AR', '36': 'AU', '40': 'AT', '44': 'BS',
  '48': 'BH', '50': 'BD', '51': 'AM', '52': 'BB', '56': 'BE', '60': 'BM',
  '64': 'BT', '68': 'BO', '70': 'BA', '72': 'BW', '76': 'BR', '84': 'BZ',
  '86': 'IO', '90': 'SB', '92': 'VG', '96': 'BN', '100': 'BG', '104': 'MM',
  '108': 'BI', '112': 'BY', '116': 'KH', '120': 'CM', '124': 'CA', '132': 'CV',
  '136': 'KY', '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL', '156': 'CN',
  '158': 'TW', '162': 'CX', '166': 'CC', '170': 'CO', '174': 'KM', '175': 'YT',
  '178': 'CG', '180': 'CD', '184': 'CK', '188': 'CR', '191': 'HR', '192': 'CU',
  '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM', '214': 'DO',
  '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER', '233': 'EE',
  '234': 'FO', '238': 'FK', '239': 'GS', '242': 'FJ', '246': 'FI', '248': 'AX',
  '250': 'FR', '254': 'GF', '258': 'PF', '260': 'TF', '262': 'DJ', '266': 'GA',
  '268': 'GE', '270': 'GM', '275': 'PS', '276': 'DE', '288': 'GH', '292': 'GI',
  '296': 'KI', '300': 'GR', '304': 'GL', '308': 'GD', '312': 'GP', '316': 'GU',
  '320': 'GT', '324': 'GN', '328': 'GY', '332': 'HT', '334': 'HM', '336': 'VA',
  '340': 'HN', '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN', '360': 'ID',
  '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI',
  '388': 'JM', '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP',
  '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA', '422': 'LB', '426': 'LS',
  '428': 'LV', '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT', '442': 'LU',
  '446': 'MO', '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV', '466': 'ML',
  '470': 'MT', '474': 'MQ', '478': 'MR', '480': 'MU', '484': 'MX', '492': 'MC',
  '496': 'MN', '498': 'MD', '499': 'ME', '500': 'MS', '504': 'MA', '508': 'MZ',
  '512': 'OM', '516': 'NA', '520': 'NR', '524': 'NP', '528': 'NL', '531': 'CW',
  '533': 'AW', '534': 'SX', '535': 'BQ', '540': 'NC', '548': 'VU', '554': 'NZ',
  '558': 'NI', '562': 'NE', '566': 'NG', '570': 'NU', '574': 'NF', '578': 'NO',
  '580': 'MP', '581': 'UM', '583': 'FM', '584': 'MH', '585': 'PW', '586': 'PK',
  '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH', '612': 'PN',
  '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL', '630': 'PR', '634': 'QA',
  '638': 'RE', '642': 'RO', '643': 'RU', '646': 'RW', '652': 'BL', '654': 'SH',
  '659': 'KN', '660': 'AI', '662': 'LC', '663': 'MF', '666': 'PM', '670': 'VC',
  '674': 'SM', '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC',
  '694': 'SL', '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO',
  '710': 'ZA', '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD', '732': 'EH',
  '740': 'SR', '744': 'SJ', '748': 'SZ', '752': 'SE', '756': 'CH', '760': 'SY',
  '762': 'TJ', '764': 'TH', '768': 'TG', '772': 'TK', '776': 'TO', '780': 'TT',
  '784': 'AE', '788': 'TN', '792': 'TR', '795': 'TM', '796': 'TC', '798': 'TV',
  '800': 'UG', '804': 'UA', '807': 'MK', '818': 'EG', '826': 'GB', '831': 'GG',
  '832': 'JE', '833': 'IM', '834': 'TZ', '840': 'US', '850': 'VI', '854': 'BF',
  '858': 'UY', '860': 'UZ', '862': 'VE', '876': 'WF', '882': 'WS', '887': 'YE',
  '894': 'ZM'
}

// Helper function to extract country code from geography
function getCountryCode(geo: any): string | null {
  const properties = geo.properties || {}
  
  // First try ISO_A2 directly
  if (properties.ISO_A2 && typeof properties.ISO_A2 === 'string' && properties.ISO_A2.length === 2) {
    return properties.ISO_A2.toUpperCase()
  }
  
  // Try ISO2
  if (properties.ISO2 && typeof properties.ISO2 === 'string' && properties.ISO2.length === 2) {
    return properties.ISO2.toUpperCase()
  }
  
  // Try iso_a2 (lowercase)
  if (properties.iso_a2 && typeof properties.iso_a2 === 'string' && properties.iso_a2.length === 2) {
    return properties.iso_a2.toUpperCase()
  }
  
  // Try ISO_A2_EH (extended)
  if (properties.ISO_A2_EH && typeof properties.ISO_A2_EH === 'string' && properties.ISO_A2_EH.length === 2) {
    return properties.ISO_A2_EH.toUpperCase()
  }
  
  // Try geo.id - could be numeric or ISO code
  if (geo.id) {
    const idStr = String(geo.id)
    
    // If it's a 3-letter ISO code (like 'USA'), map it
    if (idStr.length === 3 && ISO3_TO_ISO2[idStr.toUpperCase()]) {
      return ISO3_TO_ISO2[idStr.toUpperCase()]
    }
    
    // If it's a 2-letter code, use it directly
    if (idStr.length === 2) {
      return idStr.toUpperCase()
    }
    
    // Try numeric ID mapping (world-atlas uses numeric UN M49 codes)
    if (NUMERIC_TO_ISO2[idStr]) {
      return NUMERIC_TO_ISO2[idStr]
    }
  }
  
  // Try ISO_A3 (3-letter code) and map it to ISO_A2
  const iso3 = properties.ISO_A3 || properties.ISO_A3_EH || properties.ADM0_A3 || properties.iso_a3
  if (iso3 && typeof iso3 === 'string' && iso3.length === 3 && ISO3_TO_ISO2[iso3.toUpperCase()]) {
    return ISO3_TO_ISO2[iso3.toUpperCase()]
  }
  
  // Try NAME-based mapping
  const name = properties.NAME || properties.NAME_LONG || properties.NAME_EN || properties.name || properties.NAME_SORT
  if (name) {
    const nameToCode: { [key: string]: string } = {
      'France': 'FR',
      'Morocco': 'MA',
      'Spain': 'ES',
      'United States': 'US',
      'United States of America': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'Italy': 'IT',
      'Portugal': 'PT',
      'Belgium': 'BE',
      'Netherlands': 'NL',
      'Switzerland': 'CH',
      'Austria': 'AT',
      'Canada': 'CA',
      'Australia': 'AU',
      'Japan': 'JP',
      'China': 'CN',
      'India': 'IN',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'Argentina': 'AR',
      'Egypt': 'EG',
      'South Africa': 'ZA',
      'Nigeria': 'NG',
      'Kenya': 'KE',
    }
    const normalizedName = name.trim()
    if (nameToCode[normalizedName]) {
      return nameToCode[normalizedName]
    }
  }
  
  return null
}

export default function WorldMap({ onCountryClick }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [position, setPosition] = useState({ coordinates: [2, 46] as [number, number], zoom: 1 })

  // Focus countries: France and Morocco
  const focusCountries = ['FR', 'MA']

  const handleMoveEnd = (position: any) => {
    if (position) {
      setPosition({
        coordinates: position.coordinates || [2, 46],
        zoom: position.zoom || 1,
      })
    }
  }

  const handleZoomIn = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.min((prev.zoom || 1) * 1.5, 8),
    }))
  }

  const handleZoomOut = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.max((prev.zoom || 1) / 1.5, 1),
    }))
  }

  const handleReset = () => {
    setPosition({ coordinates: [2, 46], zoom: 1 })
  }

  const handleCountryClick = (geo: any) => {
    const countryCode = getCountryCode(geo)
    const properties = geo.properties || {}
    const countryName = properties.NAME || properties.NAME_LONG || properties.NAME_EN
    
    console.log('Country clicked:', {
      countryCode,
      countryName,
      geoId: geo.id,
      allProperties: Object.keys(properties),
      fullProperties: properties,
      ISO_A2: properties.ISO_A2,
      ISO_A3: properties.ISO_A3,
      NAME: properties.NAME,
      rsmKey: geo.rsmKey
    })
    
    if (countryCode && countryCode !== 'AQ') { // Skip Antarctica
      console.log('Navigating to:', `/country/${countryCode}`)
      onCountryClick(countryCode)
    } else {
      console.log('Invalid country code or Antarctica', countryCode)
    }
  }

  return (
    <div className="map-container relative">
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-white border border-gray-200"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-white border border-gray-200"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleReset}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-white border border-gray-200"
          aria-label="Reset zoom"
          title="Reset view"
        >
          <RotateCcw size={20} className="text-gray-700" />
        </button>
      </div>

      <ComposableMap
        projectionConfig={{
          scale: 147,
          center: [2, 46], // Focus on France/Morocco region
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryCode = getCountryCode(geo)
              const isFocused = countryCode && focusCountries.includes(countryCode)
              const isHovered = countryCode && hoveredCountry === countryCode

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isFocused ? '#FFB84D' : isHovered ? '#4A90E2' : '#E5E7EB'}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: {
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      cursor: countryCode && countryCode !== 'AQ' ? 'pointer' : 'default',
                    },
                    hover: {
                      fill: '#4A90E2',
                      outline: 'none',
                      filter: 'brightness(1.3) drop-shadow(0 0 8px rgba(74, 144, 226, 0.6))',
                      cursor: 'pointer',
                    },
                    pressed: {
                      outline: 'none',
                    },
                  }}
                  onMouseEnter={() => {
                    if (countryCode && countryCode !== 'AQ') {
                      setHoveredCountry(countryCode)
                    }
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleCountryClick(geo)
                  }}
                />
              )
            })
          }
        </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
