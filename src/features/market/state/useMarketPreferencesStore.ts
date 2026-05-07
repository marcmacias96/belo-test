import { create } from 'zustand';

import type { MarketSortValue } from '../types';

type MarketPreferencesState = {
  searchQuery: string;
  sortValue: MarketSortValue;
  favoritesOnly: boolean;
  favoriteAssetIds: Record<string, true>;
  setSearchQuery: (value: string) => void;
  setSortValue: (value: MarketSortValue) => void;
  toggleFavoritesOnly: () => void;
  toggleFavoriteAsset: (assetId: string) => void;
  clearFavorites: () => void;
  reset: () => void;
};

const INITIAL_STATE = {
  searchQuery: '',
  sortValue: 'price-desc' as MarketSortValue,
  favoritesOnly: false,
  favoriteAssetIds: {} as Record<string, true>,
};

export const useMarketPreferencesStore = create<MarketPreferencesState>((set) => ({
  ...INITIAL_STATE,
  setSearchQuery: (value) => {
    set({ searchQuery: value });
  },
  setSortValue: (value) => {
    set({ sortValue: value });
  },
  toggleFavoritesOnly: () => {
    set((current) => ({ favoritesOnly: !current.favoritesOnly }));
  },
  toggleFavoriteAsset: (assetId) => {
    set((current) => {
      const favoriteAssetIds = { ...current.favoriteAssetIds };
      if (favoriteAssetIds[assetId]) {
        delete favoriteAssetIds[assetId];
      } else {
        favoriteAssetIds[assetId] = true;
      }
      return { favoriteAssetIds };
    });
  },
  clearFavorites: () => {
    set({ favoriteAssetIds: {} });
  },
  reset: () => {
    set(INITIAL_STATE);
  },
}));

export function resetMarketPreferencesStore() {
  useMarketPreferencesStore.getState().reset();
}
