import { Mail, PlayCircle } from 'lucide-react';
import { useSchemeStore } from '../store/useSchemeStore';
import { trackAnalytics } from '../utils/urlState';

export const CTASection = () => {
  const { filters, selectedSchemeId } = useSchemeStore();

  const handleCTAClick = (action: 'contact' | 'test') => {
    trackAnalytics(action === 'contact' ? 'cta_contact_clicked' : 'cta_test_clicked', {
      filters,
      scheme_id: selectedSchemeId,
      location: 'footer'
    });
  };

  return (
    <div className="bg-brand-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Navigate Emissions Regulations?
          </h2>
          <p className="text-lg text-brand-accent mb-8">
            Get expert guidance on compliance, optimize your routes, and stay ahead of evolving regulations worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleCTAClick('contact')}
              className="px-6 py-3 bg-white text-brand-primary rounded-md hover:bg-brand-light transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Mail className="w-5 h-5" />
              Contact us
            </button>
            <button
              onClick={() => handleCTAClick('test')}
              className="px-6 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-brand-primary transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <PlayCircle className="w-5 h-5" />
              Start test period
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
