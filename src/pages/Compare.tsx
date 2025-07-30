import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Download, Mail, X, Eye, Copy } from 'lucide-react';
import { getShortlist, removeFromShortlist } from '@/lib/storage';
import { exportShortlistPdf } from '@/lib/pdf';
import { buildRfiEml, downloadEmlFile, copyToClipboard } from '@/lib/rfi';
import { samplePartSpecs } from '@/data/seed';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { applyFilters } from '@/lib/filters';
import { CompareFilters } from '@/components/CompareFilters';
import ScoringPanel from '@/components/ScoringPanel';
import ScoringResults from '@/components/ScoringResults';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Supplier } from '@/types/domain';

export default function Compare() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { filters } = useFilters();
  const [shortlist, setShortlist] = useState(getShortlist());
  const [filteredShortlist, setFilteredShortlist] = useState<Supplier[]>(shortlist);

  // Apply filters to shortlist
  useEffect(() => {
    const filtered = applyFilters(shortlist, filters);
    setFilteredShortlist(filtered);
  }, [shortlist, filters]);

  const handleRemoveFromShortlist = (supplierId: string) => {
    removeFromShortlist(supplierId);
    setShortlist(getShortlist());
    toast({
      title: "Removed from Shortlist",
      description: "Supplier has been removed from comparison."
    });
  };

  const handleExportPDF = () => {
    if (filteredShortlist.length === 0) {
      toast({
        title: "No Suppliers",
        description: "Add suppliers to your shortlist first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Transform filtered shortlist to match the expected format for PDF export
      const items = filteredShortlist.map(supplier => ({
        supplierName: supplier.name,
        score: 75 + Math.floor(Math.random() * 20), // Mock score
        savingsPct: Math.random() * 25, // Mock savings percentage
        audit: 'Audit-ready',
        country: supplier.country,
        processes: supplier.processes,
        materials: supplier.materials
      }));

      const meta = {
        part: samplePartSpecs()[0]?.part_number || 'Demo Part',
        date: new Date().toLocaleDateString(),
        scope: 'DACH' // Could be made dynamic based on UI selection
      };

      exportShortlistPdf(items, meta);
      
      toast({
        title: "PDF Exported",
        description: "Shortlist comparison has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateRFI = () => {
    if (filteredShortlist.length === 0) {
      toast({
        title: "No Suppliers",
        description: "Add suppliers to your shortlist first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const demoPartSpec = samplePartSpecs()[0];
      
      const rfiData = buildRfiEml({
        buyer: 'Sarah Johnson',
        company: 'TACTO Manufacturing',
        part: demoPartSpec,
        candidates: filteredShortlist,
        rfqDeadlineISO: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Create buttons for download and copy actions
      const handleDownload = () => {
        downloadEmlFile(rfiData.filename, rfiData.content);
        toast({
          title: "RFI Downloaded",
          description: `${rfiData.filename} has been downloaded.`
        });
      };

      const handleCopy = async () => {
        try {
          await copyToClipboard(rfiData.copyText);
          toast({
            title: "RFI Copied",
            description: "RFI content has been copied to clipboard."
          });
        } catch (error) {
          toast({
            title: "Copy Failed",
            description: "Failed to copy to clipboard. Please try again.",
            variant: "destructive"
          });
        }
      };

      // Show action buttons
      setRfiActions({ handleDownload, handleCopy });
      
    } catch (error) {
      toast({
        title: "RFI Generation Failed",
        description: "Failed to generate RFI. Please try again.",
        variant: "destructive"
      });
    }
  };

  const [rfiActions, setRfiActions] = useState<{
    handleDownload: () => void;
    handleCopy: () => void;
  } | null>(null);

  // Scoring state
  const [scoredSuppliers, setScoredSuppliers] = useState<Array<{
    supplier: Supplier;
    totalScore: number;
    breakdown: Record<string, number>;
  }>>([]);

  if (shortlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Compare Suppliers</h1>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Your shortlist is empty. Add suppliers from the search results to compare them.
            </p>
            <Button onClick={() => navigate('/search')}>
              Search Suppliers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compare Suppliers</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleGenerateRFI}>
            <Mail className="h-4 w-4 mr-2" />
            Create RFI Draft
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[800px]">
        {/* Filters Sidebar */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="space-y-4 pr-4">
            <CompareFilters 
              suppliers={shortlist} 
              onFilteredSuppliersChange={setFilteredShortlist}
            />
            
            {/* Scoring Panel */}
            <ScoringPanel 
              suppliers={filteredShortlist}
              onScoreUpdate={setScoredSuppliers}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content */}
        <ResizablePanel defaultSize={70} minSize={60}>
          <div className="space-y-4 lg:space-y-6 pl-4 overflow-hidden">

          {/* RFI Action Buttons */}
          {rfiActions && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">RFI Draft Ready</h3>
                    <p className="text-sm text-muted-foreground">Choose how to use your generated RFI</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={rfiActions.handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download .eml
                    </Button>
                    <Button onClick={rfiActions.handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button variant="ghost" onClick={() => setRfiActions(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredShortlist.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No suppliers match the current filters.
                </p>
                <Button variant="outline" onClick={() => navigate('/search')}>
                  Search More Suppliers
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {/* Scoring Results */}
              <ScoringResults scoredSuppliers={scoredSuppliers} />
              
              {/* Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Comparison</CardTitle>
                  <CardDescription>
                    Side-by-side comparison of {filteredShortlist.length} selected suppliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-sm">Metric</th>
                           {filteredShortlist.map((supplier) => (
                             <th key={supplier.id} className="text-left p-3 font-medium min-w-[160px] max-w-[200px]">
                              <div className="flex items-center justify-between">
                                {supplier.name}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFromShortlist(supplier.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">Location</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3 text-sm">
                              <div className="truncate">{supplier.city}, {supplier.country}</div>
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">Certifications</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {supplier.certifications.slice(0, 2).map((cert) => (
                                  <Badge key={cert.code} variant="secondary" className="text-xs">
                                    {cert.code}
                                  </Badge>
                                ))}
                                {supplier.certifications.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{supplier.certifications.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">Lead Time</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3 text-sm">
                              {supplier.lead_time_days} days
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">MOQ</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3 text-sm">
                              {supplier.moq.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">Price Index</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3">
                              <Badge variant={supplier.price_index < 1.0 ? "default" : "secondary"} className="text-xs">
                                {supplier.price_index.toFixed(2)}x
                              </Badge>
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">On-Time Rate</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3">
                              <div className="space-y-1">
                                <span className="text-xs">{(supplier.quality.on_time_rate * 100).toFixed(1)}%</span>
                                <Progress value={supplier.quality.on_time_rate * 100} className="h-1" />
                              </div>
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">Defect Rate</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3 text-sm">
                              {supplier.quality.defect_rate_ppm.toFixed(2)} PPM
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-3 font-medium text-sm">Capacity</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3 text-sm">
                              <div className="truncate">{supplier.capacity.value.toLocaleString()} {supplier.capacity.unit}</div>
                            </td>
                          ))}
                        </tr>
                        
                        <tr>
                          <td className="p-3 font-medium text-sm">Actions</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/supplier/${supplier.id}`)}
                                className="text-xs px-2 py-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Best Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const best = filteredShortlist.reduce((prev, current) => 
                        (prev.price_index < current.price_index) ? prev : current
                      );
                      return (
                        <div>
                          <p className="font-medium">{best.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {best.price_index.toFixed(2)}x price index
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fastest Delivery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const fastest = filteredShortlist.reduce((prev, current) => 
                        (prev.lead_time_days < current.lead_time_days) ? prev : current
                      );
                      return (
                        <div>
                          <p className="font-medium">{fastest.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {fastest.lead_time_days} days lead time
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Best Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const bestQuality = filteredShortlist.reduce((prev, current) => 
                        (prev.quality.on_time_rate > current.quality.on_time_rate) ? prev : current
                      );
                      return (
                        <div>
                          <p className="font-medium">{bestQuality.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(bestQuality.quality.on_time_rate * 100).toFixed(1)}% on-time rate
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}