import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Calendar, 
  TrendingUp, 
  Package, 
  Clock, 
  Award, 
  Plus,
  AlertTriangle,
  Search
} from 'lucide-react';
import { getSuppliers } from '@/data/seed';
import { addToShortlist, isInShortlist } from '@/lib/storage';

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const supplier = getSuppliers().find(s => s.id === id);
  
  if (!supplier) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Supplier not found</p>
            <Button onClick={() => navigate('/search')} className="mt-4">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddToShortlist = () => {
    addToShortlist(supplier);
    toast({
      title: "Added to Shortlist",
      description: `${supplier.name} has been added to your comparison list.`
    });
  };

  // Risk assessment
  const isHighRisk = supplier.quality?.defect_rate_ppm > 1000 || 
                     supplier.lead_time_days > 30 || 
                     supplier.price_index > 1.2;

  const handleFindAlternatives = () => {
    // Navigate to search with pre-filled criteria based on supplier capabilities
    const searchQuery = new URLSearchParams({
      material: supplier.materials[0] || '',
      process: supplier.processes[0] || '',
      description: `Alternative to ${supplier.name}`,
      findAlternative: 'true',
      originalSupplier: supplier.id
    });
    
    navigate(`/search?${searchQuery.toString()}`);
    
    toast({
      title: "Finding Alternatives",
      description: `Searching for suppliers similar to ${supplier.name}`,
    });
  };

  // Mock switching score calculation for display
  const switchingScore = 75 + Math.floor(Math.random() * 20);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {supplier.city}, {supplier.country}
            </div>
            {supplier.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Website
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleAddToShortlist}
            disabled={isInShortlist(supplier.id)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isInShortlist(supplier.id) ? 'In Shortlist' : 'Add to Shortlist'}
          </Button>
          
          {isHighRisk && (
            <Button 
              onClick={handleFindAlternatives}
              variant="outline"
              className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Search className="h-4 w-4" />
              Find Alternatives
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {supplier.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Capacity</h3>
                      <p className="text-sm text-muted-foreground">
                        {supplier.capacity.value.toLocaleString()} {supplier.capacity.unit}
                      </p>
                    </div>
                  </div>
                  
                  {supplier.past_clients && (
                    <div>
                      <h3 className="font-medium mb-2">Notable Clients</h3>
                      <div className="flex flex-wrap gap-2">
                        {supplier.past_clients.map((client) => (
                          <Badge key={client} variant="outline">
                            {client}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {supplier.sustainability && (
                    <div>
                      <h3 className="font-medium mb-2">Sustainability</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={supplier.sustainability.co2e_class === 'A' ? 'default' : 'secondary'}>
                          CO2e Class {supplier.sustainability.co2e_class}
                        </Badge>
                        {supplier.sustainability.notes && (
                          <span className="text-sm text-muted-foreground">
                            {supplier.sustainability.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manufacturing Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Processes</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {supplier.processes.map((process) => (
                        <div key={process} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <Award className="h-4 w-4 text-primary" />
                          {process}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Materials</h3>
                    <div className="grid md:grid-cols-3 gap-2">
                      {supplier.materials.map((material) => (
                        <Badge key={material} variant="outline">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supplier.certifications.map((cert) => {
                      const isExpiringSoon = new Date(cert.expiry) < new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
                      const isExpired = new Date(cert.expiry) < new Date();
                      
                      return (
                        <div key={cert.code} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{cert.code}</h3>
                            {cert.issuer && (
                              <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Expires: {new Date(cert.expiry).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge 
                              variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "default"}
                              className="mt-1"
                            >
                              {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Valid"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">On-Time Delivery Rate</span>
                        <span className="text-sm font-bold">
                          {(supplier.quality.on_time_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={supplier.quality.on_time_rate * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Quality Score</span>
                        <span className="text-sm font-bold">
                          {Math.max(0, 100 - supplier.quality.defect_rate_ppm / 10).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={Math.max(0, 100 - supplier.quality.defect_rate_ppm / 10)} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{supplier.quality.defect_rate_ppm}</div>
                      <div className="text-sm text-muted-foreground">Defect Rate (PPM)</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{supplier.lead_time_days}</div>
                      <div className="text-sm text-muted-foreground">Lead Time (Days)</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{supplier.moq.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Minimum Order Qty</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className={isHighRisk ? "border-orange-200 bg-orange-50/50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isHighRisk && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                <TrendingUp className="h-5 w-5" />
                Switching Score
              </CardTitle>
              {isHighRisk && (
                <CardDescription className="text-orange-700">
                  High risk detected - consider finding alternatives
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary">{switchingScore}%</div>
                <div className="text-sm text-muted-foreground">Overall Match</div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Capability Fit</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Compliance</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Proximity</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quality Risk</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-1" />
                </div>
              </div>
              
              {isHighRisk && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleFindAlternatives}
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Alternative Suppliers
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Price Index</span>
                <Badge variant={supplier.price_index < 1.0 ? "default" : "secondary"}>
                  {supplier.price_index.toFixed(2)}x
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Time</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.lead_time_days} days</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">MOQ</span>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.moq.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}