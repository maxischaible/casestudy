import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getSuppliers } from '@/data/seed';
import { MapPin, Globe, Layers, Users } from 'lucide-react';

// Geographic coordinates for major European cities
const cityCoordinates: Record<string, [number, number]> = {
  'Berlin': [13.4050, 52.5200],
  'Munich': [11.5820, 48.1351],
  'Stuttgart': [9.1829, 48.7758],
  'Hamburg': [9.9937, 53.5511],
  'Frankfurt': [8.6821, 50.1109],
  'Cologne': [6.9603, 50.9375],
  'Vienna': [16.3738, 48.2082],
  'Zurich': [8.5417, 47.3769],
  'Milan': [9.1900, 45.4642],
  'Turin': [7.6869, 45.0703],
  'Barcelona': [2.1734, 41.3851],
  'Madrid': [3.7038, 40.4168],
  'Lyon': [4.8357, 45.7640],
  'Paris': [2.3522, 48.8566],
  'Amsterdam': [4.9041, 52.3676],
  'Prague': [14.4378, 50.0755],
  'Warsaw': [21.0122, 52.2297],
  'Budapest': [19.0402, 47.4979],
  'Copenhagen': [12.5683, 55.6761],
  'Stockholm': [18.0686, 59.3293],
  'Oslo': [10.7522, 59.9139],
  'Helsinki': [24.9384, 60.1699],
  'Brussels': [4.3517, 50.8503],
  'Luxembourg': [6.1296, 49.8153],
  'Lisbon': [9.1393, 38.7223]
};

interface SupplierMapProps {
  className?: string;
}

