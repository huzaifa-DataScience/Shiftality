// src/contexts/JournalContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_STORAGE_KEY = 'shift_journal_entries_v1';

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

  // Load journals from storage
  const loadJournals = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      if (!raw) return;
      const parsed: JournalEntry[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setJournalEntries(parsed);
      }
    } catch (e) {
      console.log('JournalContext: error loading journals', e);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  // Save journals to storage
  const saveJournals = useCallback(async (entries: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
      setJournalEntries(entries);
    } catch (e) {
      console.log('JournalContext: error saving journals', e);
    }
  }, []);

  // Add a new journal entry
  const addJournal = useCallback(
    async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
      const newEntry: JournalEntry = {
        ...entry,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedEntries = [newEntry, ...journalEntries];
      await saveJournals(updatedEntries);
    },
    [journalEntries, saveJournals],
  );

  // Delete a journal entry
  const deleteJournal = useCallback(
    async (id: string) => {
      const updatedEntries = journalEntries.filter(e => e.id !== id);
      await saveJournals(updatedEntries);
    },
    [journalEntries, saveJournals],
  );

  // Refresh journals from storage
  const refreshJournals = useCallback(async () => {
    await loadJournals();
  }, [loadJournals]);

  // Clear selected filter date
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

