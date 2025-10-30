import { Ship, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const SiteShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background-page">
      <header className="bg-white border-b border-neutral-border sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Ship className="w-8 h-8 text-brand-primary" />
              <span className="ml-2 text-xl font-heading font-bold text-text-primary">SiglarCarbon</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-text-secondary hover:text-brand-primary transition-colors">Platform</a>
              <a href="#" className="text-text-secondary hover:text-brand-primary transition-colors">Regulations</a>
              <a href="#" className="text-text-secondary hover:text-brand-primary transition-colors">Resources</a>
              <a href="#" className="text-text-secondary hover:text-brand-primary transition-colors">About</a>
              <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors">
                Start Free Trial
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <a href="#" className="block py-2 text-text-secondary hover:text-brand-primary">Platform</a>
              <a href="#" className="block py-2 text-text-secondary hover:text-brand-primary">Regulations</a>
              <a href="#" className="block py-2 text-text-secondary hover:text-brand-primary">Resources</a>
              <a href="#" className="block py-2 text-text-secondary hover:text-brand-primary">About</a>
              <button className="w-full mt-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark">
                Start Free Trial
              </button>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-brand-primary-dark text-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Ship className="w-6 h-6 text-brand-accent" />
                <span className="ml-2 text-lg font-heading font-bold text-white">SiglarCarbon</span>
              </div>
              <p className="text-sm text-brand-accent">
                Navigate shipping emissions regulations with confidence.
              </p>
            </div>

            <div>
              <h3 className="font-heading font-bold text-white mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-brand-accent">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-brand-accent">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-brand-accent">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-primary mt-8 pt-8 text-sm text-center text-brand-accent">
            © 2025 SiglarCarbon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
