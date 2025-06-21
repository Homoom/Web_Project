import React, { useRef } from 'react';
import { ExportService } from '../services/ExportService';
import { Node } from '../types';

interface ExportPanelProps {
  nodes: Node[];
  mindmapRef: React.RefObject<HTMLDivElement>;
  onImport: (nodes: Node[]) => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ nodes, mindmapRef, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>();

  const handleExport = (type: 'image' | 'mind' | 'exemind') => {
    if (!mindmapRef.current) return;

    switch(type) {
      case 'image':
        ExportService.exportAsImage(mindmapRef.current);
        break;
      case 'mind':
        ExportService.exportAsMindFile(nodes);
        break;
      case 'exemind':
        ExportService.exportAsExecutable(nodes);
        break;
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.nodes) {
          onImport(data.nodes);
        }
      } catch (error) {
        console.error('导入失败', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-panel">
      <button onClick={() => handleExport('image')}>导出图片</button>
      <button onClick={() => handleExport('mind')}>导出导图文件</button>
      <button onClick={() => handleExport('exemind')}>导出可执行文件</button>
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".mind"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        导入导图文件
      </button>
    </div>
  );
};

export default ExportPanel;
