import React, { useState } from 'react';
import { Node } from '../types';
import { evaluate } from 'mathjs';

interface FormulaEditorProps {
  node: Node;
  onSave: (formula: string, result: number) => void;
  onReset: () => void;
}

const FormulaEditor: React.FC<FormulaEditorProps> = ({ node, onSave, onReset }) => {
  const [formula, setFormula] = useState(node.formula || '');
  const [error, setError] = useState('');

  const handleCalculate = () => {
    try {
      const result = evaluate(formula);
      onSave(formula, result);
      setError('');
    } catch (err) {
      setError('公式计算错误');
    }
  };

  return (
    <div className="formula-editor">
      <textarea 
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        placeholder="输入数学公式，如：2+3*5"
      />
      <button onClick={handleCalculate}>计算</button>
      <button onClick={onReset}>重置</button>
      {error && <div className="error">{error}</div>}
      {node.calculatedValue !== undefined && (
        <div className="result">结果: {node.calculatedValue}</div>
      )}
    </div>
  );
};

export default FormulaEditor;
