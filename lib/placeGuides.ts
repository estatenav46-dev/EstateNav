// What each region and area offers, shown beside the explore headline. Names only (no distances,
// travel times or prices): those vary by source and by project, so the advisor confirms them.
// Compiled 2026-11 from public sources, among them:
// - Whitefield: en.wikipedia.org/wiki/Whitefield,_Bengaluru; housing.com/news/itpl-property-market-overview
// - Outer Ring Road: nobroker.in/blog/it-tech-parks-in-bangalore; sobha.com/blog/localities-to-live-near-embassy-techvillage-bangalore
// - Varthur: housing.com/news/varthur-property-market-overview; nobroker.in/locality-iq/varthur-bangalore-liqlt
// - Sarjapur Road and Dommasandra: housing.com/news/sarjapur-road-property-market-overview;
//   brigadegroup.com/blog/residential/all-you-need-to-know-about-dommasandra-in-east-bangalore
// - Electronic City: en.wikipedia.org/wiki/Yellow_Line_(Namma_Metro); en.wikipedia.org/wiki/Electronic_City_metro_station
// - North Bengaluru: brigadegroup.com/blog/residential/hebbal-vs-devanahalli-luxury-buyers;
//   housing.com/news/top-localities-to-invest-in-property-near-bangalore-airport
// Update here when a project's area changes or a new region goes live.

export type GuideKind = 'work' | 'transit' | 'schools' | 'health' | 'leisure';
export type PlaceGuide = { intro: string; groups: { kind: GuideKind; items: string[] }[] };

export const GUIDE_LABEL: Record<GuideKind, string> = {
  work: 'Work hubs',
  transit: 'Getting around',
  schools: 'Schools',
  health: 'Hospitals',
  leisure: 'Around',
};

const ZONES: Record<string, PlaceGuide> = {
  all: {
    intro: 'Pick the side of the city that matches your commute and school run.',
    groups: [
      { kind: 'work', items: ['East: Whitefield and ORR tech parks', 'South: Electronic City', 'North: Manyata Tech Park'] },
      { kind: 'transit', items: ['Purple Line to Whitefield', 'Yellow Line to Electronic City', 'Airport on the north side'] },
      { kind: 'schools', items: ['South-East: Sarjapur Road international schools', 'East: Whitefield schools'] },
    ],
  },
  east: {
    intro: 'Bengaluru’s original IT belt, with the Purple Line metro running out to Whitefield.',
    groups: [
      { kind: 'work', items: ['ITPL', 'EPIP Zone', 'Embassy TechVillage', 'RMZ Ecospace', 'Prestige Tech Park'] },
      { kind: 'transit', items: ['Purple Line metro to Whitefield (Kadugodi)', 'Whitefield railway station', 'Outer Ring Road'] },
      { kind: 'schools', items: ['Deens Academy', 'Delhi Public School (East)', 'Chrysalis High'] },
      { kind: 'health', items: ['Vydehi Hospital', 'Manipal Hospital Whitefield', 'Cloudnine'] },
    ],
  },
  'south-east': {
    intro: 'A family corridor between the ORR tech parks and Attibele, known for its international schools.',
    groups: [
      { kind: 'work', items: ['Wipro Sarjapur Road campus', 'RGA Tech Park', 'Embassy TechVillage (ORR)'] },
      { kind: 'schools', items: ['Oakridge International', 'TISB', 'Greenwood High', 'Inventure Academy'] },
      { kind: 'transit', items: ['Sarjapur Main Road (SH-35)', 'Outer Ring Road', 'Hosur Road'] },
      { kind: 'leisure', items: ['Azim Premji University', 'Dommasandra and Attibele growth belt'] },
    ],
  },
  south: {
    intro: 'Electronic City’s IT campuses on Hosur Road, linked by the elevated expressway and the Yellow Line.',
    groups: [
      { kind: 'work', items: ['Infosys campus', 'Wipro Electronic City', 'Biocon', 'Bommasandra Industrial Area'] },
      { kind: 'transit', items: ['Yellow Line metro (RV Road – Bommasandra)', 'Electronic City Elevated Expressway', 'NICE Road'] },
      { kind: 'health', items: ['Narayana Health City'] },
    ],
  },
  north: {
    intro: 'Hebbal to Devanahalli along NH 44, anchored by Manyata Tech Park and the airport.',
    groups: [
      { kind: 'work', items: ['Manyata Tech Park', 'Kirloskar Business Park', 'KIADB Aerospace Park (Devanahalli)'] },
      { kind: 'transit', items: ['Kempegowda International Airport', 'NH 44 (Ballari Road)', 'Hebbal flyover'] },
      { kind: 'schools', items: ['Stonehill International', 'Canadian International School', 'Vidyashilp Academy'] },
      { kind: 'health', items: ['Aster CMI Hospital'] },
    ],
  },
};

const AREAS: Record<string, PlaceGuide> = {
  whitefield: {
    intro: 'Tech parks, the Purple Line and a deep bench of schools and hospitals.',
    groups: [
      { kind: 'work', items: ['ITPL', 'EPIP Zone', 'Brigade Tech Park'] },
      { kind: 'transit', items: ['Purple Line metro (Kadugodi)', 'Whitefield railway station'] },
      { kind: 'schools', items: ['Deens Academy', 'Delhi Public School (East)', 'Chrysalis High'] },
      { kind: 'health', items: ['Vydehi Hospital', 'Manipal Hospital Whitefield'] },
    ],
  },
  varthur: {
    intro: 'Between Whitefield and Sarjapur Road on Varthur Road, with lakes and newer gated communities.',
    groups: [
      { kind: 'work', items: ['Whitefield tech parks', 'Embassy TechVillage (ORR)'] },
      { kind: 'transit', items: ['Varthur Road (SH-35)', 'Sarjapur Road', 'Whitefield Main Road'] },
      { kind: 'schools', items: ['Whitefield Global School', 'Pratham International School'] },
      { kind: 'leisure', items: ['Varthur Lake'] },
    ],
  },
  'outer-ring-road': {
    intro: 'The Bellandur–Marathahalli office belt, home to many of the city’s largest tech parks.',
    groups: [
      { kind: 'work', items: ['Embassy TechVillage', 'RMZ Ecospace', 'Prestige Tech Park', 'Cessna Business Park'] },
      { kind: 'transit', items: ['Outer Ring Road', 'Sarjapur Road', 'Marathahalli bridge'] },
    ],
  },
  'sarjapur-road': ZONES['south-east'],
  'electronic-city': ZONES.south,
  'north-bengaluru': ZONES.north,
};

/** The guide for the area on show, else its region, else the all-city overview. */
export function placeGuide(zoneId?: string, corridorId?: string): PlaceGuide | null {
  if (corridorId && AREAS[corridorId]) return AREAS[corridorId];
  if (zoneId) return ZONES[zoneId] ?? null;
  return ZONES.all;
}
