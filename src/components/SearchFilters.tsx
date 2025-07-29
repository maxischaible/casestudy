import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter as FilterIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { getFilterCounts } from '@/lib/filters';
import { Supplier } from '@/types/domain';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SearchFiltersProps {
  suppliers: Supplier[];
  className?: string;
}

export function SearchFilters({ suppliers, className = "" }: SearchFiltersProps) {
  const { filters, updateFilter, toggleCertification, toggleProcess, toggleMaterial, clearFilters } = useFilters();
  const counts = getFilterCounts(suppliers, filters);
  const [isOpen, setIsOpen] = useState(true);

  const regionOptions = [
    { value: 'all', label: 'All', count: suppliers.length },
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
    { value: 'CNC', label: 'CNC' },
    { value: 'Molding', label: 'Molding' },
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card className="sticky top-6">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">{activeFiltersCount}</Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-4">
            {activeFiltersCount > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Region Scope */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Region</h4>
              <div className="flex flex-wrap gap-1">
                {regionOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.region === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('region', option.value)}
                    className="h-7 text-xs"
                  >
                    {option.label} ({option.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Certifications</h4>
              <div className="flex flex-wrap gap-1">
                {certificationOptions.map((cert) => (
                  <Button
                    key={cert.value}
                    variant={filters.certifications.includes(cert.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCertification(cert.value)}
                    className="h-7 text-xs"
                  >
                    {cert.label}
                    {filters.certifications.includes(cert.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                    <span className="ml-1">({counts.certifications[cert.value] || 0})</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Processes */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Processes</h4>
              <div className="flex flex-wrap gap-1">
                {processOptions.map((process) => (
                  <Button
                    key={process.value}
                    variant={filters.processes.includes(process.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleProcess(process.value)}
                    className="h-7 text-xs"
                  >
                    {process.label}
                    {filters.processes.includes(process.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                    <span className="ml-1">({counts.processes[process.value] || 0})</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Materials</h4>
              <div className="flex flex-wrap gap-1">
                {materialOptions.map((material) => (
                  <Button
                    key={material.value}
                    variant={filters.materials.includes(material.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMaterial(material.value)}
                    className="h-7 text-xs"
                  >
                    {material.label}
                    {filters.materials.includes(material.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                    <span className="ml-1">({counts.materials[material.value] || 0})</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}