import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Search, 
  Users, 
  GitCompare, 
  Upload, 
  Settings, 
  Home,
  Menu,
  X,
  Filter,
  MessageSquare
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
  
  const getMockExplanation = () => {
    if (location.pathname === '/search') {
      return [
        "Found 47 suppliers matching your aluminum CNC requirements",
        "Top matches have IATF16949 certification for automotive applications", 
        "EU-based suppliers prioritized for logistics efficiency",
        "Price estimates show 12-18% potential savings vs current supplier"
      ];
    }
    return [
      "Ready to assist with supplier sourcing",
      "Upload part specifications to get started",
      "Access 300+ pre-qualified European suppliers"
    ];
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed right-4 top-4 z-50 shadow-lg"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Sourcing Copilot
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Sourcing Copilot</h2>
            <Badge variant="secondary" className="text-xs">BETA</Badge>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">AI Insights</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {getMockExplanation().map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Suggested Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Generate RFI Email
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Export Comparison
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Schedule Audit
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Agent Plan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Supplier identification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">RFI generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-muted-foreground">NDA coordination</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-muted-foreground">Sample request</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Autopilot Mode</span>
                  <Badge variant="outline" className="text-xs">ALPHA</Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Future AI agent will automate outreach, NDA, and audit scheduling
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
  
  return (
    <SidebarProvider>
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
          <div className="flex items-center gap-3 mb-8">
            {state !== "collapsed" && (
              <div className="text-xl font-bold text-primary">TACTO</div>
            )}
          </div>
          
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {state !== "collapsed" && (
                    <>
                      {item.name}
                      {item.name === 'Compare' && shortlist.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">
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
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Quick Filters
              </h3>
              <div className="space-y-2 text-sm">
                <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
                  EU-27 Only
                </button>
                <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
                  IATF16949 Certified
                </button>
                <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
                  CNC Machining
                </button>
                <button className="w-full text-left px-2 py-1 rounded hover:bg-muted">
                  Aluminum Specialists
                </button>
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
              <SidebarTrigger />
              <div className="font-semibold text-foreground">
                Supplier Sourcing Platform
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline">EU-27 Scope</Badge>
              <SourcingCopilot />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </>
  );
}