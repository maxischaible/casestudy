import { Supplier } from '@/types/domain';

export interface FilterState {
  region: 'all' | 'dach' | 'eu27' | 'global';
  certifications: string[];
  processes: string[];
  materials: string[];
}

export const defaultFilters: FilterState = {
  region: 'all',
  certifications: [],
  processes: [],
  materials: []
};

const DACH_COUNTRIES = ['Germany', 'Austria', 'Switzerland', 'DE', 'AT', 'CH'];
const EU27_COUNTRIES = [
  'Germany', 'France', 'Italy', 'Spain', 'Poland', 'Netherlands', 
  'Belgium', 'Czech Republic', 'Greece', 'Portugal', 'Hungary', 
  'Sweden', 'Austria', 'Denmark', 'Finland', 'Slovakia', 'Ireland',
  'Croatia', 'Lithuania', 'Slovenia', 'Latvia', 'Estonia', 'Malta',
  'Luxembourg', 'Cyprus', 'Bulgaria', 'Romania',
  'DE', 'FR', 'IT', 'ES', 'PL', 'NL', 'BE', 'CZ', 'GR', 'PT', 
  'HU', 'SE', 'AT', 'DK', 'FI', 'SK', 'IE', 'HR', 'LT', 'SI', 
  'LV', 'EE', 'MT', 'LU', 'CY', 'BG', 'RO'
];

export function applyFilters(suppliers: Supplier[], filters: FilterState): Supplier[] {
  return suppliers.filter(supplier => {
    // Region filter
    if (filters.region !== 'all') {
      switch (filters.region) {
        case 'dach':
          if (!DACH_COUNTRIES.includes(supplier.country)) return false;
          break;
        case 'eu27':
          if (!EU27_COUNTRIES.includes(supplier.country)) return false;
          break;
        case 'global':
          // Global includes all suppliers
          break;
      }
    }

    // Certification filter
    if (filters.certifications.length > 0) {
      const supplierCertCodes = supplier.certifications.map(cert => cert.code);
      const hasRequiredCert = filters.certifications.some(cert => 
        supplierCertCodes.includes(cert as any)
      );
      if (!hasRequiredCert) return false;
    }

    // Process filter
    if (filters.processes.length > 0) {
      const hasRequiredProcess = filters.processes.some(process => 
        supplier.processes.some(supplierProcess => 
          supplierProcess.toLowerCase().includes(process.toLowerCase())
        )
      );
      if (!hasRequiredProcess) return false;
    }

    // Material filter
    if (filters.materials.length > 0) {
      const hasRequiredMaterial = filters.materials.some(material => 
        supplier.materials.some(supplierMaterial => 
          supplierMaterial.toLowerCase().includes(material.toLowerCase())
        )
      );
      if (!hasRequiredMaterial) return false;
    }

    return true;
  });
}

export function getFilterCounts(suppliers: Supplier[], filters: FilterState) {
  const counts = {
    region: {
      dach: 0,
      eu27: 0,
      global: suppliers.length
    },
    certifications: {} as Record<string, number>,
    processes: {} as Record<string, number>,
    materials: {} as Record<string, number>
  };

  suppliers.forEach(supplier => {
    // Count by region
    if (DACH_COUNTRIES.includes(supplier.country)) {
      counts.region.dach++;
    }
    if (EU27_COUNTRIES.includes(supplier.country)) {
      counts.region.eu27++;
    }

    // Count certifications
    supplier.certifications.forEach(cert => {
      counts.certifications[cert.code] = (counts.certifications[cert.code] || 0) + 1;
    });

    // Count processes
    supplier.processes.forEach(process => {
      const key = process.includes('CNC') ? 'CNC' : 
                  process.includes('molding') || process.includes('Molding') ? 'Molding' : process;
      counts.processes[key] = (counts.processes[key] || 0) + 1;
    });

    // Count materials
    supplier.materials.forEach(material => {
      const key = material.includes('Al') || material.includes('Aluminum') ? 'Aluminum' :
                  material.includes('Steel') || material.includes('steel') ? 'Steel' : material;
      counts.materials[key] = (counts.materials[key] || 0) + 1;
    });
  });

  return counts;
}