import { useEffect, useRef } from 'react';
import { EmissionScheme } from '../types/scheme';
import { X } from 'lucide-react';

interface SchemeTooltipProps {
  schemes: EmissionScheme[];
  position: { x: number; y: number };
  onViewDetails: (schemeId: string) => void;
  onClose: () => void;
}

const statusColors = {
  'Active': 'bg-green-50 text-status-active',
  'Upcoming': 'bg-orange-50 text-status-upcoming',
  'Under discussion': 'bg-yellow-50 text-status-discussion'
};

export const SchemeTooltip = ({ schemes, position, onViewDetails, onClose }: SchemeTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('SchemeTooltip: Received schemes:', schemes);
    console.log('SchemeTooltip: Position:', position);
  }, [schemes, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!schemes || schemes.length === 0) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-neutral-border min-w-64 max-w-sm"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-12px)'
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 p-1 hover:bg-neutral-hover rounded transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-text-secondary" />
      </button>

      <div className="max-h-80 overflow-y-auto">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="p-4 pr-8 border-b border-neutral-border last:border-b-0"
          >
            <div className="mb-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-base text-text-primary flex-1">
                  {scheme.regulation_name}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[scheme.scope_status]}`}>
                  {scheme.scope_status}
                </span>
              </div>
              {scheme.scope_description && (
                <div className="text-sm text-text-secondary">
                  {scheme.scope_description}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                onViewDetails(scheme.id);
                onClose();
              }}
              className="w-full px-3 py-2 bg-brand-primary text-white text-sm rounded-md hover:bg-brand-primary-dark transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
      </div>
    </div>
  );
};
