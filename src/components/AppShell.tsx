import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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
  Users
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
  { name: 'Search & Match', href: '/search', icon: Search },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Import BOM', href: '/import', icon: Upload },
  { name: 'Admin', href: '/admin', icon: Settings },
];


function SourcingCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  
  const getTopReasons = () => {
    return [
      "Strong material capabilities in aluminum alloys with automotive-grade certifications",
      "Competitive pricing structure with 15% savings potential vs current supplier base", 
      "Geographic proximity ensures reduced logistics costs and faster delivery times"
    ];
  };

  const getSuggestedRFI = () => {
    return "Subject: RFI - Automotive Aluminum Bracket Manufacturing\n\nDear Supplier,\n\nWe are seeking quotations for precision CNC machined aluminum brackets (Al 6061) for automotive applications. Annual volume: 25,000 units. Requirements include IATF 16949 certification, dimensional tolerances per drawing, and delivery to German facility. Please provide: unit pricing, tooling costs, lead times, quality documentation, and production capacity details.\n\nLook forward to your response.";
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