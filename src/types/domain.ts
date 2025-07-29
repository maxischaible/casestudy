export type CertCode = 'ISO9001' | 'IATF16949' | 'ISO14001' | 'ISO13485' | 'RoHS' | 'REACH';

export interface Certification {
  code: CertCode;
  issued: string;  // ISO date
  expiry: string;  // ISO date
  issuer?: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string; // ISO country
  region?: string; 
  city?: string;
  categories: string[];          // e.g., "CNC Machining", "Sheet Metal"
  processes: string[];           // e.g., "CNC milling", "Turning", "Laser cutting"
  materials: string[];           // e.g., "Al 6061", "Steel S235", "ABS"
  certifications: Certification[];
  capacity: { unit: 'units/month' | 'kg/month'; value: number };
  moq: number;
  lead_time_days: number;
  quality: { on_time_rate: number; defect_rate_ppm: number };
  sustainability?: { co2e_class: 'A'|'B'|'C'; notes?: string };
  price_index: number; // 1.00 = baseline current supplier
  past_clients?: string[];
  website?: string;
}

export interface PartSpec {
  part_number: string;
  description: string;
  material: string;
  process: string;
  annual_volume: number;
  target_unit_price?: number;
  tolerance?: string;
  criticality?: 'A'|'B'|'C';
}

export interface MatchResult {
  supplier: Supplier;
  switching_cost_score: number;   // 0..100
  estimated_savings_rate: number; // 0..1
  audit_readiness: 'Audit-ready' | 'Minor gaps' | 'Major gaps';
  reasons: string[];              // human-readable match explanations
}