import React, { useState } from 'react';
import { Code, TreeDeciduous, MapPin, Plus, Terminal, Copy, Check, Play, ShieldCheck, AlertCircle, PlusCircle, XCircle, ListTree, FileCode, Wand2, Search } from 'lucide-react';

const FormField = ({ label, icon: Icon, children }) => (
  <div className="flex flex-col w-full mb-8">
    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
      <Icon size={14} className="text-indigo-500" /> {label}
    </label>
    <div className="w-full">{children}</div>
  </div>
);

export default function RepomixBuilder() {
  const [reactCode, setReactCode] = useState('');
  const [treeStructure, setTreeStructure] = useState('');
  const [relativePath, setRelativePath] = useState('');
  const [extraFiles, setExtraFiles] = useState('');
  
  const [finalIncludes, setFinalIncludes] = useState([]);
  const [excludedImports, setExcludedImports] = useState([]);
  const [allTreePaths, setAllTreePaths] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('cli');

  // --- 1. TREE PARSER ---
  const handleParseTree = () => {
    const lines = treeStructure.split('\n');
    const paths = [];
    const levelPaths = [];
    lines.forEach((line) => {
      if (!line.trim()) return;
      const contentMatch = line.match(/[a-zA-Z0-9._].*/);
      if (!contentMatch) return;
      const content = contentMatch[0];
      const depth = line.indexOf(content);
      const level = Math.floor(depth / 4);
      levelPaths[level] = content;
      const fullPath = levelPaths.slice(0, level + 1).join('/');
      if (content.includes('.')) paths.push(fullPath);
    });
    setAllTreePaths(paths);
  };

  // --- 2. LOGIC: PARTIAL PATH MATCHING ---
  const findAbsoluteMatch = (importPath, currentDir, inventory) => {
    let resolvedImport = importPath.startsWith('.') 
      ? (currentDir + importPath).replace(/\/\.\//g, '/').replace(/^\.\//, '') 
      : importPath;

    return inventory.find(absolutePath => {
      const pathWithoutExtension = absolutePath.replace(/\.[^/.]+$/, "");
      return resolvedImport.includes(pathWithoutExtension);
    });
  };

  const handleGenerate = () => {
    const inventory = allTreePaths.length > 0 ? allTreePaths : [];
    const importRegex = /from\s+['"]([^'"]+)['"]/gs;
    const extractedImports = [];
    let match;
    while ((match = importRegex.exec(reactCode)) !== null) { extractedImports.push(match[1]); }

    const lastSlashIndex = relativePath.lastIndexOf('/');
    const currentFileDir = lastSlashIndex !== -1 ? relativePath.substring(0, lastSlashIndex + 1) : '';
    
    const candidates = [...new Set([
        relativePath, 
        ...extractedImports, 
        ...extraFiles.split(/[\n,]+/).map(f => f.trim()).filter(f => f)
    ])];

    const validated = [];
    const rejected = [];

    candidates.forEach(path => {
      const matchInTree = findAbsoluteMatch(path, currentFileDir, inventory);
      if (matchInTree) {
        validated.push(matchInTree);
      } else if (path !== relativePath && !['react', 'lucide-react', 'antd', '@'].some(lib => path.startsWith(lib))) {
        rejected.push(path);
      }
    });

    setFinalIncludes([...new Set(validated)]);
    setExcludedImports([...new Set(rejected)]);
    setIsGenerated(true);
  };

  const addToIncludes = (path) => {
    setFinalIncludes(prev => [...new Set([...prev, path])]);
    setIsGenerated(true); 
  };

  const forceIncludeWithSmartLookup = (rawPath) => {
    const lastSlashIndex = relativePath.lastIndexOf('/');
    const currentFileDir = lastSlashIndex !== -1 ? relativePath.substring(0, lastSlashIndex + 1) : '';
    const bestMatch = findAbsoluteMatch(rawPath, currentFileDir, allTreePaths);
    addToIncludes(bestMatch || rawPath);
    setExcludedImports(prev => prev.filter(p => p !== rawPath));
  };

  const removeInclude = (path) => setFinalIncludes(prev => prev.filter(p => p !== path));

  const generateCommand = () => `npx repomix --include "${finalIncludes.join(',')}" --output repomix-output.txt`;
  const generateConfig = () => JSON.stringify({ include: finalIncludes, output: { filePath: "repomix-output.txt", style: "plain" } }, null, 2);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200"><Terminal size={24} /></div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Repomix <span className="text-indigo-600">Architect</span></h1>
            </div>
            <p className="text-slate-500 text-sm">Interactive code bundling with tree-verified absolute path resolution.</p>
          </div>
          <button onClick={handleGenerate} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <Play size={18} fill="currentColor" /> Generate Verified Bundle
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: ALL INPUTS */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <FormField label="1. React Source Code" icon={Code}>
                <textarea className="w-full h-48 p-4 font-mono text-sm border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white outline-none resize-none shadow-inner" value={reactCode} onChange={(e) => setReactCode(e.target.value)} placeholder="Paste your React component here..." />
              </FormField>

              <FormField label="2. Tree Structure" icon={TreeDeciduous}>
                <textarea className="w-full h-48 p-4 font-mono text-[10px] border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white outline-none resize-none shadow-inner" value={treeStructure} onChange={(e) => setTreeStructure(e.target.value)} placeholder="Paste output of 'tree' command..." />
                <button onClick={handleParseTree} className="mt-3 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  <Wand2 size={14} /> Parse Tree Paths
                </button>
              </FormField>

              {/* RESTORED INPUTS: TARGET PATH & MANUAL EXTRAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="3. Target Path" icon={MapPin}>
                  <input type="text" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:bg-white transition-all shadow-inner" value={relativePath} onChange={(e) => setRelativePath(e.target.value)} placeholder="e.g. features/numbers/App.tsx" />
                </FormField>
                <FormField label="4. Manual Extras" icon={Plus}>
                  <input type="text" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:bg-white transition-all shadow-inner" value={extraFiles} onChange={(e) => setExtraFiles(e.target.value)} placeholder="reducer.js, sagas.js" />
                </FormField>
              </div>

              {/* INTERACTIVE TREE INVENTORY (VISIBLE AFTER PARSING) */}
              {allTreePaths.length > 0 && (
                <div className="mt-4 pt-6 border-t border-slate-100 animate-in fade-in zoom-in-95">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><ListTree size={14} className="text-indigo-500" /> Parsed Tree Inventory</span>
                    <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full">{allTreePaths.length} Files</span>
                  </h3>
                  <div className="bg-slate-900 rounded-2xl p-4 max-h-64 overflow-auto custom-scrollbar border border-slate-800 shadow-inner">
                    {allTreePaths.map((path, i) => (
                      <div key={i} className="group flex justify-between items-center text-[10px] font-mono text-emerald-500/80 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                        <span className="truncate mr-4 flex items-center gap-2">
                          <FileCode size={12} className="text-slate-600" /> {path}
                        </span>
                        <button 
                          onClick={() => addToIncludes(path)}
                          className="opacity-0 group-hover:opacity-100 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2 py-0.5 rounded flex items-center gap-1 font-black transition-all"
                        >
                          <Plus size={10} /> ADD
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: OUTPUTS & MANAGEMENT */}
          <div className="lg:col-span-6 space-y-6">
            <div className={`bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 transition-all ${!isGenerated ? 'opacity-30 pointer-events-none' : ''}`}>
               <div className="flex bg-slate-950/40 p-2 gap-1">
                {['cli', 'json'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)} className={`flex-1 py-3 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}>{mode}</button>
                ))}
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14}/> Final Output</span>
                  <button onClick={() => {navigator.clipboard.writeText(viewMode === 'cli' ? generateCommand() : generateConfig()); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
                    {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-black/40 rounded-2xl p-6 font-mono text-[13px] text-emerald-400 break-all max-h-48 overflow-auto custom-scrollbar border border-white/5">
                   {viewMode === 'cli' ? `$ ${generateCommand()}` : <pre className="text-indigo-300 whitespace-pre-wrap">{generateConfig()}</pre>}
                </div>
              </div>
            </div>

            {isGenerated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-[2rem] p-6 shadow-sm">
                  <h3 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-4">Included ({finalIncludes.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-auto custom-scrollbar pr-2">
                    {finalIncludes.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-emerald-100 group">
                        <span className="text-[9px] font-mono truncate mr-2 text-emerald-900">{p}</span>
                        <XCircle size={14} className="text-slate-300 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeInclude(p)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 shadow-sm">
                  <h3 className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-4">Excluded ({excludedImports.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-auto custom-scrollbar pr-2">
                    {excludedImports.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-100 group">
                        <span className="text-[9px] font-mono truncate mr-2 text-amber-900">{p}</span>
                        <button onClick={() => forceIncludeWithSmartLookup(p)} className="flex items-center gap-1 text-amber-600 hover:text-amber-800 transition-colors">
                           <PlusCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}} />
    </div>
  );
}
