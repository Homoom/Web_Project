import React, { useState } from 'react';
import { Node, ExecutionLanguage } from '../types';
import { CodeRunner } from '../services/CodeRunner';

interface CodeExecutionPanelProps {
  node: Node;
  nodes: Node[];
  onExecute: (output: string) => void;
  onNavigate: (nodeId: string) => void;
}

const CodeExecutionPanel: React.FC<CodeExecutionPanelProps> = ({ 
  node, 
  nodes,
  onExecute,
  onNavigate
}) => {
  const [code, setCode] = useState(node.execution?.code || '');
  const [language, setLanguage] = useState<ExecutionLanguage>(node.execution?.language || ExecutionLanguage.JAVASCRIPT);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(node.execution?.output || '');

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const result = await CodeRunner.run({ language, code });
      setOutput(result);
      onExecute(result);
      
      // 自动跳转到下一个节点
      if (node.nextNodeId) {
        onNavigate(node.nextNodeId);
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="code-execution-panel">
      <select 
        value={language}
        onChange={(e) => setLanguage(e.target.value as ExecutionLanguage)}
      >
        {Object.values(ExecutionLanguage).map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Enter ${language} code...`}
      />
      
      <button onClick={handleRun} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Run Code'}
      </button>
      
      <select
        value={node.nextNodeId || ''}
        onChange={(e) => onNavigate(e.target.value)}
        disabled={nodes.length <= 1}
      >
        <option value="">-- Select next node --</option>
        {nodes.filter(n => n.id !== node.id).map(n => (
          <option key={n.id} value={n.id}>{n.content.value.substring(0, 20)}</option>
        ))}
      </select>
      
      {output && (
        <div className="output">
          <h4>Output:</h4>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionPanel;
