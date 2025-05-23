
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/types/notes';

const NotesList: React.FC = () => {
  const { notes, selectedNoteId, createNote, selectNote, deleteNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {
    try {
      const newNoteId = await createNote();
      selectNote(newNoteId);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const getSyncStatusIcon = (note: Note) => {
    if (note.syncError) return '❌';
    if (note.synced) return '✅';
    return '⏳';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notes-sidebar border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={handleCreateNote} className="w-full mb-4">
          New Note
        </Button>
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {notes.length === 0 ? 'No notes yet' : 'No notes match your search'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => selectNote(note.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedNoteId === note.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate mb-1">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {note.content || 'No content'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(note.updatedAt)}</span>
                    <div className="flex items-center gap-2">
                      <span title={note.synced ? 'Synced' : note.syncError ? 'Sync error' : 'Pending sync'}>
                        {getSyncStatusIcon(note)}
                      </span>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;
