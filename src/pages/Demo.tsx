import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Globe, Shield, Clock, Search, Upload, GitCompare, TrendingUp } from 'lucide-react';

export default function Demo() {
  const navigate = useNavigate();

  const handleRunDemo = () => {
    navigate('/search?demo=true');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Strategic Supplier Intelligence
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI-powered supplier discovery, risk assessment, and sourcing optimization 
            for manufacturing excellence in the DACH region and beyond.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Trusted by 500+ manufacturers
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            €2M+ in cost savings
          </Badge>
        </div>
      </div>

      {/* Demo Section */}
      <Card className="max-w-2xl mx-auto border-primary/20 shadow-lg card-hover">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Search className="h-6 w-6 text-primary" />
            Experience Smart Sourcing
          </CardTitle>
          <CardDescription className="text-base">
            Try our AI-powered supplier matching with a sample automotive bracket component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border border-primary/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Part Number</div>
                <div className="font-medium">AUTO-BRK-001</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Material</div>
                <div className="font-medium">Al 6061</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Process</div>
                <div className="font-medium">CNC Milling</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Annual Volume</div>
                <div className="font-medium">25,000 units</div>
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleRunDemo}
            className="w-full h-12 text-base bg-primary hover:bg-primary/90"
          >
            <Search className="h-5 w-5 mr-2" />
            Run Demo Search
          </Button>
        </CardContent>
      </Card>

      {/* Value Propositions */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="card-hover border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              Risk Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Real-time supplier risk assessment with financial health monitoring, 
              compliance tracking, and geopolitical risk analysis across all supply tiers.
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              Cost Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              AI-driven cost modeling with should-cost analysis, market benchmarking, 
              and automated savings opportunity identification and tracking.
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--brand-orange) / 0.1)' }}>
                <Zap className="h-6 w-6" style={{ color: 'var(--brand-orange)' }} />
              </div>
              Smart Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Advanced supplier matching algorithms considering technical capabilities, 
              capacity, certifications, geographic proximity, and strategic alignment.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="text-center space-y-6 py-8">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" size="lg" onClick={() => navigate('/search')} className="gap-2">
            <Search className="h-4 w-4" />
            Search Suppliers
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/import')} className="gap-2">
            <Upload className="h-4 w-4" />
            Import BOM
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/compare')} className="gap-2">
            <GitCompare className="h-4 w-4" />
            Compare Suppliers
          </Button>
        </div>
      </div>
    </div>
  );
}