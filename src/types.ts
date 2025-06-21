export enum NodeContentType {
  TEXT = 'text',
  LINK = 'link',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file'
}

export enum ExecutionLanguage {
  JAVA = 'java',
  PYTHON = 'python',
  C = 'c',
  CPP = 'cpp',
  JAVASCRIPT = 'javascript'
}

export interface CodeExecution {
  language: ExecutionLanguage;
  code: string;
  dependencies?: string[];
  output?: string;
}

export interface NodeContent {
  type: NodeContentType;
  value: string;
  thumbnail?: string; // 用于视频/图片缩略图
  meta?: Record<string, any>; // 额外元数据
}

export interface Node {
  id: string;
  content: NodeContent; // 替换原来的text字段
  formula?: string;  // 新增公式字段
  calculatedValue?: number; // 计算结果
  execution?: CodeExecution; // 新增代码执行字段
  nextNodeId?: string; // 执行成功后跳转的节点
  x: number;
  y: number;
  width: number;
  height: number;
  children: string[]; // 子节点ID数组
  parent?: string; // 父节点ID
  color?: string;
  isRoot?: boolean;
  originalText?: string; // 原始文本备份(用于重置)
}

export type NodeMap = Record<string, Node>;

export interface MindMapData {
  rootId: string;
  nodes: NodeMap;
}

// 新增公式计算函数类型
export type FormulaCalculator = (formula: string, getNodeValue: (id: string) => number) => number;
