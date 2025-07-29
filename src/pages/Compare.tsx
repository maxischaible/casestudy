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

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <CompareFilters 
            suppliers={shortlist} 
            onFilteredSuppliersChange={setFilteredShortlist}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">

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
                          <th className="text-left p-4 font-medium">Metric</th>
                          {filteredShortlist.map((supplier) => (
                            <th key={supplier.id} className="text-left p-4 font-medium min-w-[200px]">
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
                          <td className="p-4 font-medium">Location</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              {supplier.city}, {supplier.country}
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-4 font-medium">Certifications</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {supplier.certifications.slice(0, 3).map((cert) => (
                                  <Badge key={cert.code} variant="secondary" className="text-xs">
                                    {cert.code}
                                  </Badge>
                                ))}
                                {supplier.certifications.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{supplier.certifications.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-4 font-medium">Lead Time</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              {supplier.lead_time_days} days
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-4 font-medium">MOQ</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              {supplier.moq.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-4 font-medium">Price Index</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              <Badge variant={supplier.price_index < 1.0 ? "default" : "secondary"}>
                                {supplier.price_index.toFixed(2)}x
                              </Badge>
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-4 font-medium">On-Time Rate</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              <div className="space-y-2">
                                <span className="text-sm">{(supplier.quality.on_time_rate * 100).toFixed(1)}%</span>
                                <Progress value={supplier.quality.on_time_rate * 100} className="h-2" />
                              </div>
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-4 font-medium">Defect Rate</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              {supplier.quality.defect_rate_ppm} PPM
                            </td>
                          ))}
                        </tr>
                        
                        <tr className="border-b">
                          <td className="p-4 font-medium">Capacity</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              {supplier.capacity.value.toLocaleString()} {supplier.capacity.unit}
                            </td>
                          ))}
                        </tr>
                        
                        <tr>
                          <td className="p-4 font-medium">Actions</td>
                          {filteredShortlist.map((supplier) => (
                            <td key={supplier.id} className="p-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/supplier/${supplier.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
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
              <div className="grid md:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}