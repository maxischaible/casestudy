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
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { getItems } from '@/data/seed';
import { Item } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Items() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items] = useState<Item[]>(getItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Item>('part_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
  const uniqueStatuses = Array.from(new Set(items.map(item => item.status)));

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.current_supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesCriticality = criticalityFilter === 'all' || item.criticality === criticalityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesCriticality;
    });

    // Sort items
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
  }, [items, searchTerm, statusFilter, categoryFilter, criticalityFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Item) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Item) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleViewDetails = (item: Item) => {
    navigate(`/item/${item.id}`);
  };

  const handleEditItem = (item: Item) => {
    toast({
      title: "Edit Item",
      description: `Editing ${item.part_number}`
    });
  };

  // Quick filter handlers
  const handleQuickFilterRemove = (filterType: 'status' | 'category' | 'criticality', value?: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter('all');
        break;
      case 'category':
        setCategoryFilter('all');
        break;
      case 'criticality':
        setCriticalityFilter('all');
        break;
    }
  };

  // Calculate summary statistics
  const totalValue = filteredAndSortedItems.reduce((sum, item) => sum + item.total_value, 0);
  const activeItems = filteredAndSortedItems.filter(item => item.status === 'Active').length;
  const criticalItems = filteredAndSortedItems.filter(item => item.criticality === 'A').length;

  // Active filters count
  const activeFiltersCount = [statusFilter, categoryFilter, criticalityFilter].filter(f => f !== 'all').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Items</h1>
          <p className="text-muted-foreground">Manage your component inventory and supplier relationships</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Package className="h-3 w-3" />
            {filteredAndSortedItems.length} items
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {formatCurrency(totalValue)} total value
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Items</p>
                <p className="text-xl font-bold">{activeItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Items</p>
                <p className="text-xl font-bold">{criticalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Criticality</label>
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="A">Critical (A)</SelectItem>
                  <SelectItem value="B">Important (B)</SelectItem>
                  <SelectItem value="C">Standard (C)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setCriticalityFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
          {categoryFilter !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickFilterRemove('category')}
              className="gap-2 h-7"
            >
              Category: {categoryFilter}
              <X className="h-3 w-3" />
            </Button>
          )}
          {criticalityFilter !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickFilterRemove('criticality')}
              className="gap-2 h-7"
            >
              Criticality: {criticalityFilter}
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
              setCriticalityFilter('all');
            }}
            className="text-muted-foreground h-7"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items List</CardTitle>
          <CardDescription>
            {filteredAndSortedItems.length} of {items.length} items shown
            {activeFiltersCount > 0 && <span className="text-primary"> • {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-32">
                    <Button variant="ghost" onClick={() => handleSort('part_number')} className="font-medium flex items-center gap-1 text-xs">
                      Part Number {getSortIcon('part_number')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-48">
                    <Button variant="ghost" onClick={() => handleSort('description')} className="font-medium flex items-center gap-1 text-xs">
                      Description {getSortIcon('description')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-28">
                    <Button variant="ghost" onClick={() => handleSort('category')} className="font-medium flex items-center gap-1 text-xs">
                      Category {getSortIcon('category')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-36">
                    <Button variant="ghost" onClick={() => handleSort('current_supplier')} className="font-medium flex items-center gap-1 text-xs">
                      Supplier {getSortIcon('current_supplier')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-20">
                    <Button variant="ghost" onClick={() => handleSort('status')} className="font-medium flex items-center gap-1 text-xs">
                      Status {getSortIcon('status')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-16">
                    <Button variant="ghost" onClick={() => handleSort('criticality')} className="font-medium flex items-center gap-1 text-xs">
                      Crit. {getSortIcon('criticality')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-28">
                    <Button variant="ghost" onClick={() => handleSort('total_value')} className="font-medium flex items-center gap-1 text-xs">
                      Annual Value {getSortIcon('total_value')}
                    </Button>
                  </th>
                  <th className="text-left p-2 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium text-xs">{item.part_number}</td>
                    <td className="p-2 w-48">
                      <div className="truncate text-xs" title={item.description}>
                        {item.description}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.material} • {item.process}
                      </div>
                    </td>
                    <td className="p-2 text-xs">{item.category.split(' ')[0]}</td>
                    <td className="p-2 text-xs truncate" title={item.current_supplier}>{item.current_supplier}</td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter(item.status)}
                        className="p-0 h-auto"
                      >
                        {getStatusBadge(item.status)}
                      </Button>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCriticalityFilter(item.criticality)}
                        className="p-0 h-auto"
                      >
                        {getCriticalityBadge(item.criticality)}
                      </Button>
                    </td>
                    <td className="p-2">
                      <div className="font-medium text-xs">{formatCurrency(item.total_value)}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.annual_volume > 1000 ? `${Math.round(item.annual_volume/1000)}k` : item.annual_volume} units
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(item)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditItem(item)}
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
          
          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items match the current filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}