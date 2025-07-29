import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Eye, Plus, MapPin, Clock, Package, Filter as FilterIcon } from 'lucide-react';
import { PartSpec, MatchResult } from '@/types/domain';
import { getSuppliers, samplePartSpecs } from '@/data/seed';
import { matchSuppliers } from '@/lib/match';
import { addToShortlist, isInShortlist } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { applyFilters } from '@/lib/filters';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { filters } = useFilters();
  const [partSpec, setPartSpec] = useState<PartSpec>({
    part_number: '',
    description: '',
    material: '',
    process: '',
    annual_volume: 0
  });
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load demo data if demo=true in URL
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      const demoSpec = samplePartSpecs()[0];
      setPartSpec(demoSpec);
      handleSearch(demoSpec);
    }
  }, [searchParams]);

  const handleSearch = (spec?: PartSpec) => {
    const searchSpec = spec || partSpec;
    
    if (!searchSpec.description || !searchSpec.material || !searchSpec.process) {
      toast({
        title: "Missing Information",
        description: "Please fill in description, material, and process fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const allSuppliers = getSuppliers();
      const filteredSuppliers = applyFilters(allSuppliers, filters);
      const matches = matchSuppliers(searchSpec, filteredSuppliers, { maxResults: 20 });
      setResults(matches);
      setIsSearching(false);
      
      toast({
        title: "Search Complete",
        description: `Found ${matches.length} matching suppliers (${filteredSuppliers.length} total after filters)`
      });
    }, 1000);
  };

  const handleAddToShortlist = (result: MatchResult) => {
    addToShortlist(result.supplier);
    toast({
      title: "Added to Shortlist",
      description: `${result.supplier.name} has been added to your comparison list.`
    });
  };

  const getAuditReadinessBadge = (status: string) => {
    const colors = {
      'Audit-ready': 'bg-green-100 text-green-800 border-green-200',
      'Minor gaps': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Major gaps': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors['Major gaps'];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Search & Match Suppliers</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <FilterIcon className="h-3 w-3" />
            {Object.values(filters).flat().filter(f => f !== 'all' && f).length} filters active
          </Badge>
          <Badge variant="outline">
            {results.length} results
          </Badge>
        </div>
      </div>

      {/* Part Specification Form */}
      <Card>
        <CardHeader>
          <CardTitle>Part Specification</CardTitle>
          <CardDescription>
            Enter your component requirements to find matching suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                value={partSpec.part_number}
                onChange={(e) => setPartSpec(prev => ({ ...prev, part_number: e.target.value }))}
                placeholder="AUTO-BRK-001"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={partSpec.description}
                onChange={(e) => setPartSpec(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Automotive bracket"
                required
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">Material *</Label>
              <Input
                id="material"
                value={partSpec.material}
                onChange={(e) => setPartSpec(prev => ({ ...prev, material: e.target.value }))}
                placeholder="Al 6061"
                required
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="process">Process *</Label>
              <Input
                id="process"
                value={partSpec.process}
                onChange={(e) => setPartSpec(prev => ({ ...prev, process: e.target.value }))}
                placeholder="CNC milling"
                required
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual_volume">Annual Volume</Label>
              <Input
                id="annual_volume"
                type="number"
                value={partSpec.annual_volume || ''}
                onChange={(e) => setPartSpec(prev => ({ ...prev, annual_volume: parseInt(e.target.value) || 0 }))}
                placeholder="25000"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_price">Target Unit Price (€)</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                value={partSpec.target_unit_price || ''}
                onChange={(e) => setPartSpec(prev => ({ ...prev, target_unit_price: parseFloat(e.target.value) || undefined }))}
                placeholder="12.50"
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <Button 
            onClick={() => handleSearch()} 
            className="mt-4"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Find Suppliers'}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Matching Suppliers</h2>
          
          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.supplier.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{result.supplier.name}</h3>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {result.supplier.city}, {result.supplier.country}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {result.supplier.certifications.slice(0, 3).map((cert) => (
                          <Badge key={cert.code} variant="secondary">
                            {cert.code}
                          </Badge>
                        ))}
                        <Badge className={getAuditReadinessBadge(result.audit_readiness)}>
                          {result.audit_readiness}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{result.supplier.lead_time_days} days lead time</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>MOQ: {result.supplier.moq.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">
                            {(result.estimated_savings_rate * 100).toFixed(1)}% potential savings
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Match Score</span>
                          <span className="font-medium">{result.switching_cost_score}%</span>
                        </div>
                        <Progress value={result.switching_cost_score} className="h-2" />
                      </div>
                      
                      {result.reasons.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Why this match:</strong> {result.reasons.slice(0, 2).join('; ')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/supplier/${result.supplier.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToShortlist(result)}
                        disabled={isInShortlist(result.supplier.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isInShortlist(result.supplier.id) ? 'Added' : 'Shortlist'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Enter part specifications above to find matching suppliers
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}