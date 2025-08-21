"use client";

export default function RichTextRenderer({ content, className = "" }) {
  if (!content) return null;

  const renderContent = (text) => {
    return text.split('\n').map((line, index) => {
      // Handle headings
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-bold mt-4 mb-3 first:mt-0">{line.substring(2)}</h1>;
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
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
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
            {parts.map((part, partIndex) => {
              if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return <em key={partIndex}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </p>
        );
      }

      // Handle bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="mr-2 mt-1">•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="mr-2 font-medium">{match[1]}.</span>
            <span>{match[2]}</span>
          </div>
        );
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-3"></div>;
      }
      
      // Regular text
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {renderContent(content)}
    </div>
  );
}

