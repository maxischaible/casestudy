import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSuppliers } from '@/data/seed';
import { MapPin, Globe, Layers, Users, Filter } from 'lucide-react';

// Mock geographic data for European regions
const europeanRegions = {
  'DACH': {
    countries: ['Germany', 'Austria', 'Switzerland'],
    color: 'hsl(var(--primary))',
    position: { x: 180, y: 120 }
  },
  'Nordic': {
    countries: ['Sweden', 'Norway', 'Denmark', 'Finland'],
    color: 'hsl(210, 60%, 60%)',
    position: { x: 200, y: 60 }
  },
  'Western EU': {
    countries: ['France', 'Netherlands', 'Belgium', 'Luxembourg'],
    color: 'hsl(150, 60%, 60%)',
    position: { x: 120, y: 140 }
  },
  'Southern EU': {
    countries: ['Italy', 'Spain', 'Portugal'],
    color: 'hsl(30, 70%, 65%)',
    position: { x: 140, y: 200 }
  },
  'Eastern EU': {
    countries: ['Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania'],
    color: 'hsl(280, 60%, 65%)',
    position: { x: 250, y: 150 }
  }
};

interface SupplierMapProps {
  className?: string;
}

export default function SupplierGeographicMap({ className }: SupplierMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'regions' | 'density'>('regions');
  
  const suppliers = getSuppliers();
  
  // Process supplier data by region
  const regionData = Object.entries(europeanRegions).map(([regionName, regionInfo]) => {
    const regionSuppliers = suppliers.filter(supplier => 
      regionInfo.countries.includes(supplier.country)
    );
    
    const totalCapacity = regionSuppliers.reduce((sum, s) => sum + s.capacity.value, 0);
    const avgPriceIndex = regionSuppliers.length > 0 
      ? regionSuppliers.reduce((sum, s) => sum + s.price_index, 0) / regionSuppliers.length
      : 0;
    
    const certificationCoverage = regionSuppliers.length > 0
      ? regionSuppliers.filter(s => s.certifications.some(c => c.code === 'IATF16949')).length / regionSuppliers.length
      : 0;

    return {
      name: regionName,
      count: regionSuppliers.length,
      suppliers: regionSuppliers,
      totalCapacity,
      avgPriceIndex,
      certificationCoverage,
      ...regionInfo
    };
  });

  // City-based supplier distribution for density view
  const cityData = suppliers.reduce((acc, supplier) => {
    const city = supplier.city || supplier.country;
    if (!acc[city]) {
      acc[city] = {
        count: 0,
        suppliers: [],
        totalCapacity: 0
      };
    }
    acc[city].count++;
    acc[city].suppliers.push(supplier);
    acc[city].totalCapacity += supplier.capacity.value;
    return acc;
  }, {} as Record<string, any>);

  const maxSuppliers = Math.max(...regionData.map(r => r.count));
  const maxCapacity = Math.max(...regionData.map(r => r.totalCapacity));

  const getRegionOpacity = (count: number) => {
    return 0.3 + (count / maxSuppliers) * 0.7;
  };

  const getRegionSize = (capacity: number) => {
    return 20 + (capacity / maxCapacity) * 40;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          European Supplier Distribution
        </CardTitle>
        <CardDescription>
          Interactive visualization of supplier density across European regions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'regions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('regions')}
          >
            Regional View
          </Button>
          <Button
            variant={viewMode === 'density' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('density')}
          >
            Density Heat Map
          </Button>
        </div>

        {/* Map Visualization */}
        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 h-96 overflow-hidden">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}
          >
            {/* Europe outline (simplified) */}
            <path
              d="M50,80 Q60,60 80,70 L120,60 Q140,50 160,60 L200,55 Q240,50 280,60 L320,70 Q340,80 350,100 L360,120 Q370,140 360,160 L350,180 Q340,200 320,210 L280,220 Q240,225 200,220 L160,215 Q120,210 100,200 L80,190 Q60,180 50,160 L45,140 Q40,120 45,100 Q50,80 50,80 Z"
              fill="rgba(255, 255, 255, 0.3)"
              stroke="rgba(100, 116, 139, 0.3)"
              strokeWidth="2"
            />

            {viewMode === 'regions' ? (
              // Regional bubbles
              regionData.map((region) => (
                <g key={region.name}>
                  <circle
                    cx={region.position.x}
                    cy={region.position.y}
                    r={getRegionSize(region.totalCapacity)}
                    fill={region.color}
                    fillOpacity={getRegionOpacity(region.count)}
                    stroke={region.color}
                    strokeWidth="2"
                    className="cursor-pointer hover:fill-opacity-90 transition-all"
                    onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                  />
                  <text
                    x={region.position.x}
                    y={region.position.y - getRegionSize(region.totalCapacity) - 10}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {region.name}
                  </text>
                  <text
                    x={region.position.x}
                    y={region.position.y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    {region.count}
                  </text>
                </g>
              ))
            ) : (
              // Density heat map with grid
              <g>
                {/* Generate heat map grid */}
                {Array.from({ length: 20 }, (_, i) =>
                  Array.from({ length: 15 }, (_, j) => {
                    const intensity = Math.random() * 0.8 + 0.1;
                    const isHotspot = Math.random() > 0.85;
                    return (
                      <rect
                        key={`${i}-${j}`}
                        x={i * 20}
                        y={j * 20}
                        width="18"
                        height="18"
                        fill={`rgba(255, 122, 26, ${isHotspot ? intensity * 1.2 : intensity * 0.3})`}
                        rx="2"
                      />
                    );
                  })
                )}
                
                {/* Add some supplier concentration points */}
                {regionData.map((region, index) => (
                  <circle
                    key={`density-${region.name}`}
                    cx={region.position.x + (Math.random() - 0.5) * 40}
                    cy={region.position.y + (Math.random() - 0.5) * 40}
                    r={3 + region.count * 0.5}
                    fill="rgba(255, 122, 26, 0.9)"
                    className="animate-pulse"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                ))}
              </g>
            )}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 space-y-2">
            <h4 className="font-medium text-sm">Legend</h4>
            {viewMode === 'regions' ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-primary/60"></div>
                  <span>Supplier Count</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Size = Capacity</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-3 bg-gradient-to-r from-transparent via-primary/40 to-primary rounded"></div>
                  <span>Density Level</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Supplier Hubs</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Region Details */}
        {selectedRegion && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              {(() => {
                const region = regionData.find(r => r.name === selectedRegion)!;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{region.name} Region</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedRegion(null)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">{region.count}</div>
                        <div className="text-xs text-muted-foreground">Suppliers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">
                          {(region.certificationCoverage * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">IATF Certified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">
                          {region.avgPriceIndex.toFixed(2)}x
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Price Index</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">
                          {region.totalCapacity.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Capacity</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-1">Countries:</div>
                      <div className="flex flex-wrap gap-1">
                        {region.countries.map(country => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{suppliers.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                Total Suppliers
              </div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">
                {regionData.find(r => r.name === 'DACH')?.count || 0}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                DACH Region
              </div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">
                {regionData.length}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Globe className="h-3 w-3" />
                Regions Covered
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">
                {Object.keys(cityData).length}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Filter className="h-3 w-3" />
                Cities
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regional Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionData
                .sort((a, b) => b.count - a.count)
                .map((region) => (
                  <div 
                    key={region.name} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: region.color }}
                      />
                      <span className="font-medium">{region.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {region.countries.length} countries
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{region.count} suppliers</div>
                      <div className="text-xs text-muted-foreground">
                        {(region.certificationCoverage * 100).toFixed(0)}% certified
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p><strong>How to use:</strong> Click on regions in the map or table to see detailed information. Toggle between regional view and density heat map for different perspectives.</p>
        </div>
      </CardContent>
    </Card>
  );
}