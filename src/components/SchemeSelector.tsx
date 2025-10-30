import { EmissionScheme } from '../types/scheme';
import { X } from 'lucide-react';

interface SchemeSelectorProps {
  schemes: EmissionScheme[];
  position: { x: number; y: number };
  onSelect: (schemeId: string) => void;
  onClose: () => void;
}

export const SchemeSelector = ({ schemes, position, onSelect, onClose }: SchemeSelectorProps) => {
  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-neutral-border min-w-64 max-w-sm"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-12px)'
      }}
    >
      <div className="flex items-center justify-between p-3 border-b border-neutral-border">
        <h3 className="font-semibold text-sm text-text-primary">
          {schemes.length} scheme{schemes.length !== 1 ? 's' : ''} apply here
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-hover rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {schemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => {
              onSelect(scheme.id);
              onClose();
            }}
            className="w-full text-left p-3 hover:bg-neutral-hover transition-colors border-b border-neutral-border last:border-b-0"
          >
            <div className="flex items-start gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                style={{
                  backgroundColor:
                    scheme.scope_status === 'Active'
                      ? '#0E9F6E'
                      : scheme.scope_status === 'Upcoming'
                      ? '#D97706'
                      : '#F59E0B'
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-text-primary">
                  {scheme.regulation_name}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {scheme.scope_status} • {scheme.scope_region}
                  {scheme.mode === 'area' ? ' (Regional)' : ' (Port)'}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
      </div>
    </div>
  );
};
