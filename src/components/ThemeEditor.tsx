import React, { useState } from 'react';
import { Theme, DEFAULT_THEME } from '../theme/types';
import { ChromePicker } from 'react-color';

interface ThemeEditorProps {
  initialTheme?: Theme;
  onSave: (theme: Theme) => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ 
  initialTheme = DEFAULT_THEME,
  onSave 
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [activeTab, setActiveTab] = useState<'node'|'connection'|'canvas'>('node');

const updateComponent = (component: keyof Theme, value: Partial<Theme[keyof Theme]>) => {
    setTheme(prev => ({
      ...prev,
      [component]: { ...prev[component], ...value }
    }));
  };

  const renderColorPicker = (label: string, colorKey: string) => (
    <div className="config-item">
      <label>{label}</label>
      <ChromePicker
        color={theme[activeTab][colorKey]}
        onChangeComplete={(color) => 
          updateComponent(activeTab, { [colorKey]: color.hex })
        }
      />
    </div>
  );

  return (
    <div className="theme-editor">
      <div className="tabs">
        {['node', 'connection', 'canvas'].map(tab => (
          <button 
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'node' && (
        <div className="config-panel">
          {renderColorPicker('背景色', 'backgroundColor')}
          {renderColorPicker('边框色', 'borderColor')}
          {renderColorPicker('文字色', 'textColor')}
          {/* 其他节点样式配置... */}
        </div>
      )}
      {/* 其他选项卡内容... */}
    </div>
  );
