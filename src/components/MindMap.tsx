import React, { useEffect, useRef, useState } from 'react';
import { Node } from '../types';
import ExportPanel from './ExportPanel';
import { shortcutManager } from '../services/ShortcutService';
import { ColorGenerator } from '../utils/ColorGenerator';
import FormulaNode from './FormulaNode';

interface MindMapProps {
  initialNodes?: Node[];
}

const MindMap: React.FC<MindMapProps> = ({ initialNodes = [] }) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [selectedId, setSelectedId] = useState<string | null>();
  const mindmapRef = useRef<HTMLDivElement>();

  // +++ 新增快捷键监听 +++
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcutManager.handleKeyDown(e);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImport = (importedNodes: Node[]) => {
    setNodes(importedNodes.map(node => ({
      ...node,
      // 确保导入的节点有坐标数据
      x: node.x || Math.random() * 500,
      y: node.y || Math.random() * 500
    })));
  };

return (
    <div className="mindmap-container">
<div ref={mindmapRef} className="mindmap">
        {nodes.map((node, index) => {
          const bgColor = ColorGenerator.generatePalette(nodes.length)[index];
          return (
            <div key={node.id} style={{
              backgroundColor: bgColor,
              color: ColorGenerator.getTextColor(bgColor),
              borderColor: ColorGenerator.getBorderColor(bgColor)
            }}>
              {node.type === 'formula' ? (
                <FormulaNode formula={node.content} />
              ) : (
                node.text
              )}
            </div>
          );
        })}
      </div>
      
      <ExportPanel 
        nodes={nodes}
        mindmapRef={mindmapRef}
        onImport={handleImport}
      />
    </div>
  );

  // 添加节点操作函数
const addNode = (parentId: string) => {
  const newNode: Node = {
    id: `node_${Date.now()}`,
    text: '新节点',
    x: 0,
    y: 0,
    width: 120,
    height: 40,
    children: [],
    parent: parentId
  };

  setNodes(prev => {
    const parent = prev.find(n => n.id === parentId);
    if (parent) {
      parent.children.push(newNode.id);
    }
    return [...prev, newNode];
  });
};

// 拖拽处理
const handleDrag = (id: string, dx: number, dy: number) => {
  setNodes(prev => 
    prev.map(node => 
      node.id === id 
        ? { ...node, x: node.x + dx, y: node.y + dy } 
        : node
    )
  );
};

// 添加公式编辑和计算功能
const handleFormulaSubmit = (nodeId: string, formula: string) => {
  setNodes(prev => prev.map(node => {
    if (node.id === nodeId) {
      return { 
        ...node,
        originalText: node.originalText || node.text,
        formula,
        text: `计算中...`
      };
    }
    return node;
  }));

  // 执行计算
  setTimeout(() => calculateAllValues());
};

// 全量计算
const calculateAllValues = () => {
  setNodes(prev => {
    const nodeMap = Object.fromEntries(prev.map(n => [n.id, n]));
    const getNodeValue = (id: string) => nodeMap[id]?.calculatedValue || 0;
    
    return prev.map(node => {
      if (!node.formula) return node;
      
      const value = calculateNodeValue(node.formula, getNodeValue);
      return {
        ...node,
        calculatedValue: value,
        text: isNaN(value) ? `公式错误: ${node.formula}` : `= ${value.toFixed(2)}`
      };
    });
  });
};

// 重置功能
const handleReset = () => {
  setNodes(resetNodesToOriginal);
};