
import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ content, onChange, className = '' }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localContent !== content) {
        onChange(localContent);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localContent, content, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  }, []);

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for demo
    return text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-2">
          <Button
            variant={!isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(false)}
          >
            Edit
          </Button>
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        <div
          className="flex-1 p-4 overflow-auto markdown-preview"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent) }}
        />
      ) : (
        <Textarea
          value={localContent}
          onChange={handleChange}
          className="flex-1 resize-none border-0 focus:ring-0 markdown-editor"
          placeholder="Start writing your note..."
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
