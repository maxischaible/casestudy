import { Supplier, Certification, CertCode } from '@/types/domain';

const countries = ['DE', 'PL', 'CZ', 'SK', 'HU', 'RO', 'IT', 'ES', 'FR', 'NL', 'SE'];
const cities = {
  DE: ['Munich', 'Stuttgart', 'Frankfurt', 'Berlin'],
  PL: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw'],
  CZ: ['Prague', 'Brno', 'Ostrava'],
  SK: ['Bratislava', 'Kosice'],
  HU: ['Budapest', 'Debrecen'],
  RO: ['Bucharest', 'Cluj', 'Timisoara'],
  IT: ['Milan', 'Turin', 'Bologna'],
  ES: ['Barcelona', 'Madrid', 'Valencia'],
  FR: ['Lyon', 'Toulouse', 'Marseille'],
  NL: ['Amsterdam', 'Eindhoven'],
  SE: ['Stockholm', 'Gothenburg']
};

const categories = [
  'CNC Machining',
  'Sheet Metal',
  'Injection Molding',
  'Die Casting',
  'Surface Treatment',
  'Harnesses',
  'Stamping',
  'Welding',
  'Assembly'
];

const processes = [
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
  'Sand casting'
];

const materials = [
  'Al 6061',
  'Al 7075',
  'Steel S235',
  'Steel S355',
  'Stainless 304',
  'Stainless 316',
  'ABS',
  'PC',
  'PA6',
  'POM',
  'Brass',
  'Copper'
];

const companyNames = [
  'Precision Works',
  'MetalCraft',
  'TechnoMet',
  'ProtoTech',
  'AlphaMetal',
  'BetaCast',
  'GammaMill',
  'DeltaForm',
  'EpsilonCut',
  'ZetaWeld'
];

let supplierCounter = 0;
let generatedSuppliers: Supplier[] = [];

function generateCertification(code: CertCode): Certification {
  const issued = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1);
  const expiry = new Date(issued.getFullYear() + 3, issued.getMonth(), issued.getDate());
  
  return {
    code,
    issued: issued.toISOString().split('T')[0],
    expiry: expiry.toISOString().split('T')[0],
    issuer: code === 'IATF16949' ? 'TÜV SÜD' : 'ISO Certification Body'
  };
}

function generateSupplier(): Supplier {
  const country = countries[Math.floor(Math.random() * countries.length)];
  const cityList = cities[country] || ['Main City'];
  const city = cityList[Math.floor(Math.random() * cityList.length)];
  
  const selectedCategories = categories
    .sort(() => 0.5 - Math.random())
    .slice(0, 1 + Math.floor(Math.random() * 3));
  
  const selectedProcesses = processes
    .sort(() => 0.5 - Math.random())
    .slice(0, 2 + Math.floor(Math.random() * 4));
  
  const selectedMaterials = materials
    .sort(() => 0.5 - Math.random())
    .slice(0, 3 + Math.floor(Math.random() * 5));

  const certifications: Certification[] = [];
  
  // High chance of ISO9001
  if (Math.random() > 0.1) {
    certifications.push(generateCertification('ISO9001'));
  }
  
  // High chance of IATF16949 for automotive
  if (Math.random() > 0.3) {
    certifications.push(generateCertification('IATF16949'));
  }
  
  // Environmental certs
  if (Math.random() > 0.5) {
    certifications.push(generateCertification('ISO14001'));
  }
  
  // Material compliance
  if (Math.random() > 0.4) {
    certifications.push(generateCertification('RoHS'));
  }
  
  const priceIndex = Math.max(0.6, Math.min(1.4, 1.0 + (Math.random() - 0.5) * 0.3));
  
  return {
    id: `SUP${String(++supplierCounter).padStart(3, '0')}`,
    name: `${companyNames[Math.floor(Math.random() * companyNames.length)]} ${country}`,
    country,
    city,
    categories: selectedCategories,
    processes: selectedProcesses,
    materials: selectedMaterials,
    certifications,
    capacity: {
      unit: Math.random() > 0.5 ? 'units/month' : 'kg/month',
      value: Math.floor(1000 + Math.random() * 50000)
    },
    moq: Math.floor(50 + Math.random() * 1000),
    lead_time_days: Math.floor(7 + Math.random() * 21),
    quality: {
      on_time_rate: 0.85 + Math.random() * 0.13,
      defect_rate_ppm: Math.floor(Math.random() * 500)
    },
    sustainability: Math.random() > 0.3 ? {
      co2e_class: ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as 'A'|'B'|'C',
      notes: 'ISO 14001 certified facility'
    } : undefined,
    price_index: priceIndex,
    past_clients: Math.random() > 0.5 ? ['BMW', 'Audi', 'VW', 'Mercedes'].slice(0, 1 + Math.floor(Math.random() * 2)) : undefined,
    website: `https://${companyNames[Math.floor(Math.random() * companyNames.length)].toLowerCase().replace(' ', '')}.com`
  };
}

export function generateSuppliers(count: number = 300): Supplier[] {
  supplierCounter = 0;
  generatedSuppliers = [];
  
  for (let i = 0; i < count; i++) {
    generatedSuppliers.push(generateSupplier());
  }
  
  // Add a few gold standard suppliers
  const goldStandards = [
    {
      ...generateSupplier(),
      name: 'PremiumTech DE',
      country: 'DE',
      city: 'Stuttgart',
      price_index: 0.85,
      quality: { on_time_rate: 0.98, defect_rate_ppm: 25 },
      certifications: [
        generateCertification('ISO9001'),
        generateCertification('IATF16949'),
        generateCertification('ISO14001'),
        generateCertification('RoHS')
      ],
      past_clients: ['BMW', 'Mercedes', 'Audi']
    },
    {
      ...generateSupplier(),
      name: 'QualityFirst PL',
      country: 'PL',
      city: 'Krakow',
      price_index: 0.78,
      quality: { on_time_rate: 0.96, defect_rate_ppm: 35 },
      certifications: [
        generateCertification('ISO9001'),
        generateCertification('IATF16949'),
        generateCertification('ISO14001')
      ]
    }
  ];
  
  generatedSuppliers.splice(0, 2, ...goldStandards);
  
  return generatedSuppliers;
}

export function getSuppliers(): Supplier[] {
  if (generatedSuppliers.length === 0) {
    generateSuppliers();
  }
  return generatedSuppliers;
}

export function samplePartSpecs() {
  return [
    {
      part_number: 'AUTO-BRK-001',
      description: 'Automotive bracket',
      material: 'Al 6061',
      process: 'CNC milling',
      annual_volume: 25000,
      target_unit_price: 12.50,
      tolerance: '±0.1mm',
      criticality: 'A' as const
    },
    {
      part_number: 'HOUS-PLT-002',
      description: 'Housing plate',
      material: 'Steel S235',
      process: 'Laser cutting',
      annual_volume: 15000,
      target_unit_price: 8.20,
      tolerance: '±0.2mm',
      criticality: 'B' as const
    }
  ];
}