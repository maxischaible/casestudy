import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Trash2, Database, Users, Download } from 'lucide-react';
import { generateSuppliers, getSuppliers } from '@/data/seed';
import { clearShortlist, getShortlist } from '@/lib/storage';

export default function Admin() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suppliers] = useState(getSuppliers());
  const [shortlist, setShortlist] = useState(getShortlist());

  const handleRegenerateSuppliers = async () => {
    setIsGenerating(true);
    
    // Simulate generation time
    setTimeout(() => {
      generateSuppliers(300);
      setIsGenerating(false);
      toast({
        title: "Suppliers Regenerated",
        description: "Fresh supplier data has been generated with 300 companies."
      });
    }, 2000);
  };

  const handleClearShortlist = () => {
    clearShortlist();
    setShortlist([]);
    toast({
      title: "Shortlist Cleared",
      description: "All items have been removed from the shortlist."
    });
  };

  const handleExportData = () => {
    const data = {
      suppliers: suppliers.slice(0, 10), // Export first 10 for demo
      shortlist: shortlist,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tacto-data-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Platform data has been exported to JSON file."
    });
  };

  const stats = {
    totalSuppliers: suppliers.length,
    certifiedSuppliers: suppliers.filter(s => s.certifications.some(c => c.code === 'IATF16949')).length,
    euSuppliers: suppliers.filter(s => ['DE', 'PL', 'CZ', 'SK', 'HU', 'RO', 'IT', 'ES', 'FR', 'NL', 'SE'].includes(s.country)).length,
    shortlistCount: shortlist.length,
    avgPriceIndex: suppliers.reduce((sum, s) => sum + s.price_index, 0) / suppliers.length,
    avgLeadTime: suppliers.reduce((sum, s) => sum + s.lead_time_days, 0) / suppliers.length
  };

  const topCategories = suppliers.reduce((acc, supplier) => {
    supplier.categories.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topCategoriesList = Object.entries(topCategories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalSuppliers}</div>
            <div className="text-sm text-muted-foreground">Total Suppliers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.certifiedSuppliers}</div>
            <div className="text-sm text-muted-foreground">IATF16949 Certified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.euSuppliers}</div>
            <div className="text-sm text-muted-foreground">EU-27 Suppliers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.shortlistCount}</div>
            <div className="text-sm text-muted-foreground">Items in Shortlist</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage supplier data and system settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              onClick={handleRegenerateSuppliers}
              disabled={isGenerating}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <RefreshCw className={`h-6 w-6 ${isGenerating ? 'animate-spin' : ''}`} />
              <div className="text-center">
                <div className="font-medium">Regenerate Suppliers</div>
                <div className="text-xs text-muted-foreground">
                  Create fresh mock data (300 suppliers)
                </div>
              </div>
            </Button>

            <Button 
              onClick={handleClearShortlist}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Trash2 className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Clear Shortlist</div>
                <div className="text-xs text-muted-foreground">
                  Remove all shortlisted suppliers
                </div>
              </div>
            </Button>

            <Button 
              onClick={handleExportData}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Export Data</div>
                <div className="text-xs text-muted-foreground">
                  Download current data as JSON
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Price Index</span>
              <Badge variant="secondary">
                {stats.avgPriceIndex.toFixed(2)}x
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Lead Time</span>
              <Badge variant="secondary">
                {Math.round(stats.avgLeadTime)} days
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Certification Coverage</span>
              <Badge variant="secondary">
                {Math.round((stats.certifiedSuppliers / stats.totalSuppliers) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategoriesList.map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm">{category}</span>
                  <Badge variant="outline">{count} suppliers</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-4">
            {Object.entries(
              suppliers.reduce((acc, supplier) => {
                acc[supplier.country] = (acc[supplier.country] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([,a], [,b]) => b - a)
              .slice(0, 12)
              .map(([country, count]) => (
                <div key={country} className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-lg font-bold">{country}</div>
                  <div className="text-sm text-muted-foreground">{count} suppliers</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Platform Version:</strong> 1.0.0-prototype
            </div>
            <div>
              <strong>Last Data Refresh:</strong> {new Date().toLocaleDateString()}
            </div>
            <div>
              <strong>Storage Type:</strong> Browser localStorage
            </div>
            <div>
              <strong>Demo Mode:</strong> Active
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}