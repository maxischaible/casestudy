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
  Search,
  Eye,
  TrendingDown,
  DollarSign,
  FileCheck
} from 'lucide-react';
import { getSuppliers, getCompanySuppliers, getItems } from '@/data/seed';
import { addToShortlist, isInShortlist } from '@/lib/storage';
import { Item } from '@/types/domain';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Try both supplier data sources to find the supplier
  const searchSuppliers = getSuppliers();
  const companySuppliers = getCompanySuppliers();
  
  let supplier = searchSuppliers.find(s => s.id === id);
  if (!supplier) {
    // If not found in search suppliers, try company suppliers but convert the data structure
    const companySupplier = companySuppliers.find(s => s.id === id);
    if (companySupplier) {
      // Convert CompanySupplier to Supplier format for compatibility
      supplier = {
        id: companySupplier.id,
        name: companySupplier.name,
        country: companySupplier.country,
        city: companySupplier.city,
        categories: companySupplier.categories,
        processes: ['CNC milling', 'CNC turning'], // Default processes
        materials: ['Steel S235', 'Al 6061'], // Default materials
        certifications: companySupplier.certifications,
        capacity: { unit: 'units/month', value: 10000 },
        moq: 100,
        lead_time_days: 14,
        quality: {
          on_time_rate: companySupplier.delivery_rating / 5,
          defect_rate_ppm: Math.max(10, (5 - companySupplier.quality_rating) * 200)
        },
        price_index: 1.0,
        website: `https://www.${companySupplier.name.toLowerCase().replace(/\s+/g, '')}.com`
      };
    }
  }
  
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

  // Get items supplied by this supplier
  const allItems = getItems();
  const supplierItems = allItems.filter(item => 
    item.supplier_id === supplier.id || 
    item.current_supplier.toLowerCase().includes(supplier.name.toLowerCase().split(' ')[0])
  );

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

  const handleFindAlternativeForItem = (item: Item) => {
    // Navigate to search with pre-filled criteria based on item specifications
    const searchQuery = new URLSearchParams({
      part_number: item.part_number,
      description: item.description,
      material: item.material,
      process: item.process,
      annual_volume: item.annual_volume.toString(),
      target_unit_price: item.unit_price.toString(),
      findAlternative: 'true',
      originalItem: item.id,
      originalSupplier: supplier.id
    });
    
    navigate(`/search?${searchQuery.toString()}`);
    
    toast({
      title: "Finding Alternative Suppliers",
      description: `Searching for alternative suppliers for ${item.part_number}`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getCriticalityBadge = (criticality: string) => {
    const colors = {
      'A': 'bg-red-100 text-red-800 border-red-200',
      'B': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      'C': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <Badge className={colors[criticality as keyof typeof colors] || ''}>
        {criticality}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'default',
      'EOL': 'destructive', 
      'Planned': 'secondary',
      'On Hold': 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  // Risk assessment for items (high-risk items should trigger alternative search suggestions)
  const getItemRiskLevel = (item: Item) => {
    if (item.criticality === 'A' && (item.status === 'EOL' || supplier.price_index > 1.1)) {
      return 'high';
    }
    if ((item.criticality === 'B' && supplier.price_index > 1.2) || item.lead_time_days > 45) {
      return 'medium';
    }
    return 'low';
  };

  // Calculate summary statistics for supplier items
  const totalItemValue = supplierItems.reduce((sum, item) => sum + item.total_value, 0);
  const criticalItems = supplierItems.filter(item => item.criticality === 'A').length;
  const eolItems = supplierItems.filter(item => item.status === 'EOL').length;

  // Mock switching score calculation for display
  const switchingScore = 75 + Math.floor(Math.random() * 20);

  // Audit state management
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [auditInitiated, setAuditInitiated] = useState(false);

  const handleInitiateAudit = () => {
    setAuditInitiated(true);
    setIsAuditDialogOpen(false);
    
    // Generate mock audit ID and upload link
    const auditId = `AUD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const uploadLink = `${window.location.origin}/supplier-upload/${auditId}`;
    
    toast({
      title: "Audit Initiated",
      description: `Audit request sent to ${supplier.name}. Upload link: ${uploadLink}`
    });
  };

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
          <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileCheck className="h-4 w-4" />
                Initiate Audit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Initiate Supplier Audit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will send an audit request to {supplier.name} with a secure upload link for:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Current certifications (PDF format)</li>
                  <li>• Quality management documentation</li>
                  <li>• Financial statements</li>
                  <li>• Process capability reports</li>
                  <li>• Safety and compliance records</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  The supplier will have 14 days to complete the audit submission.
                </p>
                
                {auditInitiated && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Audit Successfully Initiated!</p>
                    <p className="text-xs text-green-700">
                      Upload link sent to supplier: 
                      <br />
                      <code className="bg-green-100 px-1 rounded text-xs">
                        {window.location.origin}/supplier-upload/AUD-2024-001
                      </code>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open('/supplier-upload/AUD-2024-001', '_blank')}
                    >
                      Preview Upload Portal
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInitiateAudit} disabled={auditInitiated}>
                    {auditInitiated ? 'Audit Sent' : 'Send Audit Request'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items ({supplierItems.length})</TabsTrigger>
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

            <TabsContent value="items" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Supplied Items</CardTitle>
                      <CardDescription>
                        Items currently supplied by {supplier.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-primary">{supplierItems.length}</div>
                        <div className="text-muted-foreground">Total Items</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-primary">{formatCurrency(totalItemValue)}</div>
                        <div className="text-muted-foreground">Annual Value</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">{criticalItems}</div>
                        <div className="text-muted-foreground">Critical (A)</div>
                      </div>
                      {eolItems > 0 && (
                        <div className="text-center">
                          <div className="font-bold text-orange-600">{eolItems}</div>
                          <div className="text-muted-foreground">EOL Items</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {supplierItems.length > 0 ? (
                    <div className="space-y-4">
                      {supplierItems.map((item) => {
                        const riskLevel = getItemRiskLevel(item);
                        const showAlternativeButton = riskLevel === 'high' || riskLevel === 'medium';
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`p-4 border rounded-lg ${
                              riskLevel === 'high' 
                                ? 'border-red-200 bg-red-50/50' 
                                : riskLevel === 'medium' 
                                ? 'border-orange-200 bg-orange-50/50' 
                                : 'border-border'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium">{item.part_number}</h4>
                                  {getCriticalityBadge(item.criticality)}
                                  {getStatusBadge(item.status)}
                                  {riskLevel === 'high' && (
                                    <Badge variant="destructive" className="gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      High Risk
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Material:</span>
                                    <br />
                                    <span className="text-muted-foreground">{item.material}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Process:</span>
                                    <br />
                                    <span className="text-muted-foreground">{item.process}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Annual Volume:</span>
                                    <br />
                                    <span className="text-muted-foreground">{item.annual_volume.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Unit Price:</span>
                                    <br />
                                    <span className="text-muted-foreground">{formatCurrency(item.unit_price)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span>{item.lead_time_days} days lead time</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <span>MOQ: {item.moq.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                                    <span>Total: {formatCurrency(item.total_value)}</span>
                                  </div>
                                </div>

                                {(item.status === 'EOL' || riskLevel === 'high') && (
                                  <div className="text-sm text-orange-700 bg-orange-100 p-2 rounded">
                                    {item.status === 'EOL' && <span>⚠️ This item is End-of-Life. </span>}
                                    {riskLevel === 'high' && <span>⚠️ High risk item - consider finding alternatives. </span>}
                                    {supplier.price_index > 1.1 && <span>💰 Potential cost savings available. </span>}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/item/${item.id}`)}
                                  className="gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Button>
                                
                                {showAlternativeButton && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFindAlternativeForItem(item)}
                                    className={`gap-2 ${
                                      riskLevel === 'high' 
                                        ? 'border-red-200 text-red-700 hover:bg-red-50' 
                                        : 'border-orange-200 text-orange-700 hover:bg-orange-50'
                                    }`}
                                  >
                                    <Search className="h-4 w-4" />
                                    Find Alternatives
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No items found for this supplier</p>
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
                      <div className="text-2xl font-bold text-primary">{supplier.quality.defect_rate_ppm.toFixed(2)}</div>
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