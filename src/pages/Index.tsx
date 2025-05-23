
import React from 'react';
import { NotesProvider, useNotes } from '@/contexts/NotesContext';
import NotesList from '@/components/NotesList';
import MarkdownEditor from '@/components/MarkdownEditor';
import StatusBar from '@/components/StatusBar';
import { Input } from '@/components/ui/input';

const NotesAppContent: React.FC = () => {
  const { notes, selectedNoteId, updateNote } = useNotes();
  const selectedNote = notes.find(note => note.id === selectedNoteId);

  const handleTitleChange = (value: string) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { title: value });
    }
  };

  const handleContentChange = (content: string) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { content });
    }
  };

  return (
    <div className="notes-app h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Wander Notes</h1>
        <p className="text-sm text-gray-600">Offline-first note taking with sync</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <NotesList />
        </div>

        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              <div className="border-b p-4">
                <Input
                  value={selectedNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xl font-semibold border-0 focus:ring-0 p-0"
                  placeholder="Note title..."
                />
              </div>
              <div className="flex-1">
                <MarkdownEditor
                  content={selectedNote.content}
                  onChange={handleContentChange}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-600 mb-2">Welcome to Wander Notes</h2>
                <p className="text-gray-500 mb-4">Create your first note to get started</p>
                <div className="text-sm text-gray-400">
                  ✨ Works offline<br />
                  🔄 Auto-sync when online<br />
                  📝 Markdown support
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <StatusBar />
    </div>
  );
};

const Index = () => {
  return (
    <NotesProvider>
      <NotesAppContent />
    </NotesProvider>
  );
};

export default Index;
