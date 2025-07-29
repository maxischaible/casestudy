import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap, Globe, Shield, Clock } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const handleRunDemo = () => {
    // Navigate to search with pre-filled demo data
    navigate('/search?demo=true');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Intelligent Supplier Sourcing
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Leverage AI-powered matching to find the optimal European suppliers for your manufacturing needs. 
          Reduce costs, improve quality, and accelerate time-to-market.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleRunDemo} size="lg" className="gap-2">
            <Zap className="h-4 w-4" />
            Run the Demo
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Why Now Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Why Supplier Diversification Matters Now
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Supply Chain Resilience</h3>
            <p className="text-muted-foreground">
              Geopolitical tensions and pandemic disruptions have exposed the risks of single-supplier dependency. 
              Modern manufacturers need diverse, qualified supplier networks to ensure continuity.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Cost Optimization</h3>
            <p className="text-muted-foreground">
              European suppliers often offer 10-25% cost advantages while maintaining quality standards. 
              Our platform identifies these opportunities automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Quality Assured</CardTitle>
            <CardDescription>
              All suppliers pre-qualified with ISO 9001, IATF 16949, and other industry certifications
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Globe className="h-8 w-8 text-primary mb-2" />
            <CardTitle>EU-27 Network</CardTitle>
            <CardDescription>
              300+ verified suppliers across European manufacturing hubs with proven automotive experience
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle>AI-Powered Matching</CardTitle>
            <CardDescription>
              Intelligent algorithms match your specifications with optimal suppliers based on capability, cost, and risk
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Demo CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Experience the Platform</CardTitle>
          <CardDescription>
            Try our demo scenario: source an automotive aluminum bracket from European CNC suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background rounded-lg p-4 mb-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Demo Part:</span> Automotive bracket (AUTO-BRK-001)
              </div>
              <div>
                <span className="font-medium">Material:</span> Al 6061
              </div>
              <div>
                <span className="font-medium">Process:</span> CNC milling
              </div>
              <div>
                <span className="font-medium">Volume:</span> 25,000 units/year
              </div>
            </div>
          </div>
          <Button onClick={handleRunDemo} className="gap-2">
            Start Demo Sourcing
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Process Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
              1
            </div>
            <h3 className="font-medium">Specify Requirements</h3>
            <p className="text-sm text-muted-foreground">
              Upload part specs or BOM
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
              2
            </div>
            <h3 className="font-medium">AI Matching</h3>
            <p className="text-sm text-muted-foreground">
              Algorithm scores suppliers
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
              3
            </div>
            <h3 className="font-medium">Compare & Shortlist</h3>
            <p className="text-sm text-muted-foreground">
              Review top candidates
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
              4
            </div>
            <h3 className="font-medium">Export & Engage</h3>
            <p className="text-sm text-muted-foreground">
              Generate RFI emails
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}