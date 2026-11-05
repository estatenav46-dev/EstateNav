import { Property } from './types';
import { calculatePricePerSqft } from './price';

const K_RERA_URL = 'https://rera.karnataka.gov.in/';
const AGENT = { agentName: 'SV Praveen', agentRera: 'PRM/KA/RERA/1251/310/AG/260916/007810' } as const;

const localProperties: Property[] = [
  {
    id: 'abhee-codename-new-dimension', title: 'Abhee Codename New Dimension', projectName: 'Abhee Codename New Dimension', developer: 'Abhee Ventures', listingFor: 'buy', propertyType: 'apartment', category: 'residential', status: 'pre-launch', featured: true, availability: 'available',
    city: 'Bengaluru', locality: 'Sarjapur–Whitefield Link Road', corridor: 'Sarjapur Road', address: 'Sarjapur–Whitefield Link Road, East Bengaluru',
    bhkLabel: '2, 2.5, 3, 3.5 & 4.5 BHK', bhkOptions: [2, 2.5, 3, 3.5, 4.5], carpetAreaMin: 1180, carpetAreaMax: 2850, areaUnit: 'sqft',
    priceMin: 13500000, priceLabel: '₹1.35 Cr onwards', priceType: 'onwards', isGuidePrice: true,
    possessionLabel: '2030 (Pre-Launch Priority)', possessionStatus: 'new-launch', images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'], coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Clubhouse'], reraNumber: 'PRM/KA/RERA/1251/308/PR/240520/006890', reraUrl: K_RERA_URL, ...AGENT, verified: true, grossYieldPercent: 4.9,
    shortDescription: 'A 45-acre township planned along the Sarjapur–Whitefield link road.', highlights: ['45-acre township', '3-acre golf course and academy zone', 'Four signature clubhouses', 'Mivan structural formwork'], postedOn: null, updatedAt: null, metaTitle: 'Abhee Codename New Dimension | Bengaluru', metaDescription: 'Apartment configurations, guide price and possession information for Abhee Codename New Dimension in Bengaluru.',
  },
  {
    id: 'abhee-celestial-city', title: 'Abhee Celestial City', projectName: 'Abhee Celestial City', developer: 'Abhee Ventures', listingFor: 'buy', propertyType: 'apartment', category: 'residential', status: 'under-construction', featured: false, availability: 'available',
    city: 'Bengaluru', locality: 'Near Dommasandra', corridor: 'Sarjapur Road', address: 'Sarjapur–Whitefield Road, Near Dommasandra',
    bhkLabel: '3+2 & 3+3 BHK Multi-Gen Apartments', carpetAreaMin: 1750, carpetAreaMax: 2420, areaUnit: 'sqft',
    priceMin: 19000000, priceLabel: '₹1.90 Cr onwards', priceType: 'onwards', isGuidePrice: true,
    possessionLabel: 'December 2026', possessionStatus: 'under-construction', images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    amenities: [], reraNumber: 'PRM/KA/RERA/1251/308/PR/231102/006378', reraUrl: K_RERA_URL, ...AGENT, verified: true,
    shortDescription: 'Multi-generation apartments near Dommasandra on Sarjapur–Whitefield Road.', highlights: ['3+2 and 3+3 BHK configurations', 'Near Greenwood High and Inventure Academy', '75% open greenery and podium landscaping', 'APF stated for HDFC, ICICI and SBI'], approvals: ['HDFC', 'ICICI', 'SBI'], postedOn: null, updatedAt: null, metaTitle: 'Abhee Celestial City | Bengaluru', metaDescription: 'Multi-generation apartments near Dommasandra with December 2026 possession label.',
  },
  {
    id: 'abhee-aaria', title: 'Abhee Aaria', projectName: 'Abhee Aaria', developer: 'Abhee Ventures', listingFor: 'buy', propertyType: 'apartment', category: 'residential', status: 'under-construction', featured: false, availability: 'available',
    city: 'Bengaluru', locality: 'Gunjur Main Road', corridor: 'Whitefield', address: 'Gunjur Main Road, East Bengaluru',
    bhkLabel: '2, 2.5, 3 & 4 BHK Luxury Apartments', bhkOptions: [2, 2.5, 3, 4], carpetAreaMin: 1240, carpetAreaMax: 2190, areaUnit: 'sqft',
    priceMin: 15000000, priceLabel: '₹1.50 Cr onwards', priceType: 'onwards', isGuidePrice: true,
    possessionLabel: 'September 2028', possessionStatus: 'under-construction', images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
    amenities: ['Swimming Pool', 'Clubhouse'], reraNumber: 'PRM/KA/RERA/1251/308/PR/240215/006612', reraUrl: K_RERA_URL, ...AGENT, verified: true, grossYieldPercent: 4.8,
    shortDescription: 'Apartments on Gunjur Main Road in East Bengaluru.', highlights: ['Gunjur Main Road location', '10 minutes to Outer Ring Road', 'Lake-facing vistas', 'Rooftop pool and co-working clubhouse lounge'], postedOn: null, updatedAt: null, metaTitle: 'Abhee Aaria | Bengaluru', metaDescription: 'Apartment configurations, carpet area and guide price for Abhee Aaria on Gunjur Main Road.',
  },
  {
    id: 'abhee-silicon-shine-phase-2', title: 'Abhee Silicon Shine (Phase 2)', projectName: 'Abhee Silicon Shine (Phase 2)', developer: 'Abhee Ventures', listingFor: 'buy', propertyType: 'apartment', category: 'residential', status: 'ready', featured: false, availability: 'available',
    city: 'Bengaluru', locality: 'Kodathi Gate', corridor: 'Sarjapur Road', address: 'Kodathi Gate, Sarjapur Road (Opp. Wipro SEZ)',
    bhkLabel: '2 & 3 BHK Tech-Executive Homes', bhkOptions: [2, 3], carpetAreaMin: 1050, carpetAreaMax: 1580, areaUnit: 'sqft',
    priceMin: 12000000, priceLabel: '₹1.20 Cr onwards', priceType: 'onwards', isGuidePrice: true,
    possessionLabel: 'Ready to Move In', possessionStatus: 'ready', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    amenities: [], reraNumber: 'PRM/KA/RERA/1251/308/PR/210810/004245', reraUrl: K_RERA_URL, ...AGENT, verified: true, grossYieldPercent: 5.4,
    shortDescription: 'Ready-to-move homes at Kodathi Gate, opposite Wipro SEZ.', highlights: ['Full OC and CC stated', 'Opposite Wipro SEZ', 'Zero GST liability stated for ready inventory', 'Ready tenancy demand stated'], postedOn: null, updatedAt: null, metaTitle: 'Abhee Silicon Shine Phase 2 | Bengaluru', metaDescription: 'Ready-to-move 2 and 3 BHK homes at Kodathi Gate, Sarjapur Road.',
  },
  {
    id: 'abhee-serenity-springs', title: 'Abhee Serenity Springs', projectName: 'Abhee Serenity Springs', developer: 'Abhee Ventures', listingFor: 'buy', propertyType: 'apartment', category: 'residential', status: 'under-construction', featured: false, availability: 'available',
    city: 'Bengaluru', locality: 'Bommasandra Industrial Area', corridor: 'Electronic City', address: 'Bommasandra Industrial Area, E-City Corridor',
    bhkLabel: '3+2 & 3+3 BHK Executive Suites', carpetAreaMin: 1380, carpetAreaMax: 2050, areaUnit: 'sqft',
    priceMin: 12000000, priceLabel: '₹1.20 Cr onwards', priceType: 'onwards', isGuidePrice: true,
    possessionLabel: 'December 2027', possessionStatus: 'under-construction', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    amenities: [], reraNumber: 'PRM/KA/RERA/1251/308/PR/240108/006520', reraUrl: K_RERA_URL, ...AGENT, verified: true, grossYieldPercent: 5.2,
    shortDescription: 'Executive suites in Bommasandra Industrial Area, E-City Corridor.', highlights: ['Bommasandra Industrial Area', 'Link to Namma Metro Yellow Line station', 'Waterbody views and wellness trail', 'EV charging bays stated for covered parking'], postedOn: null, updatedAt: null, metaTitle: 'Abhee Serenity Springs | Bengaluru', metaDescription: 'Executive suites in the Electronic City corridor with December 2027 possession label.',
  },
  {
    id: 'abhee-tranquila-plotted-enclave', title: 'Abhee Tranquila Plotted Enclave', projectName: 'Abhee Tranquila Plotted Enclave', developer: 'Abhee Ventures', listingFor: 'buy', propertyType: 'plot', category: 'plotted', status: 'under-construction', featured: false, availability: 'available',
    city: 'Bengaluru', locality: 'Sarjapur–Attibele Road', corridor: 'Sarjapur Road', address: 'Sarjapur–Attibele Road, South-East Bengaluru',
    bhkLabel: '1,200, 1,500, 1,600 & 1,800+ sq.ft. plots', plotAreaMin: 1200, plotAreaMax: null, areaUnit: 'sqft',
    priceMin: 9000000, priceLabel: '₹90 Lakhs onwards', priceType: 'onwards', isGuidePrice: true,
    possessionLabel: 'December 2026', possessionStatus: 'under-construction', images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    amenities: ['Security'], reraNumber: 'PRM/KA/RERA/1251/308/PR/230919/006271', reraUrl: K_RERA_URL, ...AGENT, verified: true,
    shortDescription: 'Plotted enclave on Sarjapur–Attibele Road in South-East Bengaluru.', highlights: ['BMRDA and RERA approval stated', '30 ft and 40 ft roads', 'Underground drainage and power ducting', 'Three-tier security with RFID access'], postedOn: null, updatedAt: null, metaTitle: 'Abhee Tranquila Plotted Enclave | Bengaluru', metaDescription: 'Plot sizes, guide price and possession information for Abhee Tranquila on Sarjapur–Attibele Road.',
  },
  {
    id: 'abhee-natura-plotted-reserve', title: 'Abhee Natura Plotted Reserve', projectName: 'Abhee Natura Plotted Reserve', developer: 'Abhee Ventures', listingFor: 'buy', propertyType: 'plot', category: 'plotted', status: 'ready', featured: false, availability: 'available',
    city: 'Bengaluru', locality: 'Whitefield Extension', corridor: 'Whitefield', address: 'Whitefield Extension, East Bengaluru',
    bhkLabel: '1,500 sq.ft. Premium Villa Plots', plotAreaMin: 1500, plotAreaMax: 1500, areaUnit: 'sqft',
    priceMin: 7000000, priceLabel: '₹70 Lakhs onwards', priceType: 'onwards', isGuidePrice: true,
    possessionLabel: 'Ready to Register', possessionStatus: 'ready', images: ['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
    amenities: [], reraNumber: 'PRM/KA/RERA/1251/308/PR/221015/005312', reraUrl: K_RERA_URL, ...AGENT, verified: true,
    shortDescription: 'Premium villa plots in Whitefield Extension, East Bengaluru.', highlights: ['Ready for immediate registry and mutation stated', 'Whitefield Extension location', 'Surrounded by gated villa communities', 'Clear legal title stated'], postedOn: null, updatedAt: null, metaTitle: 'Abhee Natura Plotted Reserve | Bengaluru', metaDescription: '1,500 sq.ft. villa plots in Whitefield Extension with ready-to-register status.',
  },
  {
    id: 'prestige-tech-cloud-tower-b', title: 'Prestige Tech Cloud – Tower B', projectName: 'Prestige Tech Cloud – Tower B', developer: 'Prestige Group (Partner Asset)', listingFor: 'rent', propertyType: 'office', category: 'commercial', status: 'ready', featured: true, availability: 'available',
    city: 'Bengaluru', locality: 'Hebbal-Devanahalli Expressway', corridor: 'North Bengaluru', address: 'Hebbal-Devanahalli Expressway, North Bengaluru',
    bhkLabel: 'Grade-A Warm Shell & Managed Suites', carpetAreaMin: 15000, carpetAreaMax: 85000, areaUnit: 'sqft',
    priceMin: 85, priceLabel: '₹85 / sq.ft / mo', priceType: 'per-sqft-month', isGuidePrice: true,
    possessionLabel: 'Ready for Fitouts', possessionStatus: 'ready', images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    amenities: [], reraNumber: 'PRM/KA/RERA/1251/309/PR/200115/003180', reraUrl: K_RERA_URL, ...AGENT, verified: true, capRatePercent: 8.9,
    shortDescription: 'Grade-A warm-shell and managed office suites on the Hebbal-Devanahalli Expressway.', highlights: ['Ready for fitouts', 'IGBC Platinum green building stated', 'Power backup stated', 'Pre-leased portfolio and 9-year lock-in stated'], postedOn: null, updatedAt: null, metaTitle: 'Prestige Tech Cloud Tower B | Bengaluru', metaDescription: 'Grade-A office suites with ready-for-fitouts status on the Hebbal-Devanahalli Expressway.',
  },
  {
    id: 'orr-innovation-hub-bellandur', title: 'ORR Innovation Hub – Bellandur', projectName: 'ORR Innovation Hub – Bellandur', developer: 'Commercial Alliance', listingFor: 'rent', propertyType: 'office', category: 'commercial', status: 'ready', featured: false, availability: 'available',
    city: 'Bengaluru', locality: 'Kadubeesanahalli Junction', corridor: 'Other', address: 'Outer Ring Road, Kadubeesanahalli Junction',
    bhkLabel: '10,000 - 45,000 sq.ft. Floorplates', superAreaMin: 10000, superAreaMax: 45000, areaUnit: 'sqft',
    priceMin: 118, priceLabel: '₹118 / sq.ft / mo', priceType: 'per-sqft-month', isGuidePrice: true,
    possessionLabel: 'Immediate Occupancy', possessionStatus: 'ready', images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'], coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    amenities: [], reraNumber: 'PRM/KA/RERA/1251/309/PR/210405/004085', reraUrl: K_RERA_URL, ...AGENT, verified: true, capRatePercent: 9.4,
    shortDescription: 'Office floorplates on Outer Ring Road at Kadubeesanahalli Junction.', highlights: ['Immediate occupancy', 'Outer Ring Road arterial frontage', 'Near Ecospace and Kadubeesanahalli Metro Station', 'Dual high-speed fiber ingress stated'], postedOn: null, updatedAt: null, metaTitle: 'ORR Innovation Hub Bellandur | Bengaluru', metaDescription: 'Office floorplates for rent on Outer Ring Road at Kadubeesanahalli Junction.',
  },
];

