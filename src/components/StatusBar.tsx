
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NotesContext';

const StatusBar: React.FC = () => {
  const { isOnline, syncStatus, syncNotes } = useNotes();

  const getSyncStatusText = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return `Sync error: ${syncStatus.error}`;
      case 'idle':
        return syncStatus.lastSync 
          ? `Last sync: ${new Date(syncStatus.lastSync).toLocaleTimeString()}`
          : 'Not synced';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t text-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        
        <div className={`text-xs ${
          syncStatus.status === 'syncing' ? 'sync-status-pending' :
          syncStatus.status === 'error' ? 'sync-status-error' :
          'sync-status-synced'
        }`}>
          {getSyncStatusText()}
        </div>
      </div>

      {isOnline && (
        <Button
          size="sm"
          variant="outline"
          onClick={syncNotes}
          disabled={syncStatus.status === 'syncing'}
        >
          Sync Now
        </Button>
      )}
    </div>
  );
};

export default StatusBar;
