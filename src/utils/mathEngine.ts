import { Node, FormulaCalculator } from '../types';

export const calculateNodeValue: FormulaCalculator = (formula, getNodeValue) => {
  try {
    // 替换变量引用 (如 @child1, @parent 等)
    const evalFormula = formula.replace(/@(\w+)/g, (_, id) => {
      const val = getNodeValue(id);
      return isNaN(val) ? '0' : val.toString();
    });
    
    // 安全计算
    return new Function(`return ${evalFormula}`)();
  } catch {
    return NaN;
  }
};

export const resetNodesToOriginal = (nodes: Node[]): Node[] => {
  return nodes.map(node => ({
    ...node,
    text: node.originalText || node.text,
    formula: undefined,
    calculatedValue: undefined
  }));
};
