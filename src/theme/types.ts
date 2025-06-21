export interface ThemeComponent {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  fontSize?: number;
  borderRadius?: number;
  padding?: number;
}

export interface Theme {
  name: string;
  node: ThemeComponent;
  connection: {
    color: string;
    width: number;
    curveType: 'bezier' | 'straight';
  };
  canvas: {
    backgroundColor: string;
    gridColor?: string;
  };
  palette: string[]; // 调色板
  customCSS?: string;
}

export const DEFAULT_THEME: Theme = {
  name: '默认主题',
  node: {
    backgroundColor: '#ffffff',
    borderColor: '#1890ff',
    textColor: '#333333',
    fontSize: 14,
    borderRadius: 4,
    padding: 8
  },
  connection: {
    color: '#999999',
    width: 2,
    curveType: 'bezier'
  },
  canvas: {
    backgroundColor: '#f5f5f5'
  },
  palette: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
};
