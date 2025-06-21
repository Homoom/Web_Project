import React from 'react';
import { Node } from '../types';
import FormulaEditor from './FormulaEditor';
import MediaUploader from './MediaUploader';
import CodeExecutionPanel from './CodeExecutionPanel';

interface NodeEditorProps {
  node: Node;
  nodes: Node[];
  onUpdate: (updatedNode: Node) => void;
  onNavigate: (nodeId: string) => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ node, nodes, onUpdate, onNavigate }) => {
  const handleFormulaSave = (formula: string, result: number) => {
    onUpdate({ ...node, formula, calculatedValue: result });
  };

  const handleReset = () => {
    onUpdate({ ...node, formula: undefined, calculatedValue: undefined });
  };

const handleCodeExecute = (output: string) => {
    onUpdate({ 
      ...node, 
      execution: { 
        ...node.execution, 
        output 
      } 
    });
  };

  const handleNextNodeChange = (nextNodeId: string) => {
    onUpdate({ ...node, nextNodeId });
  };

  return (
    <div className="node-editor">
      {node.content.type === NodeContentType.TEXT && (
        <>
          <FormulaEditor 
            node={node}
            onSave={handleFormulaSave}
            onReset={handleReset}
          />
          <CodeExecutionPanel
            node={node}
            nodes={nodes}
            onExecute={handleCodeExecute}
            onNavigate={handleNextNodeChange}
          />
        </>
      )}
      <MediaUploader 
        onUpload={(type, value, meta) => 
          onUpdate({ ...node, content: { type, value, meta } })
        }
      />
    </div>
  );
};

export default NodeEditor;
