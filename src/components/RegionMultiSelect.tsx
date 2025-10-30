import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Region } from '../types/scheme';

interface RegionMultiSelectProps {
  selected: Region[];
  onChange: (regions: Region[]) => void;
}

const REGIONS: Region[] = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Middle East', 'Oceania', 'Global'];

export const RegionMultiSelect = ({ selected, onChange }: RegionMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRegion = (region: Region) => {
    if (selected.includes(region)) {
      onChange(selected.filter(r => r !== region));
    } else {
      onChange([...selected, region]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectAll = () => {
    onChange([...REGIONS]);
  };

  const getButtonText = () => {
    if (selected.length === 0) return 'Continents';
    if (selected.length === 1) return selected[0];
    return `${selected.length} regions`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 border border-neutral-border rounded-md text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-text-primary flex items-center gap-2 min-w-[140px] justify-between hover:bg-neutral-hover transition-colors"
      >
        <span className={selected.length === 0 ? 'text-text-secondary' : ''}>
          {getButtonText()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {selected.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-10">
          {selected.length}
        </span>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-border rounded-md shadow-lg z-50 min-w-[200px] max-h-[320px] overflow-y-auto">
          <div className="p-2 border-b border-neutral-border flex gap-2">
            <button
              onClick={selectAll}
              className="flex-1 px-2 py-1 text-xs text-brand-primary hover:bg-brand-light rounded transition-colors"
            >
              Select all
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-2 py-1 text-xs text-text-secondary hover:bg-neutral-hover rounded transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="py-1">
            {REGIONS.map(region => (
              <label
                key={region}
                className="flex items-center px-3 py-2 hover:bg-neutral-hover cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(region)}
                  onChange={() => toggleRegion(region)}
                  className="w-4 h-4 text-brand-primary border-neutral-border rounded focus:ring-2 focus:ring-brand-primary"
                />
                <span className="ml-2 text-sm text-text-primary">{region}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
