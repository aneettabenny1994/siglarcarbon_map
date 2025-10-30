import { create } from 'zustand';
import { EmissionScheme, FilterState, SortField } from '../types/scheme';
import { schemeService } from '../services/schemeService';

interface SchemeStore {
  schemes: EmissionScheme[];
  selectedSchemeId: string | null;
  sidebarView: 'list' | 'details';
  filters: FilterState;
  sortField: SortField;
  loading: boolean;
  error: string | null;

  setSchemes: (schemes: EmissionScheme[]) => void;
  loadSchemes: () => Promise<void>;
  selectScheme: (id: string | null) => void;
  setSidebarView: (view: 'list' | 'details') => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setSortField: (field: SortField) => void;
  subscribeToChanges: () => () => void;
}

const initialFilters: FilterState = {
  activeFrom: null,
  status: null,
  regions: [],
  route: null,
};

export const useSchemeStore = create<SchemeStore>((set, get) => ({
  schemes: [],
  selectedSchemeId: null,
  sidebarView: 'list',
  filters: initialFilters,
  sortField: 'scope_level',
  loading: false,
  error: null,

  setSchemes: (schemes) => set({ schemes }),

  loadSchemes: async () => {
    set({ loading: true, error: null });
    try {
      const schemes = await schemeService.getAllSchemes();
      console.log('Store: Loaded schemes from Supabase:', schemes.length, schemes);
      set({ schemes, loading: false });
    } catch (error) {
      console.error('Failed to load schemes:', error);
      set({
        error: 'Failed to load schemes from database',
        loading: false
      });
    }
  },

  selectScheme: (id) => set({
    selectedSchemeId: id,
    sidebarView: id ? 'details' : 'list'
  }),

  setSidebarView: (view) => set({ sidebarView: view }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  clearFilters: () => set({ filters: initialFilters }),

  setSortField: (field) => set({ sortField: field }),

  subscribeToChanges: () => {
    return schemeService.subscribeToSchemes((schemes) => {
      set({ schemes });
    });
  },
}));
