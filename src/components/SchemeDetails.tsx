import { ExternalLink } from 'lucide-react';
import { EmissionScheme } from '../types/scheme';
import { trackAnalytics } from '../utils/urlState';

interface SchemeDetailsProps {
  scheme: EmissionScheme;
}

export const SchemeDetails = ({ scheme }: SchemeDetailsProps) => {
  const statusColors = {
    'Active': 'bg-green-50 text-status-active',
    'Upcoming': 'bg-orange-50 text-status-upcoming',
    'Under discussion': 'bg-yellow-50 text-status-discussion'
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-8 min-h-0">
        <section>
          <div className="space-y-6">

            {scheme.scope_description && (
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Description</h3>
                <p className="text-text-secondary">{scheme.scope_description}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Area</h3>
              <p className="text-text-secondary">{scheme.area}</p>
            </div>

            <div>
              <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Start Year</h3>
              <p className="text-text-secondary">{scheme.scope_valid_from}</p>
            </div>

            {scheme.cost_implications && (
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Cost Implications</h3>
                <p className="text-text-secondary">{scheme.cost_implications}</p>
              </div>
            )}

            {scheme.cap && (
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Cap</h3>
                <p className="text-text-secondary">{scheme.cap}</p>
              </div>
            )}


            {scheme.coverage?.scope && (
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Scope</h3>
                <p className="text-text-secondary">{scheme.coverage.scope}</p>
              </div>
            )}
          </div>
        </section>

        {scheme.exemption && (
          <section>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Exemptions</h3>
                <p className="text-text-secondary">{scheme.exemption}</p>
              </div>
            </div>
          </section>
        )}

        {scheme.costs?.notes && (
          <section>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary mb-2">Notes</h3>
                <p className="text-text-secondary">{scheme.costs.notes}</p>
              </div>
            </div>
          </section>
        )}

        {scheme.regulation_link && (
          <section>
            <div className="space-y-4">
              <a
                href={scheme.regulation_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-4 border border-neutral-border rounded-md hover:border-brand-primary hover:bg-brand-light transition-colors"
                onClick={() => trackAnalytics('external_link_clicked', { url: scheme.regulation_link, scheme_id: scheme.id })}
              >
                <ExternalLink className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-text-primary">Read related article</p>
                  <p className="text-sm text-text-secondary">Learn more about this regulation</p>
                </div>
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
