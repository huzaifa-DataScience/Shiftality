// src/contexts/JournalContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  getJournals,
  createJournalEntry,
  ApiJournalEntry,
  deleteJournalEntry,
} from '../lib/authService';

export type JournalEntry = {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string; // ISO
};

type JournalContextType = {
  journalEntries: JournalEntry[];
  addJournal: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  refreshJournals: () => Promise<void>;
  selectedFilterDate: string | null; // ISO date string (YYYY-MM-DD) for filtering
  setSelectedFilterDate: (date: string | null) => void;
  clearSelectedFilterDate: () => void;
};

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(
    null,
  );

  // Map API journal shape → UI journal shape
  const mapApiToJournal = useCallback((j: ApiJournalEntry): JournalEntry => {
    const created = j.created_at || `${j.entry_date}T00:00:00.000Z`;
    const time = created.slice(11, 16); // HH:mm

    return {
      id: j.id,
      title: j.tags && j.tags.length > 0 ? j.tags[0] : 'Journal',
      description: j.content ?? '',
      date: j.entry_date,
      time,
      createdAt: created,
    };
  }, []);

  // Load journals from API
  const loadJournals = useCallback(async () => {
    try {
      const apiJournals = await getJournals();
      const mapped = apiJournals.map(mapApiToJournal);
      // newest first
      mapped.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setJournalEntries(mapped);
    } catch (e) {
      console.log('JournalContext: error loading journals', e);
    }
  }, [mapApiToJournal]);

  // Load on mount
  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  // Add a new journal entry via API
  const addJournal = useCallback(
    async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
      // Call Supabase function
      await createJournalEntry({
        content: entry.description,
        entry_date: entry.date, // YYYY-MM-DD
        tags: [entry.title],
      });

      // Reload list from backend so state stays in sync
      await loadJournals();
    },
    [loadJournals],
  );

  const deleteJournal = useCallback(
    async (id: string) => {
      const entry = journalEntries.find(e => e.id === id);
      if (!entry) return;

      try {
        await deleteJournalEntry(entry.id, entry.date);
        // refresh from backend to stay in sync
        await loadJournals();
      } catch (e) {
        console.log('JournalContext: error deleting journal', e);
      }
    },
    [journalEntries, loadJournals],
  );

  const refreshJournals = useCallback(async () => {
    await loadJournals();
  }, [loadJournals]);

  const clearSelectedFilterDate = useCallback(() => {
    setSelectedFilterDate(null);
  }, []);

  return (
    <JournalContext.Provider
      value={{
        journalEntries,
        addJournal,
        deleteJournal,
        refreshJournals,
        selectedFilterDate,
        setSelectedFilterDate,
        clearSelectedFilterDate,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournals() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournals must be used within a JournalProvider');
  }
  return context;
}
