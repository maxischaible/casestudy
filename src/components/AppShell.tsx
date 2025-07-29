import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  GitCompare, 
  Upload, 
  Settings, 
  Home,
  Bot,
  Filter,
  MessageSquare,
  Globe,
  Award,
  Cog,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { getShortlist } from '@/lib/storage';

interface AppShellProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Search & Match', href: '/search', icon: Search },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'BOM Import', href: '/import', icon: Upload },
  { name: 'Admin', href: '/admin', icon: Settings },
];

function SourcingCopilot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const getTopReasons = () => {
    if (location.pathname === '/search') {
      return [
        "Strong material capabilities in aluminum alloys with automotive-grade certifications",
        "Competitive pricing structure with 15% savings potential vs current supplier base",
        "Geographic proximity ensures reduced logistics costs and faster delivery times"
      ];
    }
    return [
      "Access to 300+ pre-qualified European suppliers across manufacturing categories",
      "AI-powered matching considers technical fit, capacity, certifications, and cost optimization",
      "Automated risk assessment includes financial health, compliance status, and supply chain resilience"
    ];
  };

  const getSuggestedRFI = () => {
    if (location.pathname === '/search') {
      return "Subject: RFI - Automotive Aluminum Bracket Manufacturing\n\nDear Supplier,\n\nWe are seeking quotations for precision CNC machined aluminum brackets (Al 6061) for automotive applications. Annual volume: 25,000 units. Requirements include IATF 16949 certification, dimensional tolerances per drawing, and delivery to German facility. Please provide: unit pricing, tooling costs, lead times, quality documentation, and production capacity details.\n\nLook forward to your response.";
    }
    return "Ready to generate customized RFI templates based on your part specifications and supplier selection.";
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Bot className="h-4 w-4" />
          Sourcing Copilot
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Sourcing Copilot</h2>
            <Badge variant="secondary" className="text-xs">AI BETA</Badge>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Top 3 Reasons for These Matches
              </h3>
              <ul className="space-y-3 text-sm">
                {getTopReasons().map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Suggested RFI Paragraph
              </h3>
              <div className="bg-background border rounded-lg p-3 text-sm text-muted-foreground leading-relaxed">
                {getSuggestedRFI()}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Copy RFI Text
              </Button>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Agent Plan (Future)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Auto-generate RFI templates based on part specs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-muted-foreground">Schedule supplier capability assessments</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-muted-foreground">Monitor market pricing trends and alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-muted-foreground">Automated compliance checking and updates</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary">Autonomous Agent Mode</span>
                  <Badge variant="outline" className="text-xs border-primary text-primary">ALPHA</Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Future AI agent will autonomously execute sourcing workflows, coordinate NDAs, and manage supplier communications
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const shortlist = getShortlist();
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem('tacto_sidebar_open');
    return stored ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem('tacto_sidebar_open', JSON.stringify(open));
  }, [open]);
  
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
    <div className="min-h-screen flex w-full bg-background">
      <AppShellContent shortlist={shortlist}>
        {children}
      </AppShellContent>
    </div>
    </SidebarProvider>
  );
}

function AppShellContent({ children, shortlist }: { children: React.ReactNode; shortlist: any[] }) {
  const { state } = useSidebar();
  
  return (
    <>
      {/* Sidebar */}
      <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
        <SidebarContent className="p-4">
          <div className="flex items-center gap-3 mb-8 p-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            {state !== "collapsed" && (
              <div>
                <div className="text-lg font-bold text-primary">TACTO</div>
                <div className="text-xs text-muted-foreground">Sourcing Platform</div>
              </div>
            )}
          </div>
          
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all sidebar-transition ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {state !== "collapsed" && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.name === 'Compare' && shortlist.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {shortlist.length}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
          
          {state !== "collapsed" && (
            <div className="mt-8 p-4 bg-gradient-to-br from-muted/40 to-muted/60 rounded-lg border">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                Quick Filters
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Region Scope
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="default" className="text-xs bg-primary">DACH</Badge>
                    <Badge variant="outline" className="text-xs">EU-27</Badge>
                    <Badge variant="outline" className="text-xs">Global</Badge>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Certifications
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">ISO 9001</Badge>
                    <Badge variant="outline" className="text-xs">IATF 16949</Badge>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Cog className="h-3 w-3" />
                    Processes
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">CNC</Badge>
                    <Badge variant="outline" className="text-xs">Molding</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-md p-2" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">TACTO Sourcing Platform</div>
                    <div className="text-xs text-muted-foreground">Strategic Supplier Intelligence</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs border-primary text-primary ml-2">DACH Scope</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <SourcingCopilot />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-muted/20">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}