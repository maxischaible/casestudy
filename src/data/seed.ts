import { Supplier, Certification, CertCode, PartSpec } from '@/types/domain';

const EU_COUNTRIES = ['DE', 'PL', 'CZ', 'SK', 'HU', 'RO', 'IT', 'ES', 'FR', 'NL', 'SE'];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  DE: ['Munich', 'Stuttgart', 'Frankfurt', 'Berlin', 'Hamburg', 'Düsseldorf'],
  PL: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan', 'Katowice'],
  CZ: ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Liberec'],
  SK: ['Bratislava', 'Kosice', 'Presov', 'Zilina'],
  HU: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pecs'],
  RO: ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta'],
  IT: ['Milan', 'Turin', 'Bologna', 'Venice', 'Modena'],
  ES: ['Barcelona', 'Madrid', 'Valencia', 'Bilbao', 'Seville'],
  FR: ['Lyon', 'Toulouse', 'Marseille', 'Strasbourg', 'Lille'],
  NL: ['Amsterdam', 'Eindhoven', 'Rotterdam', 'Utrecht'],
  SE: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala']
};

const CATEGORIES = [
  'CNC Machining',
  'Sheet Metal',
  'Injection Molding', 
  'Die Casting',
  'Surface Treatment',
  'Wire Harnesses'
];

const PROCESSES = [
  'CNC milling',
  'CNC turning',
  '3-axis milling',
  '5-axis milling',
  'Laser cutting',
  'Plasma cutting',
  'TIG welding',
  'MIG welding',
  'Powder coating',
  'Anodizing',
  'Injection molding',
  'Die casting',
  'Investment casting',
  'Sand casting',
  'Wire harness assembly',
  'Cable crimping'
];

const MATERIALS = [
  'Al 6061',
  'Al 7075', 
  'Al 5083',
  'Steel S235',
  'Steel S355',
  'Stainless 304',
  'Stainless 316',
  'ABS',
  'PC',
  'PA6',
  'PA66',
  'POM',
  'PTFE',
  'Brass',
  'Copper',
  'Bronze'
];

const COMPANY_PREFIXES = [
  'Precision', 'MetalCraft', 'TechnoMet', 'ProtoTech', 'AlphaMetal', 'BetaCast', 
  'GammaMill', 'DeltaForm', 'EpsilonCut', 'ZetaWeld', 'Advanced', 'Superior',
  'Premium', 'Elite', 'Master', 'Expert', 'Industrial', 'Manufacturing',
  'Engineering', 'Systems', 'Solutions', 'Components', 'Automotive', 'Euro'
];

const COMPANY_SUFFIXES = [
  'Works', 'Tech', 'Industries', 'Manufacturing', 'Solutions', 'Systems',
  'Components', 'Engineering', 'Precision', 'Group', 'GmbH', 'S.r.l.',
  'S.A.', 'Sp. z o.o.', 'a.s.', 'Kft.', 'AB'
];

const AUTOMOTIVE_CLIENTS = [
  'BMW', 'Mercedes-Benz', 'Audi', 'VW', 'Porsche', 'Opel', 'Ford', 
  'Renault', 'Peugeot', 'Fiat', 'Volvo', 'SEAT', 'Skoda'
];

let supplierCounter = 0;
let cachedSuppliers: Supplier[] = [];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function generateCertification(code: CertCode): Certification {
  const issuedDate = new Date();
  issuedDate.setFullYear(2020 + Math.floor(Math.random() * 4));
  issuedDate.setMonth(Math.floor(Math.random() * 12));
  
  const expiryDate = new Date(issuedDate);
  
  // Some certificates expire sooner for testing
  const yearsToAdd = Math.random() < 0.1 ? 0.5 : (1 + Math.random() * 2);
  expiryDate.setFullYear(expiryDate.getFullYear() + yearsToAdd);
  
  const issuers: Record<CertCode, string> = {
    'ISO9001': 'TÜV SÜD',
    'IATF16949': 'TÜV Rheinland', 
    'ISO14001': 'DNV GL',
    'ISO13485': 'BSI',
    'RoHS': 'SGS',
    'REACH': 'Intertek'
  };
  
  return {
    code,
    issued: issuedDate.toISOString().split('T')[0],
    expiry: expiryDate.toISOString().split('T')[0],
    issuer: issuers[code]
  };
}

