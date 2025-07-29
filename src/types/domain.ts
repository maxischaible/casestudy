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

// Additional types for Items and Suppliers pages
export interface Item {
  id: string;
  part_number: string;
  description: string;
  category: string;
  material: string;
  process: string;
  current_supplier: string;
  supplier_id?: string;
  annual_volume: number;
  unit_price: number;
  total_value: number;
  criticality: 'A' | 'B' | 'C';
  last_order_date: string;
  next_order_date: string;
  status: 'Active' | 'EOL' | 'Planned' | 'On Hold';
  lead_time_days: number;
  moq: number;
  drawings_available: boolean;
  tooling_required: boolean;
}

export interface CompanySupplier {
  id: string;
  name: string;
  country: string;
  city: string;
  contact_person: string;
  email: string;
  phone?: string;
  categories: string[];
  relationship_status: 'Active' | 'Preferred' | 'Qualified' | 'Under Review' | 'Inactive';
  total_annual_spend: number;
  items_count: number;
  performance_score: number; // 0-100
  quality_rating: number; // 0-5
  delivery_rating: number; // 0-5
  communication_rating: number; // 0-5
  last_audit_date?: string;
  next_audit_date?: string;
  certifications: Certification[];
  risk_level: 'Low' | 'Medium' | 'High';
  payment_terms: string;
  established_date: string;
}