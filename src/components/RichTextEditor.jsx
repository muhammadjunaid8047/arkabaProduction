"use client";
import { useState } from "react";

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your text here...", 
  required = false,
  rows = 6,
  id = "rich-text-editor",
  label = "Content"
}) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (prefix, suffix = '', cursorOffset = 0) => {
    const textarea = document.getElementById(id);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = textarea.value.substring(0, start) + prefix + selectedText + suffix + textarea.value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    }, 0);
  };

  const renderPreview = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      // Handle headings
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-bold mt-4 mb-2 first:mt-0">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-semibold mt-3 mb-2 first:mt-0">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-base font-semibold mt-2 mb-1 first:mt-0">{line.substring(4)}</h3>;
      }
      
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={index} className={line.trim() === '' ? 'h-4' : 'mb-2'}>
            {parts && parts.map((part, partIndex) => {
              if (part && part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }

      // Handle italic text
      if (line.includes('*') && !line.includes('**')) {
        const parts = line.split(/(\*.*?\*)/);
        return (
          <p key={index} className={line.trim() === '' ? 'h-4' : 'mb-2'}>
            {parts && parts.map((part, partIndex) => {
              if (part && part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return <em key={partIndex}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </p>
        );
      }

      // Handle bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        if (match && match[2]) {
          return <li key={index} className="ml-4 mb-1" style={{listStyleType: 'decimal'}}>{match[2]}</li>;
        }
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-4"></div>;
      }
      
      // Regular text
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && "*"}
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>
      
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-md bg-gray-50 p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold"
          title="Bold"
        >
          B
        </button>
        
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 italic"
          title="Italic"
        >
          I
        </button>
        
        <button
          type="button"
          onClick={() => insertMarkdown('# ', '')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Heading 1"
        >
          H1
        </button>
        
        <button
          type="button"
          onClick={() => insertMarkdown('## ', '')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => insertMarkdown('### ', '')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Heading 3"
        >
          H3
        </button>
        
        <button
          type="button"
          onClick={() => insertMarkdown('- ', '')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Bullet Point"
        >
          •
        </button>

        <button
          type="button"
          onClick={() => insertMarkdown('1. ', '')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Numbered List"
        >
          1.
        </button>
        
        <button
          type="button"
          onClick={() => {
            const textarea = document.getElementById(id);
            const start = textarea.selectionStart;
            const newText = textarea.value.substring(0, start) + '\n\n' + textarea.value.substring(start);
            onChange(newText);
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + 2, start + 2);
            }, 0);
          }}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="Line Break"
        >
          ↵
        </button>
      </div>
      
      {/* Textarea */}
      <textarea
        id={id}
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`${placeholder}

Use the toolbar above for formatting:
**Bold text**
*Italic text*
# Main Heading
## Subheading
### Small Heading
- Bullet points
1. Numbered lists

Line breaks will be preserved when displayed.`}
        className="w-full px-3 py-2 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
      />
      
      {/* Preview */}
      {showPreview && value && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-xs text-gray-500 mb-2 font-semibold">Preview:</div>
          <div className="prose prose-sm max-w-none">
            {renderPreview(value)}
          </div>
        </div>
      )}
    </div>
  );
}

