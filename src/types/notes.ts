
export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  synced: boolean;
  syncError?: string;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'error';
  lastSync?: string;
  error?: string;
}

export type NoteAction = 
  | { type: 'CREATE_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; id: string; updates: Partial<Note> }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'SET_NOTES'; notes: Note[] }
  | { type: 'SET_SYNC_STATUS'; status: SyncStatus };
