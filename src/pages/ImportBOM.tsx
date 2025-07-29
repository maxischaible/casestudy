import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { PartSpec, MatchResult } from '@/types/domain';
import { getSuppliers } from '@/data/seed';
import { matchSuppliers } from '@/lib/match';
import { useNavigate } from 'react-router-dom';

interface BOMItem extends PartSpec {
  current_supplier?: string;
  current_unit_price?: number;
  matches?: MatchResult[];
  processed?: boolean;
}

export default function ImportBOM() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseBOM(csv);
    };
    reader.readAsText(file);
  };

  const parseBOM = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast({
        title: "Invalid File",
        description: "CSV file must contain headers and at least one row.",
        variant: "destructive"
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const items: BOMItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 4) continue;

      const item: BOMItem = {
        part_number: getValue(values, headers, 'part_number') || `PART-${i}`,
        description: getValue(values, headers, 'description') || 'Unknown part',
        material: getValue(values, headers, 'material') || 'Unknown',
        process: getValue(values, headers, 'process') || 'Unknown',
        annual_volume: parseInt(getValue(values, headers, 'annual_volume') || '0') || 1000,
        current_supplier: getValue(values, headers, 'current_supplier'),
        current_unit_price: parseFloat(getValue(values, headers, 'current_unit_price') || '0') || undefined,
        processed: false
      };

      items.push(item);
    }

    setBomItems(items);
    toast({
      title: "BOM Uploaded",
      description: `Successfully parsed ${items.length} items from BOM.`
    });
  };

  const getValue = (values: string[], headers: string[], key: string): string | undefined => {
    const index = headers.findIndex(h => h.includes(key) || key.includes(h));
    return index >= 0 ? values[index] : undefined;
  };

  const processBOM = async () => {
    if (bomItems.length === 0) return;

    setIsProcessing(true);
    const suppliers = getSuppliers();

    // Process items one by one with delay for demo effect
    for (let i = 0; i < bomItems.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const matches = matchSuppliers(bomItems[i], suppliers, { maxResults: 5 });
      
      setBomItems(prev => prev.map((item, index) => 
        index === i 
          ? { ...item, matches, processed: true }
          : item
      ));
    }

    setIsProcessing(false);
    toast({
      title: "Processing Complete",
      description: "All BOM items have been matched with suppliers."
    });
  };

  const downloadTemplate = () => {
    const template = `part_number,description,material,process,annual_volume,current_unit_price,current_supplier
AUTO-BRK-001,Automotive bracket,Al 6061,CNC milling,25000,12.50,Current Supplier A
HOUS-PLT-002,Housing plate,Steel S235,Laser cutting,15000,8.20,Current Supplier B
SEAL-RNG-003,Seal ring,EPDM,Injection molding,50000,2.15,Current Supplier C`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bom_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "BOM template has been downloaded to your device."
    });
  };

  const processedCount = bomItems.filter(item => item.processed).length;
  const progressPercentage = bomItems.length > 0 ? (processedCount / bomItems.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">BOM Import & Matching</h1>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Bill of Materials</CardTitle>
          <CardDescription>
            Upload a CSV file with your BOM to automatically find matching suppliers for each component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <Label htmlFor="bom-upload" className="text-lg font-medium cursor-pointer">
                Choose CSV file or drag and drop
              </Label>
              <Input
                id="bom-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full max-w-xs mx-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Expected columns: part_number, description, material, process, annual_volume, current_unit_price, current_supplier
            </p>
          </div>

          {bomItems.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {bomItems.length} items uploaded
              </span>
              <Button 
                onClick={processBOM} 
                disabled={isProcessing || processedCount === bomItems.length}
              >
                {isProcessing ? 'Processing...' : 'Find Suppliers'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing BOM items...</span>
                <span>{processedCount} / {bomItems.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {bomItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>BOM Processing Results</CardTitle>
            <CardDescription>
              Supplier matches for each component in your BOM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bomItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.part_number}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>Material: {item.material}</span>
                        <span>Process: {item.process}</span>
                        <span>Volume: {item.annual_volume.toLocaleString()}/year</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.processed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isProcessing ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {item.matches && item.matches.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Top Matches ({item.matches.length} found):
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.matches.slice(0, 3).map((match) => (
                          <div key={match.supplier.id} className="bg-muted/50 rounded p-3 text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{match.supplier.name}</span>
                              <Badge variant="secondary">
                                {match.switching_cost_score}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>{match.supplier.city}, {match.supplier.country}</div>
                              <div>
                                Savings: {(match.estimated_savings_rate * 100).toFixed(1)}%
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span>{match.audit_readiness}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/supplier/${match.supplier.id}`)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.processed && (!item.matches || item.matches.length === 0) && (
                    <div className="text-sm text-muted-foreground">
                      No suitable suppliers found for this component.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {processedCount > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{processedCount}</div>
              <div className="text-sm text-muted-foreground">Items Processed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {bomItems.filter(item => item.matches && item.matches.length > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Items with Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {bomItems.reduce((sum, item) => sum + (item.matches?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Suppliers Found</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {bomItems.filter(item => 
                  item.matches && item.matches.some(m => m.estimated_savings_rate > 0.1)
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">High-Savings Opportunities</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}