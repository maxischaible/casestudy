import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Package,
  Factory,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  Settings,
  FileText,
  Building2,
  Eye,
  Search,
  TrendingDown
} from 'lucide-react';
import { getItems, getCompanySuppliers } from '@/data/seed';
import { Item } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const items = getItems();
  const companySuppliers = getCompanySuppliers();
  const item = items.find(item => item.id === id);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/items')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Item not found</h2>
            <p className="text-muted-foreground">The requested item could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supplier = companySuppliers.find(s => s.id === item.supplier_id || s.name.includes(item.current_supplier.split(' ')[0]));

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'EOL': 'bg-red-100 text-red-800 border-red-200', 
      'Planned': 'bg-blue-100 text-blue-800 border-blue-200',
      'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    } as const;
    
    return <Badge className={variants[status as keyof typeof variants] || ''}>{status}</Badge>;
  };

  const getCriticalityBadge = (criticality: string) => {
    const colors = {
      'A': 'bg-red-100 text-red-800 border-red-200',
      'B': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      'C': 'bg-green-100 text-green-800 border-green-200'
    };
    
    const labels = {
      'A': 'Critical',
      'B': 'Important',
      'C': 'Standard'
    };
    
    return (
      <Badge className={colors[criticality as keyof typeof colors] || ''}>
        {labels[criticality as keyof typeof labels]} ({criticality})
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewSupplier = () => {
    if (supplier) {
      navigate(`/supplier/${supplier.id}`);
    } else {
      toast({
        title: "Supplier not found",
        description: "Unable to locate the supplier details for this item."
      });
    }
  };

  // Risk and cost assessment
  const isHighCost = item.unit_price > 50; // Example threshold
  const isHighRisk = item.criticality === 'A' && item.lead_time_days > 21;
  const isSupplyChainRisk = item.criticality === 'A' || item.lead_time_days > 30;
  
  const shouldFindAlternatives = isHighCost || isHighRisk || isSupplyChainRisk;

  const handleFindAlternatives = () => {
    // Navigate to search with pre-filled criteria based on item specs
    const searchQuery = new URLSearchParams({
      material: item.material,
      process: item.process,
      description: item.description,
      annual_volume: item.annual_volume.toString(),
      target_unit_price: (item.unit_price * 0.8).toString(), // Target 20% savings
      findAlternative: 'true',
      originalItem: item.id
    });
    
    navigate(`/search?${searchQuery.toString()}`);
    
    toast({
      title: "Finding Alternatives",
      description: `Searching for suppliers for ${item.part_number}`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/items')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{item.part_number}</h1>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(item.status)}
          {getCriticalityBadge(item.criticality)}
          {shouldFindAlternatives && (
            <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Review Needed
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="supplier">Supplier</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Item Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="font-medium">{item.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Material</label>
                      <p className="font-medium">{item.material}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Process</label>
                      <p className="font-medium">{item.process}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">{getStatusBadge(item.status)}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{item.annual_volume.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Annual Volume</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(item.unit_price)}</p>
                      <p className="text-sm text-muted-foreground">Unit Price</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(item.total_value)}</p>
                      <p className="text-sm text-muted-foreground">Annual Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Supply Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Lead Time</label>
                      <p className="font-medium">{item.lead_time_days} days</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">MOQ</label>
                      <p className="font-medium">{item.moq.toLocaleString()} units</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Order</label>
                      <p className="font-medium">{formatDate(item.last_order_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Next Order</label>
                      <p className="font-medium">{formatDate(item.next_order_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Part Number</label>
                      <p className="font-medium font-mono">{item.part_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="font-medium">{item.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Material</label>
                      <p className="font-medium">{item.material}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Manufacturing Process</label>
                      <p className="font-medium">{item.process}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Drawings Available</span>
                      </div>
                      <Badge variant={item.drawings_available ? "default" : "secondary"}>
                        {item.drawings_available ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Tooling Required</span>
                      </div>
                      <Badge variant={item.tooling_required ? "destructive" : "default"}>
                        {item.tooling_required ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supplier" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Current Supplier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{item.current_supplier}</h3>
                      {supplier && (
                        <p className="text-muted-foreground">{supplier.city}, {supplier.country}</p>
                      )}
                    </div>
                    {supplier && (
                      <Button variant="outline" onClick={handleViewSupplier}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Supplier
                      </Button>
                    )}
                  </div>
                  
                  {supplier && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                          <p className="font-medium">{supplier.contact_person}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="font-medium">{supplier.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Relationship Status</label>
                          <div className="mt-1">
                            <Badge className={
                              supplier.relationship_status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                              supplier.relationship_status === 'Preferred' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }>
                              {supplier.relationship_status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Performance Score</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={supplier.performance_score} className="flex-1" />
                            <span className="text-sm font-medium">{supplier.performance_score}%</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Order History & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Last Order Placed</p>
                        <p className="text-sm text-muted-foreground">{formatDate(item.last_order_date)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Order quantity: {(item.annual_volume / 4).toLocaleString()} units
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Next Planned Order</p>
                        <p className="text-sm text-muted-foreground">{formatDate(item.next_order_date)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Estimated quantity: {(item.annual_volume / 4).toLocaleString()} units
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Detailed order history and analytics coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Criticality Level</span>
                {getCriticalityBadge(item.criticality)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                {getStatusBadge(item.status)}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Annual Volume</span>
                  <span className="font-medium">{item.annual_volume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unit Price</span>
                  <span className="font-medium">{formatCurrency(item.unit_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Annual Value</span>
                  <span className="font-bold text-lg">{formatCurrency(item.total_value)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Chain Risk */}
          <Card className={shouldFindAlternatives ? "border-orange-200 bg-orange-50/50" : ""}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Supply Chain Assessment
              </CardTitle>
              {shouldFindAlternatives && (
                <CardDescription className="text-orange-700">
                  Risk factors detected - consider finding alternatives
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {isHighRisk ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm">
                  {isHighRisk ? "High supply chain risk" : "Supply chain risk managed"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Lead time: {item.lead_time_days} days</span>
                {item.lead_time_days > 30 && (
                  <Badge variant="outline" className="ml-2 text-orange-700 border-orange-200">
                    Long lead time
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className={`h-4 w-4 ${isHighCost ? 'text-red-600' : 'text-blue-600'}`} />
                <span className="text-sm">
                  {isHighCost ? "High cost item" : "Cost optimized"}
                </span>
                {isHighCost && (
                  <Badge variant="outline" className="ml-2 text-red-700 border-red-200">
                    Cost review needed
                  </Badge>
                )}
              </div>

              {shouldFindAlternatives && (
                <div className="pt-3 border-t">
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

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Drawings
              </Button>
              
              {shouldFindAlternatives ? (
                <Button 
                  onClick={handleFindAlternatives}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Optimize Sourcing
                </Button>
              ) : (
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>
              )}
              
              {supplier && (
                <Button className="w-full" variant="outline" onClick={handleViewSupplier}>
                  <Building2 className="h-4 w-4 mr-2" />
                  View Supplier
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}