function generateSupplier(): Supplier {
  const country = randomChoice(EU_COUNTRIES);
  const cities = CITIES_BY_COUNTRY[country] || ['Main City'];
  const city = randomChoice(cities);
  
  const selectedCategories = randomChoices(CATEGORIES, 1 + Math.floor(Math.random() * 3));
  const selectedProcesses = randomChoices(PROCESSES, 2 + Math.floor(Math.random() * 4));
  const selectedMaterials = randomChoices(MATERIALS, 3 + Math.floor(Math.random() * 5));
  
  // Generate certifications with realistic distribution
  const certifications: Certification[] = [];
  
  // 70% chance of ISO9001 (baseline quality)
  if (Math.random() < 0.7) {
    certifications.push(generateCertification('ISO9001'));
  }
  
  // 60% chance of IATF16949 (automotive focus)
  if (Math.random() < 0.6) {
    certifications.push(generateCertification('IATF16949'));
  }
  
  // 40% chance of ISO14001 (environmental)
  if (Math.random() < 0.4) {
    certifications.push(generateCertification('ISO14001'));
  }
  
  // 30% chance of RoHS (electronics/automotive)
  if (Math.random() < 0.3) {
    certifications.push(generateCertification('RoHS'));
  }
  
  // 20% chance of REACH (chemical compliance)
  if (Math.random() < 0.2) {
    certifications.push(generateCertification('REACH'));
  }
  
  // 15% chance of ISO13485 (medical devices)
  if (Math.random() < 0.15) {
    certifications.push(generateCertification('ISO13485'));
  }
  
  // Generate realistic price index (normal distribution around 1.0)
  const priceIndex = clamp(normalRandom(1.0, 0.15), 0.7, 1.4);
  
  // Generate quality metrics
  const onTimeRate = clamp(normalRandom(0.92, 0.08), 0.75, 0.99);
  const defectRatePpm = Math.max(10, Math.floor(Math.random() * 500));
  
  // Generate past clients for automotive suppliers
  const pastClients = Math.random() < 0.4 ? 
    randomChoices(AUTOMOTIVE_CLIENTS, 1 + Math.floor(Math.random() * 3)) : 
    undefined;
  
  const prefix = randomChoice(COMPANY_PREFIXES);
  const suffix = randomChoice(COMPANY_SUFFIXES);
  const countryCode = country;
  
  return {
    id: `SUP${String(++supplierCounter).padStart(4, '0')}`,
    name: `${prefix} ${suffix} ${countryCode}`,
    country,
    city,
    categories: selectedCategories,
    processes: selectedProcesses,
    materials: selectedMaterials,
    certifications,
    capacity: {
      unit: Math.random() > 0.3 ? 'units/month' : 'kg/month',
      value: Math.floor(500 + Math.random() * 49500) // 500 to 50,000
    },
    moq: Math.floor(50 + Math.random() * 1950), // 50 to 2,000
    lead_time_days: Math.floor(5 + Math.random() * 25), // 5 to 30 days
    quality: {
      on_time_rate: onTimeRate,
      defect_rate_ppm: defectRatePpm
    },
    sustainability: Math.random() > 0.3 ? {
      co2e_class: randomChoice(['A', 'B', 'C'] as const),
      notes: Math.random() > 0.5 ? 'ISO 14001 certified facility' : undefined
    } : undefined,
    price_index: Number(priceIndex.toFixed(2)),
    past_clients: pastClients,
    website: `https://${prefix.toLowerCase()}${suffix.toLowerCase()}${countryCode.toLowerCase()}.com`
  };
}

