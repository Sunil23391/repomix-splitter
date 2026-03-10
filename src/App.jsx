import React, { useState } from 'react'
import RepomixSplitter from './RepomixSplitter.jsx'
import RepomixBuilder from './RepomixBuilder.jsx'
export default function App() {
  console.log('reaching')
  const [currentComponent, setCurrentComponent] = useState('RepomixSplitter');
  return (
    <div>
      <button onClick={() => setCurrentComponent('RepomixSplitter')}>Repomix Splitter</button>
      <button onClick={() => setCurrentComponent('RepomixBuilder')}>Repomix Builder</button>
      {currentComponent == 'RepomixSplitter' && <RepomixSplitter />}
      {currentComponent == 'RepomixBuilder' && <RepomixBuilder />}
    </div>
  )
}