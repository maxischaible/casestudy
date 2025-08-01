import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Edit,
  Building2,
  Star,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { getCompanySuppliers } from '@/data/seed';
import { CompanySupplier } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Suppliers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [suppliers] = useState<CompanySupplier[]>(getCompanySuppliers());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof CompanySupplier>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique values for filters
  const uniqueCountries = Array.from(new Set(suppliers.map(supplier => supplier.country)));
  const uniqueStatuses = Array.from(new Set(suppliers.map(supplier => supplier.relationship_status)));
  const uniqueRiskLevels = Array.from(new Set(suppliers.map(supplier => supplier.risk_level)));

  // Filter and sort suppliers
  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || supplier.relationship_status === statusFilter;
      const matchesCountry = countryFilter === 'all' || supplier.country === countryFilter;
      const matchesRisk = riskFilter === 'all' || supplier.risk_level === riskFilter;

      return matchesSearch && matchesStatus && matchesCountry && matchesRisk;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [suppliers, searchTerm, statusFilter, countryFilter, riskFilter, sortField, sortDirection]);

  const handleSort = (field: keyof CompanySupplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof CompanySupplier) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'default',
      'Preferred': 'default',
      'Qualified': 'secondary', 
      'Under Review': 'outline',
      'Inactive': 'destructive'
    } as const;
    
    const colors = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Preferred': 'bg-blue-100 text-blue-800 border-blue-200',
      'Qualified': 'bg-gray-100 text-gray-800 border-gray-200',
      'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Inactive': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || ''}>
        {status}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      'High': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={colors[risk as keyof typeof colors] || ''}>
        {risk} Risk
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const handleViewDetails = (supplier: CompanySupplier) => {
    // Navigate to supplier profile if it exists, otherwise show toast
    navigate(`/supplier/${supplier.id}`);
  };

  const handleEditSupplier = (supplier: CompanySupplier) => {
    toast({
      title: "Edit Supplier",
      description: `Editing ${supplier.name}`
    });
  };

  const handleContactSupplier = (supplier: CompanySupplier) => {
    window.open(`mailto:${supplier.email}?subject=Inquiry from tacto Sourcing Platform`);
  };

  // Quick filter handlers
  const handleQuickFilterRemove = (filterType: 'status' | 'country' | 'risk', value?: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter('all');
        break;
      case 'country':
        setCountryFilter('all');
        break;
      case 'risk':
        setRiskFilter('all');
        break;
    }
  };

  // Calculate summary statistics
  const totalSpend = filteredAndSortedSuppliers.reduce((sum, supplier) => sum + supplier.total_annual_spend, 0);
  const activeSuppliers = filteredAndSortedSuppliers.filter(supplier => supplier.relationship_status === 'Active').length;
  const preferredSuppliers = filteredAndSortedSuppliers.filter(supplier => supplier.relationship_status === 'Preferred').length;
  const avgPerformance = filteredAndSortedSuppliers.reduce((sum, supplier) => sum + supplier.performance_score, 0) / filteredAndSortedSuppliers.length;

  // Active filters count
  const activeFiltersCount = [statusFilter, countryFilter, riskFilter].filter(f => f !== 'all').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier relationships and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            {filteredAndSortedSuppliers.length} suppliers
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {formatCurrency(totalSpend)} annual spend
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-xl font-bold">{activeSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Preferred Suppliers</p>
                <p className="text-xl font-bold">{preferredSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-xl font-bold">{avgPerformance.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-xl font-bold">{formatCurrency(totalSpend)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {(searchTerm || activeFiltersCount > 0) && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCountryFilter('all');
              setRiskFilter('all');
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Active filters:</span>
          {statusFilter !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickFilterRemove('status')}
              className="gap-2 h-7"
            >
              Status: {statusFilter}
              <X className="h-3 w-3" />
            </Button>
          )}
          {countryFilter !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickFilterRemove('country')}
              className="gap-2 h-7"
            >
              Country: {countryFilter}
              <X className="h-3 w-3" />
            </Button>
          )}
          {riskFilter !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickFilterRemove('risk')}
              className="gap-2 h-7"
            >
              Risk: {riskFilter}
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setCountryFilter('all');
              setRiskFilter('all');
            }}
            className="text-muted-foreground h-7"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers List</CardTitle>
          <CardDescription>
            {filteredAndSortedSuppliers.length} of {suppliers.length} suppliers shown
            {activeFiltersCount > 0 && <span className="text-primary"> • {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-48">
                    <Button variant="ghost" onClick={() => handleSort('name')} className="font-medium flex items-center gap-1 text-xs">
                      Supplier Name {getSortIcon('name')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-24">
                    <Button variant="ghost" onClick={() => handleSort('country')} className="font-medium flex items-center gap-1 text-xs">
                      Location {getSortIcon('country')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-24">
                    <Button variant="ghost" onClick={() => handleSort('relationship_status')} className="font-medium flex items-center gap-1 text-xs">
                      Status {getSortIcon('relationship_status')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-20">
                    <Button variant="ghost" onClick={() => handleSort('performance_score')} className="font-medium flex items-center gap-1 text-xs">
                      Perf. {getSortIcon('performance_score')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-20">
                    <Button variant="ghost" onClick={() => handleSort('quality_rating')} className="font-medium flex items-center gap-1 text-xs">
                      Quality {getSortIcon('quality_rating')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-28">
                    <Button variant="ghost" onClick={() => handleSort('total_annual_spend')} className="font-medium flex items-center gap-1 text-xs">
                      Annual Spend {getSortIcon('total_annual_spend')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-20">
                    <Button variant="ghost" onClick={() => handleSort('risk_level')} className="font-medium flex items-center gap-1 text-xs">
                      Risk {getSortIcon('risk_level')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="font-medium text-xs truncate" title={supplier.name}>{supplier.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="truncate">{supplier.contact_person}</span>
                        <span>•</span>
                        <span>{supplier.items_count} items</span>
                      </div>
                    </td>
                     <td className="p-2">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setCountryFilter(supplier.country)}
                         className="p-0 h-auto flex items-center gap-1"
                       >
                         <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                         <span className="text-xs truncate">{supplier.city}, {supplier.country}</span>
                       </Button>
                     </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter(supplier.relationship_status)}
                        className="p-0 h-auto"
                      >
                        {getStatusBadge(supplier.relationship_status)}
                      </Button>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium">{supplier.performance_score}%</span>
                        </div>
                        <Progress value={supplier.performance_score} className="h-1 w-12" />
                      </div>
                    </td>
                    <td className="p-2">{renderStars(supplier.quality_rating)}</td>
                    <td className="p-2">
                      <div className="font-medium text-xs">{formatCurrency(supplier.total_annual_spend)}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {supplier.payment_terms}
                      </div>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRiskFilter(supplier.risk_level)}
                        className="p-0 h-auto"
                      >
                        {getRiskBadge(supplier.risk_level)}
                      </Button>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(supplier)}
                          title="View Details"
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleContactSupplier(supplier)}
                          title="Contact Supplier"
                          className="h-6 w-6 p-0"
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditSupplier(supplier)}
                          title="Edit Supplier"
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No suppliers match the current filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}