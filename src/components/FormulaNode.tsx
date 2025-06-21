import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'katex';

interface FormulaNodeProps {
  formula: string;
}

const FormulaNode: React.FC<FormulaNodeProps> = ({ formula }) => {
  try {
    return <BlockMath math={formula} />;
  } catch (e) {
    return <span className="formula-error">[公式解析错误]</span>;
  }
};

export default FormulaNode;
