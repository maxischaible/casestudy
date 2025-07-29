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
  TrendingUp
} from 'lucide-react';
import { getItems } from '@/data/seed';
import { Item } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';

export default function Items() {
  const { toast } = useToast();
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
    toast({
      title: "Item Details",
      description: `Viewing details for ${item.part_number}`
    });
  };

  const handleEditItem = (item: Item) => {
    toast({
      title: "Edit Item",
      description: `Editing ${item.part_number}`
    });
  };

  // Calculate summary statistics
  const totalValue = filteredAndSortedItems.reduce((sum, item) => sum + item.total_value, 0);
  const activeItems = filteredAndSortedItems.filter(item => item.status === 'Active').length;
  const criticalItems = filteredAndSortedItems.filter(item => item.criticality === 'A').length;

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

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items List</CardTitle>
          <CardDescription>
            {filteredAndSortedItems.length} of {items.length} items shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <Button variant="ghost" onClick={() => handleSort('part_number')} className="font-medium flex items-center gap-1">
                      Part Number {getSortIcon('part_number')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button variant="ghost" onClick={() => handleSort('description')} className="font-medium flex items-center gap-1">
                      Description {getSortIcon('description')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button variant="ghost" onClick={() => handleSort('category')} className="font-medium flex items-center gap-1">
                      Category {getSortIcon('category')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button variant="ghost" onClick={() => handleSort('current_supplier')} className="font-medium flex items-center gap-1">
                      Supplier {getSortIcon('current_supplier')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button variant="ghost" onClick={() => handleSort('status')} className="font-medium flex items-center gap-1">
                      Status {getSortIcon('status')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button variant="ghost" onClick={() => handleSort('criticality')} className="font-medium flex items-center gap-1">
                      Criticality {getSortIcon('criticality')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button variant="ghost" onClick={() => handleSort('total_value')} className="font-medium flex items-center gap-1">
                      Annual Value {getSortIcon('total_value')}
                    </Button>
                  </th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{item.part_number}</td>
                    <td className="p-3 max-w-xs">
                      <div className="truncate" title={item.description}>
                        {item.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.material} • {item.process}
                      </div>
                    </td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">{item.current_supplier}</td>
                    <td className="p-3">{getStatusBadge(item.status)}</td>
                    <td className="p-3">{getCriticalityBadge(item.criticality)}</td>
                    <td className="p-3">
                      <div className="font-medium">{formatCurrency(item.total_value)}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.annual_volume.toLocaleString()} units
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
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