import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  GitCompare, 
  Upload, 
  Settings, 
  Bot,
  MessageSquare,
  Award,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Lightbulb
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
  { name: 'Supplier Discovery', href: '/search', icon: Search },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  //{ name: 'Import BOM', href: '/import', icon: Upload },
  //{ name: 'Admin', href: '/admin', icon: Settings },
];


function SourcingCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const getContextualSuggestions = () => {
    const currentPath = location.pathname;
    
    if (currentPath === '/items') {
      return {
        title: "Items Insights & Recommendations",
        suggestions: [
          {
            type: "risk",
            icon: AlertTriangle,
            title: "Supply Risk Detected",
            description: "Items ALU-2024-001, STL-2024-007, and CNC-2024-012 are at risk due to supplier financial instability",
            action: "Review Supplier Status",
            actionLink: "/suppliers",
            priority: "high"
          },
          {
            type: "cost",
            icon: TrendingUp,
            title: "Cost Optimization Opportunity", 
            description: "Item PLT-2024-004 is 18% more expensive than market rate. Alternative suppliers available",
            action: "Find Alternatives",
            actionLink: "/search?part=PLT-2024-004",
            priority: "medium"
          },
          {
            type: "discovery",
            icon: Search,
            title: "Supplier Discovery Recommended",
            description: "3 critical items lack backup suppliers. Initiate discovery for supply chain resilience",
            action: "Start Discovery",
            actionLink: "/search",
            priority: "medium"
          },
          {
            type: "compliance",
            icon: CheckCircle,
            title: "Certification Expiry Alert",
            description: "ISO 9001 certificates expiring for 2 suppliers affecting 5 active items",
            action: "View Affected Items",
            actionLink: "/suppliers?filter=cert-expiry",
            priority: "high"
          }
        ]
      };
    } else if (currentPath === '/suppliers') {
      return {
        title: "Supplier Portfolio Insights",
        suggestions: [
          {
            type: "risk",
            icon: AlertTriangle,
            title: "High-Risk Suppliers Identified",
            description: "2 suppliers showing financial stress indicators. Backup sourcing recommended",
            action: "View Risk Details",
            actionLink: "/suppliers?risk=high",
            priority: "high"
          },
          {
            type: "performance",
            icon: TrendingUp,
            title: "Performance Opportunities",
            description: "3 suppliers with declining quality scores. Consider alternative sourcing",
            action: "Find Alternatives",
            actionLink: "/search",
            priority: "medium"
          }
        ]
      };
    } else if (currentPath === '/search') {
      return {
        title: "Discovery Assistance",
        suggestions: [
          {
            type: "matching",
            icon: Bot,
            title: "AI-Powered Matching",
            description: "Our matching algorithm analyzes 50+ supplier criteria for optimal recommendations",
            action: "Learn More",
            actionLink: "#",
            priority: "low"
          }
        ]
      };
    }
    
    // Default generic suggestions
    return {
      title: "Sourcing Intelligence",
      suggestions: [
        {
          type: "general",
          icon: Award,
          title: "Platform Overview",
          description: "Explore supplier discovery, risk management, and cost optimization features",
          action: "Get Started",
          actionLink: "/items",
          priority: "low"
        }
      ]
    };
  };

  const contextData = getContextualSuggestions();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-muted/50 border-border';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 relative"
        >
          <Bot className="h-4 w-4" />
          Sourcing Copilot
          {contextData.suggestions.some(s => s.priority === 'high') && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Sourcing Copilot</h2>
            <Badge variant="secondary" className="text-xs">AI BETA</Badge>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                {contextData.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on your current view and data analysis
              </p>
            </div>

            <div className="space-y-3">
              {contextData.suggestions.map((suggestion, index) => {
                const IconComponent = suggestion.icon;
                return (
                  <div key={index} className={`rounded-lg p-4 border ${getPriorityBg(suggestion.priority)}`}>
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${getPriorityColor(suggestion.priority)}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                          {suggestion.description}
                        </p>
                        <Button
                          size="sm"
                          variant={suggestion.priority === 'high' ? 'default' : 'outline'}
                          className="text-xs h-7"
                          onClick={() => {
                            // Navigate to the suggested action
                            if (suggestion.actionLink.startsWith('/')) {
                              window.location.href = suggestion.actionLink;
                            }
                          }}
                        >
                          {suggestion.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="border-t pt-4 mt-6 space-y-2">
              <Button variant="outline" className="w-full gap-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                Ask Copilot
              </Button>
              <Button variant="ghost" className="w-full gap-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                Customize Insights
              </Button>
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
    <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
      <AppShellContent shortlist={shortlist} setOpen={setOpen}>
        {children}
      </AppShellContent>
    </div>
    </SidebarProvider>
  );
}

function AppShellContent({ children, shortlist, setOpen }: { children: React.ReactNode; shortlist: any[]; setOpen: (open: boolean) => void }) {
  const { state } = useSidebar();
  
  return (
    <>
      {/* Sidebar */}
      <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
        <SidebarContent className="p-4">
          <div className={`mb-8 p-2 ${state === "collapsed" ? "flex justify-center" : "flex items-center justify-between"}`}>
            <button 
              onClick={() => setOpen(true)}
              className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-1 transition-colors flex-1"
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 40.36 42" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M30.2956 20.5448C24.8485 20.5448 20.4326 16.129 20.4326 10.6819V1.07116C20.4326 0.931839 20.3197 0.818901 20.1804 0.818901C20.0411 0.818901 19.9281 0.931839 19.9281 1.07116V10.6819C19.9281 16.129 15.5123 20.5448 10.0652 20.5448H0.252255C0.112938 20.5448 1.21798e-08 20.6578 0 20.7971C-1.21798e-08 20.9364 0.112938 21.0493 0.252254 21.0493H9.96407C15.4671 21.0493 19.9281 25.5104 19.9281 31.0134V40.9274C19.9281 41.0667 20.0411 41.1797 20.1804 41.1797C20.3197 41.1797 20.4326 41.0667 20.4326 40.9274V31.0134C20.4326 25.5104 24.8937 21.0493 30.3967 21.0493L40.1085 21.0493C40.2478 21.0493 40.3608 20.9364 40.3608 20.7971C40.3608 20.6578 40.2478 20.5448 40.1085 20.5448L30.2956 20.5448Z" 
                    fill="#FF6414"
                  />
                </svg>
              </div>
              {state !== "collapsed" && (
                <div className="text-left">
                  <div className="text-lg font-bold text-primary">tacto</div>
                  <div className="text-xs text-muted-foreground">Sourcing Platform</div>
                </div>
              )}
            </button>
            {state !== "collapsed" && (
              <SidebarTrigger className="hover:bg-muted rounded-md p-2 flex-shrink-0" />
            )}
          </div>
          
          {state !== "collapsed" && (
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
                    <span className="flex-1">{item.name}</span>
                    {item.name === 'Compare' && shortlist.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {shortlist.length}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          )}
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center justify-end h-full px-4 sm:px-6">
            
            <div className="flex items-center gap-4">
              <SourcingCopilot />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-muted/20">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}