export function generateSuppliers(count: number = 300): Supplier[] {
  supplierCounter = 0;
  const suppliers: Supplier[] = [];
  
  for (let i = 0; i < count; i++) {
    suppliers.push(generateSupplier());
  }
  
  // Add a few "gold standard" suppliers with excellent metrics
  const goldStandards = [
    {
      ...generateSupplier(),
      id: 'SUP0001',
      name: 'Premium Automotive GmbH',
      country: 'DE',
      city: 'Stuttgart',
      price_index: 0.82,
      quality: { on_time_rate: 0.98, defect_rate_ppm: 15 },
      certifications: [
        generateCertification('ISO9001'),
        generateCertification('IATF16949'),
        generateCertification('ISO14001'),
        generateCertification('RoHS')
      ],
      past_clients: ['BMW', 'Mercedes-Benz', 'Audi'],
      sustainability: { co2e_class: 'A' as const, notes: 'Carbon neutral facility' }
    },
    {
      ...generateSupplier(),
      id: 'SUP0002', 
      name: 'Elite Precision Sp. z o.o.',
      country: 'PL',
      city: 'Krakow',
      price_index: 0.75,
      quality: { on_time_rate: 0.96, defect_rate_ppm: 25 },
      certifications: [
        generateCertification('ISO9001'),
        generateCertification('IATF16949'),
        generateCertification('ISO14001')
      ],
      past_clients: ['VW', 'Skoda'],
      sustainability: { co2e_class: 'A' as const }
    }
  ];
  
  // Replace first few suppliers with gold standards
  goldStandards.forEach((gold, index) => {
    if (index < suppliers.length) {
      suppliers[index] = gold;
    }
  });
  
  cachedSuppliers = suppliers;
  return suppliers;
}

export function getSuppliers(): Supplier[] {
  if (cachedSuppliers.length === 0) {
    generateSuppliers();
  }
  return cachedSuppliers;
}

export function samplePartSpecs(): PartSpec[] {
  return [
    {
      part_number: 'AUTO-BRK-001',
      description: 'Automotive bracket assembly',
      material: 'Al 6061',
      process: 'CNC milling',
      annual_volume: 25000,
      target_unit_price: 12.50,
      tolerance: '±0.1mm',
      criticality: 'A'
    },
    {
      part_number: 'HOUS-PLT-002', 
      description: 'Electronic housing plate',
      material: 'Steel S235',
      process: 'Laser cutting',
      annual_volume: 15000,
      target_unit_price: 8.20,
      tolerance: '±0.2mm',
      criticality: 'B'
    },
    {
      part_number: 'SEAL-RNG-003',
      description: 'O-ring seal component',
      material: 'EPDM',
      process: 'Injection molding',
      annual_volume: 50000,
      target_unit_price: 2.15,
      tolerance: '±0.05mm',
      criticality: 'C'
    },
    {
      part_number: 'WIRE-HAR-004',
      description: 'Engine wire harness',
      material: 'Copper',
      process: 'Wire harness assembly',
      annual_volume: 8000,
      target_unit_price: 45.80,
      tolerance: 'IPC-A-620',
      criticality: 'A'
    },
    {
      part_number: 'CAST-BLK-005',
      description: 'Engine block casting',
      material: 'Al 7075',
      process: 'Die casting',
      annual_volume: 12000,
      target_unit_price: 78.90,
      tolerance: '±0.3mm',
      criticality: 'A'
    }
  ];
}

// Mock data for Items page
import { Item, CompanySupplier } from '@/types/domain';

const ITEM_CATEGORIES = [
  'Brackets & Housings',
  'Mechanical Components', 
  'Electronic Components',
  'Fasteners',
  'Gaskets & Seals',
  'Wire Harnesses'
];

