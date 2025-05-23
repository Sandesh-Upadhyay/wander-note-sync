
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Note, SyncStatus, NoteAction } from '@/types/notes';
import { dbManager } from '@/utils/indexedDb';
import { apiManager } from '@/utils/api';

interface NotesState {
  notes: Note[];
  syncStatus: SyncStatus;
  isOnline: boolean;
  selectedNoteId: string | null;
}

interface NotesContextType extends NotesState {
  createNote: () => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  syncNotes: () => Promise<void>;
}

const initialState: NotesState = {
  notes: [],
  syncStatus: { status: 'idle' },
  isOnline: navigator.onLine,
  selectedNoteId: null,
};

function notesReducer(state: NotesState, action: NoteAction | { type: 'SET_ONLINE'; isOnline: boolean } | { type: 'SELECT_NOTE'; id: string | null }): NotesState {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'CREATE_NOTE':
      return { ...state, notes: [action.note, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.id ? { ...note, ...action.updates } : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.id),
        selectedNoteId: state.selectedNoteId === action.id ? null : state.selectedNoteId,
      };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.status };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.isOnline };
    case 'SELECT_NOTE':
      return { ...state, selectedNoteId: action.id };
    default:
      return state;
  }
}

const NotesContext = createContext<NotesContextType | null>(null);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Load notes from IndexedDB on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        await dbManager.init();
        const notes = await dbManager.getAllNotes();
        dispatch({ type: 'SET_NOTES', notes });
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    };
    loadNotes();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', isOnline: true });
      syncNotes(); // Auto-sync when coming online
    };
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createNote = useCallback(async (): Promise<string> => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newNote: Note = {
      id,
      title: 'Untitled Note',
      content: '',
      updatedAt: now,
      synced: false,
    };

    try {
      await dbManager.saveNote(newNote);
      dispatch({ type: 'CREATE_NOTE', note: newNote });
      return id;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const updatedNote = {
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    try {
      const existingNote = state.notes.find(note => note.id === id);
      if (!existingNote) return;

      const fullNote = { ...existingNote, ...updatedNote };
      await dbManager.saveNote(fullNote);
      dispatch({ type: 'UPDATE_NOTE', id, updates: updatedNote });
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  }, [state.notes]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await dbManager.deleteNote(id);
      dispatch({ type: 'DELETE_NOTE', id });
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  }, []);

  const selectNote = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_NOTE', id });
  }, []);

  const syncNotes = useCallback(async () => {
    if (!state.isOnline) return;

    dispatch({ type: 'SET_SYNC_STATUS', status: { status: 'syncing' } });

    try {
      const unsyncedNotes = await dbManager.getUnsyncedNotes();
      
      for (const note of unsyncedNotes) {
        try {
          // Try to update on server (assuming note exists)
          await apiManager.updateNote(note);
          
          // Mark as synced
          const syncedNote = { ...note, synced: true };
          await dbManager.saveNote(syncedNote);
          dispatch({ type: 'UPDATE_NOTE', id: note.id, updates: { synced: true } });
        } catch (error) {
          console.warn(`Failed to sync note ${note.id}:`, error);
          // Mark sync error but continue with other notes
          dispatch({ type: 'UPDATE_NOTE', id: note.id, updates: { syncError: 'Sync failed' } });
        }
      }

      dispatch({
        type: 'SET_SYNC_STATUS',
        status: { status: 'idle', lastSync: new Date().toISOString() },
      });
    } catch (error) {
      console.error('Sync failed:', error);
      dispatch({
        type: 'SET_SYNC_STATUS',
        status: { status: 'error', error: error instanceof Error ? error.message : 'Sync failed' },
      });
    }
  }, [state.isOnline]);

  const value: NotesContextType = {
    ...state,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    syncNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