export const PROPERTIES: Property[] = localProperties.map((property) => {
  const area = property.plotAreaMin ?? property.carpetAreaMin ?? property.superAreaMin ?? property.builtUpAreaMin;
  const pricePerSqft = property.priceType === 'per-sqft-month' || area == null
    ? undefined
    : calculatePricePerSqft(property.priceMin, area);
  return { ...property, ...(pricePerSqft === undefined ? {} : { pricePerSqft }) };
});

export function validatePropertyData(properties: Property[]): void {
  if (properties.length !== 9) throw new Error(`Expected the nine migrated listings, received ${properties.length}`);
  const required: (keyof Property)[] = ['id', 'title', 'locality', 'corridor', 'coverImage', 'priceMin', 'priceLabel'];
  const reraPattern = /^PRM\/KA\/RERA\/\d{4}\/\d{3}\/PR\/\d{6}\/\d{6}$/;
  for (const property of properties) {
    for (const key of required) {
      if (property[key] === undefined || property[key] === null || property[key] === '') throw new Error(`Property ${property.id} is missing ${key}`);
    }
    if (property.reraNumber && !reraPattern.test(property.reraNumber)) throw new Error(`Property ${property.id} has an invalid RERA number`);
  }
}

validatePropertyData(PROPERTIES);

// Compatibility export for the untouched Firebase adapter. App code reads through lib/properties.ts.
export const INITIAL_PROPERTIES: any[] = PROPERTIES;

