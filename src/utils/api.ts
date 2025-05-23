
import { Note } from '@/types/notes';

// Mock API base URL - you can replace this with your actual API
const API_BASE = 'https://67475b5538c8741641d59f20.mockapi.io/api/v1';

export class ApiManager {
  async fetchNotes(): Promise<Note[]> {
    try {
      const response = await fetch(`${API_BASE}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return await response.json();
    } catch (error) {
      console.error('API fetchNotes error:', error);
      throw error;
    }
  }

  async createNote(note: Omit<Note, 'id'>): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error('Failed to create note');
      return await response.json();
    } catch (error) {
      console.error('API createNote error:', error);
      throw error;
    }
  }

  async updateNote(note: Note): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE}/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error('Failed to update note');
      return await response.json();
    } catch (error) {
      console.error('API updateNote error:', error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete note');
    } catch (error) {
      console.error('API deleteNote error:', error);
      throw error;
    }
  }
}

export const apiManager = new ApiManager();