export default function SupplierGeographicMap({ className }: SupplierMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [supplierData, setSupplierData] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const { toast } = useToast();

  // Process supplier data for heat map
  useEffect(() => {
    const suppliers = getSuppliers();
    const processedData = suppliers.map(supplier => {
      const coordinates = cityCoordinates[supplier.city || ''] || [0, 0];
      return {
        id: supplier.id,
        name: supplier.name,
        city: supplier.city,
        country: supplier.country,
        coordinates,
        processes: supplier.processes,
        certifications: supplier.certifications.length,
        capacity: supplier.capacity.value
      };
    }).filter(item => item.coordinates[0] !== 0 && item.coordinates[1] !== 0);
    
    setSupplierData(processedData);
  }, []);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [10.0, 54.0], // Center on Europe
        zoom: 4,
        projection: 'mercator'
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: false,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        addSupplierLayer();
        addRegionBoundaries();
      });

      setIsTokenValid(true);
      toast({
        title: "Map Loaded",
        description: "Geographic supplier distribution is now visible."
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setIsTokenValid(false);
      toast({
        title: "Map Error",
        description: "Invalid Mapbox token or initialization failed.",
        variant: "destructive"
      });
    }
  };

  const addSupplierLayer = () => {
    if (!map.current) return;

    // Create GeoJSON data from suppliers
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: supplierData.map(supplier => ({
        type: 'Feature' as const,
        properties: {
          id: supplier.id,
          name: supplier.name,
          city: supplier.city,
          country: supplier.country,
          certifications: supplier.certifications,
          capacity: supplier.capacity,
          processes: supplier.processes.join(', ')
        },
        geometry: {
          type: 'Point' as const,
          coordinates: supplier.coordinates
        }
      }))
    };

    // Add heat map layer
    map.current.addSource('suppliers', {
      type: 'geojson',
      data: geojsonData
    });

    // Add heat map visualization
    map.current.addLayer({
      id: 'supplier-heat',
      type: 'heatmap',
      source: 'suppliers',
      maxzoom: 9,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'capacity'],
          0, 0,
          100000, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(255, 122, 26, 0)',
          0.2, 'rgba(255, 122, 26, 0.2)',
          0.4, 'rgba(255, 122, 26, 0.4)',
          0.6, 'rgba(255, 122, 26, 0.6)',
          0.8, 'rgba(255, 122, 26, 0.8)',
          1, 'rgba(255, 122, 26, 1)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          9, 20
        ]
      }
    });

    // Add supplier points for higher zoom levels
    map.current.addLayer({
      id: 'supplier-points',
      type: 'circle',
      source: 'suppliers',
      minzoom: 7,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'capacity'],
          0, 4,
          100000, 12
        ],
        'circle-color': 'rgba(255, 122, 26, 0.8)',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.8
      }
    });

    // Add supplier labels
    map.current.addLayer({
      id: 'supplier-labels',
      type: 'symbol',
      source: 'suppliers',
      minzoom: 8,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#333333',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // Add click interactions
    map.current.on('click', 'supplier-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const properties = feature.properties;
        const geometry = feature.geometry as any; // Type assertion for geometry
        
        new mapboxgl.Popup()
          .setLngLat(geometry.coordinates as [number, number])
          .setHTML(`
            <div class="p-3">
              <h3 class="font-semibold text-lg">${properties?.name}</h3>
              <p class="text-sm text-gray-600">${properties?.city}, ${properties?.country}</p>
              <div class="mt-2 space-y-1">
                <p class="text-xs"><strong>Certifications:</strong> ${properties?.certifications}</p>
                <p class="text-xs"><strong>Capacity:</strong> ${Number(properties?.capacity).toLocaleString()}</p>
                <p class="text-xs"><strong>Processes:</strong> ${properties?.processes}</p>
              </div>
            </div>
          `)
          .addTo(map.current!);
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'supplier-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'supplier-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };

  const addRegionBoundaries = () => {
    if (!map.current) return;

    // Add DACH region highlight (simplified)
    const dachBounds = {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        properties: { name: 'DACH Region' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [5.9, 45.8], [5.9, 55.1], [17.2, 55.1], [17.2, 45.8], [5.9, 45.8]
          ]]
        }
      }]
    };

    map.current.addSource('dach-region', {
      type: 'geojson',
      data: dachBounds
    });

    map.current.addLayer({
      id: 'dach-outline',
      type: 'line',
      source: 'dach-region',
      paint: {
        'line-color': '#ff7a1a',
        'line-width': 2,
        'line-dasharray': [5, 5]
      }
    });
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox public token.",
        variant: "destructive"
      });
      return;
    }
    initializeMap(mapboxToken);
  };

  const regionStats = supplierData.reduce((acc, supplier) => {
    const region = ['Germany', 'Austria', 'Switzerland'].includes(supplier.country) ? 'DACH' : 'Other EU';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!isTokenValid) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Geographic Supplier Distribution
          </CardTitle>
          <CardDescription>
            Enter your Mapbox public token to visualize supplier heat map.
            Get your token from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="pk.eyJ1IjoieW91ciB1c2VybmFtZSIsImEiOiAieW91ciB0b2tlbiJ9..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
            />
          </div>
          <Button onClick={handleTokenSubmit} className="w-full">
            Load Geographic Map
          </Button>
          
          {/* Show stats even without map */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{supplierData.length}</div>
              <div className="text-sm text-muted-foreground">Total Suppliers</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{Object.keys(cityCoordinates).length}</div>
              <div className="text-sm text-muted-foreground">Cities Covered</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Regional Distribution</h4>
            {Object.entries(regionStats).map(([region, count]) => (
              <div key={region} className="flex justify-between items-center">
                <span className="text-sm">{region}</span>
                <Badge variant="secondary">{String(count)} suppliers</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Supplier Geographic Heat Map
        </CardTitle>
        <CardDescription>
          Interactive visualization of supplier density across European regions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative">
          <div ref={mapContainer} className="w-full h-96 rounded-lg border overflow-hidden" />
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 space-y-2">
            <h4 className="font-medium text-sm">Heat Map Legend</h4>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-3 bg-gradient-to-r from-transparent via-primary/40 to-primary rounded"></div>
              <span>Supplier Density</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-primary/80 border-2 border-white rounded-full"></div>
              <span>Individual Suppliers</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-0.5 bg-primary border-dashed"></div>
              <span>DACH Region</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{supplierData.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                Total Suppliers
              </div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{regionStats['DACH'] || 0}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                DACH Region
              </div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{Object.keys(cityCoordinates).length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Globe className="h-3 w-3" />
                Cities Covered
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p><strong>How to use:</strong> Zoom in to see individual suppliers. Click on supplier points for detailed information. The heat map shows supplier concentration density.</p>
        </div>
      </CardContent>
    </Card>
  );
}