const SUPPLIERS_DATA = [
  'Precision Tech GmbH',
  'Alpine Manufacturing',
  'Nordic Components',
  'Bavarian Machining',
  'Czech Precision Parts',
  'Polish Metalworks',
  'Italian Casting Co.',
  'French Assembly Solutions',
  'Dutch Engineering Works',
  'Swedish Quality Parts'
];

export function getItems(): Item[] {
  const items: Item[] = [];
  
  for (let i = 1; i <= 150; i++) {
    const category = ITEM_CATEGORIES[Math.floor(Math.random() * ITEM_CATEGORIES.length)];
    const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
    const process = PROCESSES[Math.floor(Math.random() * PROCESSES.length)];
    const supplier = SUPPLIERS_DATA[Math.floor(Math.random() * SUPPLIERS_DATA.length)];
    const volume = Math.floor(Math.random() * 50000) + 1000;
    const unitPrice = Math.random() * 100 + 5;
    
    items.push({
      id: `ITM-${String(i).padStart(4, '0')}`,
      part_number: `P${String(i).padStart(6, '0')}-${Math.floor(Math.random() * 900) + 100}`,
      description: `${category.split(' ')[0]} component for automotive application`,
      category,
      material,
      process,
      current_supplier: supplier,
      supplier_id: `SUP-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
      annual_volume: volume,
      unit_price: unitPrice,
      total_value: volume * unitPrice,
      criticality: ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as 'A' | 'B' | 'C',
      last_order_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      next_order_date: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: ['Active', 'EOL', 'Planned', 'On Hold'][Math.floor(Math.random() * 4)] as any,
      lead_time_days: Math.floor(Math.random() * 60) + 7,
      moq: Math.floor(Math.random() * 1000) + 100,
      drawings_available: Math.random() > 0.3,
      tooling_required: Math.random() > 0.6
    });
  }
  
  return items;
}

export function getCompanySuppliers(): CompanySupplier[] {
  const suppliers: CompanySupplier[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const country = EU_COUNTRIES[Math.floor(Math.random() * EU_COUNTRIES.length)];
    const city = CITIES_BY_COUNTRY[country][Math.floor(Math.random() * CITIES_BY_COUNTRY[country].length)];
    const categories = CATEGORIES.slice(0, Math.floor(Math.random() * 3) + 1);
    const annualSpend = Math.random() * 2000000 + 50000;
    const itemsCount = Math.floor(Math.random() * 25) + 1;
    
    suppliers.push({
      id: `SUP-${String(i).padStart(3, '0')}`,
      name: SUPPLIERS_DATA[Math.floor(Math.random() * SUPPLIERS_DATA.length)] + ` ${i}`,
      country,
      city,
      contact_person: `${['Klaus', 'Hans', 'Stefan', 'Michael', 'Andreas', 'Thomas'][Math.floor(Math.random() * 6)]} ${['Mueller', 'Schmidt', 'Weber', 'Fischer', 'Wagner'][Math.floor(Math.random() * 5)]}`,
      email: `contact${i}@supplier${i}.com`,
      phone: `+49 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      categories,
      relationship_status: ['Active', 'Preferred', 'Qualified', 'Under Review', 'Inactive'][Math.floor(Math.random() * 5)] as any,
      total_annual_spend: annualSpend,
      items_count: itemsCount,
      performance_score: Math.floor(Math.random() * 40) + 60,
      quality_rating: Math.random() * 2 + 3,
      delivery_rating: Math.random() * 2 + 3,
      communication_rating: Math.random() * 2 + 3,
      last_audit_date: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      next_audit_date: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      certifications: [generateCertification('ISO9001'), generateCertification('IATF16949')].slice(0, Math.floor(Math.random() * 3) + 1),
      risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as any,
      payment_terms: ['Net 30', 'Net 45', 'Net 60', '2/10 Net 30'][Math.floor(Math.random() * 4)],
      established_date: new Date(Date.now() - Math.random() * 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  return suppliers;
}