import html2canvas from 'html2canvas';

export class ExportService {
  static async exportAsImage(element: HTMLElement, fileName: string = 'mindmap') {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2 // 高清导出
    });
    
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  static exportAsMindFile(nodes: Node[], fileName: string = 'mindmap') {
    const data = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      nodes
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${fileName}.mind`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  static exportAsExecutable(nodes: Node[], fileName: string = 'mindmap') {
    const executableData = {
      runtime: 'mindmap-player@1.0',
      entryNode: nodes[0]?.id,
      nodes: nodes.map(node => ({
        ...node,
        // 过滤敏感字段
        x: undefined,
        y: undefined
      }))
    };
    
    const blob = new Blob([JSON.stringify(executableData)], { 
      type: 'application/exemind' 
    });
    const link = document.createElement('a');
    link.download = `${fileName}.exemind`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }
}
