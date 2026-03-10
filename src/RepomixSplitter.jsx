import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Scissors, MessageSquare } from 'lucide-react';

export default function RepomixSplitter() {
  const [inputText, setInputText] = useState('');
  const [chunkSize, setChunkSize] = useState(5000);
  const [chunks, setChunks] = useState([]);
  const [copiedIndices, setCopiedIndices] = useState(new Set());
  const [expandedIndices, setExpandedIndices] = useState(new Set());

  const handleSplitProcess = () => {
    if (!inputText.trim()) {
      setChunks([]);
      return;
    }
    
    // Minify code
    const minified = inputText.replace(/\s+/g, ' ').trim();
    const rawChunks = [];
    for (let i = 0; i < minified.length; i += chunkSize) {
      rawChunks.push(minified.substring(i, i + chunkSize));
    }
    
    // Wrap chunks with LLM instructions
    const total = rawChunks.length;
    const formattedChunks = rawChunks.map((content, index) => {
      const partNum = index + 1;
      const isLast = partNum === total;

      const instruction = isLast 
        ? `[PART ${partNum}/${total}] This is the FINAL part of the code. You may now process all parts and provide your response based on the full context provided.`
        : `[PART ${partNum}/${total}] I am sending a large codebase in multiple parts. Please remember this split and DO NOT reply or analyze yet. Just acknowledge with "Part ${partNum} received".`;

      return `${instruction}\n\n--- CODE START ---\n${content}\n--- CODE END ---`;
    });
    
    setChunks(formattedChunks);
    setCopiedIndices(new Set());
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndices(prev => new Set([...prev, index]));
  };

  const toggleExpand = (index) => {
    const newSet = new Set(expandedIndices);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setExpandedIndices(newSet);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📦 Repomix Splitter</h1>
        <p style={{ color: '#666' }}>Minify and chunk large codebases for LLM context windows.</p>
      </header>
      
      <textarea
        placeholder="Paste Repomix output here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ width: '100%', height: '150px', borderRadius: '12px', border: '1px solid #d1d5db', padding: '15px', marginBottom: '15px', fontSize: '14px' }}
      />

      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div>
          <label style={{ fontWeight: '600', marginRight: '8px' }}>Chars per Prompt:</label>
          <input 
            type="number" 
            value={chunkSize} 
            onChange={(e) => setChunkSize(Number(e.target.value))}
            style={{ padding: '10px', width: '120px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />
        </div>

        <button 
          onClick={handleSplitProcess}
          style={{
            padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
          }}
        >
          <Scissors size={18} /> Process for LLM
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {chunks.map((chunk, index) => {
          const isCopied = copiedIndices.has(index);
          const isExpanded = expandedIndices.has(index);
          
          return (
            <div key={index} style={{
              border: `2px solid ${isCopied ? '#10b981' : '#3b82f6'}`,
              backgroundColor: '#fff',
              padding: '20px', borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              opacity: isCopied ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    backgroundColor: isCopied ? '#10b981' : '#3b82f6', 
                    color: '#white', padding: '4px 12px', borderRadius: '20px', color: '#fff', fontSize: '12px' 
                  }}>
                    Part {index + 1} of {chunks.length}
                  </span>
                  {isCopied && <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>✓ Done</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => toggleExpand(index)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: '8px' }}>
                    {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                  <button 
                    onClick={() => handleCopy(chunk, index)}
                    style={{ 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      background: isCopied ? '#059669' : '#2563eb', color: 'white', border: 'none',
                      padding: '10px 20px', borderRadius: '8px', fontWeight: '600'
                    }}
                  >
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    {isCopied ? 'Copied to Clipboard' : 'Copy Prompt'}
                  </button>
                </div>
              </div>

              <div style={{ 
                padding: '15px', background: '#1e293b', color: '#f8fafc',
                borderRadius: '10px', fontSize: '13px', lineHeight: '1.6'
              }}>
                <div style={{ color: '#fbbf24', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '5px', fontWeight: 'bold' }}>
                  <MessageSquare size={14} style={{ marginRight: '5px' }} /> LLM Instruction:
                </div>
                <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {isExpanded ? chunk : (
                    <>
                      {chunk.split('\n')[0]} {/* Show the instruction line */}
                      <br /><br />
                      <span style={{ color: '#94a3b8' }}>... [Minified Code Body] ...</span>
                      <br /><br />
                      <span style={{ color: '#94a3b8' }}>// END PREVIEW:</span><br/>
                      ...{chunk.substring(chunk.length - 120)}
                    </>
                  )}
                </code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
