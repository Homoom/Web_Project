type ShortcutMap = Record<string, () => void>;

class ShortcutManager {
  private keyMap: ShortcutMap = {};
  private defaultBindings = {
    'ctrl+s': () => console.log('Save triggered'),
    'ctrl+z': () => console.log('Undo triggered')
  };

  register(keyCombo: string, handler: () => void) {
    this.keyMap[keyCombo.toLowerCase()] = handler;
  }

  handleKeyDown(e: KeyboardEvent) {
    const combo = [
      e.ctrlKey ? 'ctrl+' : '',
      e.key.toLowerCase()
    ].join('');
    
    const handler = this.keyMap[combo] || this.defaultBindings[combo];
    handler?.();
  }
}

export const shortcutManager = new ShortcutManager();
