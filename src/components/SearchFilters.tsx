import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter as FilterIcon } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { getFilterCounts } from '@/lib/filters';
import { Supplier } from '@/types/domain';

interface SearchFiltersProps {
  suppliers: Supplier[];
  className?: string;
}

export function SearchFilters({ suppliers, className = "" }: SearchFiltersProps) {
  const { filters, updateFilter, toggleCertification, toggleProcess, toggleMaterial, clearFilters } = useFilters();
  const counts = getFilterCounts(suppliers, filters);

  const regionOptions = [
    { value: 'all', label: 'All Regions', count: suppliers.length },
    { value: 'dach', label: 'DACH', count: counts.region.dach },
    { value: 'eu27', label: 'EU-27', count: counts.region.eu27 },
    { value: 'global', label: 'Global', count: counts.region.global }
  ] as const;

  const certificationOptions = [
    { value: 'ISO9001', label: 'ISO 9001' },
    { value: 'IATF16949', label: 'IATF 16949' },
    { value: 'ISO14001', label: 'ISO 14001' },
    { value: 'ISO45001', label: 'ISO 45001' }
  ];

  const processOptions = [
    { value: 'CNC', label: 'CNC Machining' },
    { value: 'Molding', label: 'Injection Molding' },
    { value: 'Casting', label: 'Casting' },
    { value: 'Stamping', label: 'Stamping' }
  ];

  const materialOptions = [
    { value: 'Aluminum', label: 'Aluminum' },
    { value: 'Steel', label: 'Steel' },
    { value: 'Plastic', label: 'Plastic' },
    { value: 'Titanium', label: 'Titanium' }
  ];

  const activeFiltersCount = Object.values(filters).flat().filter(f => f !== 'all' && f).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Region Scope */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Region Scope</h4>
          <div className="flex flex-wrap gap-2">
            {regionOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.region === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('region', option.value)}
                className="text-xs"
              >
                {option.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {certificationOptions.map((cert) => (
              <Button
                key={cert.value}
                variant={filters.certifications.includes(cert.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCertification(cert.value)}
                className="text-xs"
              >
                {cert.label}
                {filters.certifications.includes(cert.value) && (
                  <X className="h-3 w-3 ml-1" />
                )}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts.certifications[cert.value] || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Processes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Manufacturing Processes</h4>
          <div className="flex flex-wrap gap-2">
            {processOptions.map((process) => (
              <Button
                key={process.value}
                variant={filters.processes.includes(process.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleProcess(process.value)}
                className="text-xs"
              >
                {process.label}
                {filters.processes.includes(process.value) && (
                  <X className="h-3 w-3 ml-1" />
                )}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts.processes[process.value] || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Materials</h4>
          <div className="flex flex-wrap gap-2">
            {materialOptions.map((material) => (
              <Button
                key={material.value}
                variant={filters.materials.includes(material.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMaterial(material.value)}
                className="text-xs"
              >
                {material.label}
                {filters.materials.includes(material.value) && (
                  <X className="h-3 w-3 ml-1" />
                )}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts.materials[material.value] || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}