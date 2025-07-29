import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FilterState, defaultFilters } from '@/lib/filters';

interface FilterContextType {
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: any) => void;
  toggleCertification: (cert: string) => void;
  toggleProcess: (process: string) => void;
  toggleMaterial: (material: string) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCertification = (cert: string) => {
    setFilters(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const toggleProcess = (process: string) => {
    setFilters(prev => ({
      ...prev,
      processes: prev.processes.includes(process)
        ? prev.processes.filter(p => p !== process)
        : [...prev.processes, process]
    }));
  };

  const toggleMaterial = (material: string) => {
    setFilters(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material]
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{
      filters,
      updateFilter,
      toggleCertification,
      toggleProcess,
      toggleMaterial,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}