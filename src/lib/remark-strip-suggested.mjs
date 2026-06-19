// Remark plugin: strip a trailing "## Suggested internal links" section the
// marketing app may append, so it never renders even if not removed by hand.
// It removes that heading and everything after it.
export function remarkStripSuggested() {
  return (tree) => {
    const children = tree.children;
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.type === 'heading') {
        const text = (node.children || [])
          .map((c) => (typeof c.value === 'string' ? c.value : ''))
          .join('')
          .trim()
          .toLowerCase();
        if (text.startsWith('suggested internal links')) {
          children.length = i; // drop this heading and all following siblings
          return;
        }
      }
    }
  };
}
