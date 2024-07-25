module.exports = function() {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.get('source');
        if (source.isStringLiteral() && !path.hub.file.opts.filename.endsWith('.d.ts')) {
          const value = source.node.value;
          if (!value.endsWith('.js') && !value.endsWith('.json') && (value.startsWith('./') || value.startsWith('../'))) {
            source.node.value = `${value}.js`;
          }
        }
      },
      ExportNamedDeclaration(path) {
        const source = path.get('source');
        if (source && source.isStringLiteral() && !path.hub.file.opts.filename.endsWith('.d.ts')) {
          const value = source.node.value;
          if (!value.endsWith('.js') && !value.endsWith('.json') && (value.startsWith('./') || value.startsWith('../'))) {
            source.node.value = `${value}.js`;
          }
        }
      },
      ExportAllDeclaration(path) {
        const source = path.get('source');
        if (source && source.isStringLiteral() && !path.hub.file.opts.filename.endsWith('.d.ts')) {
          const value = source.node.value;
          if (!value.endsWith('.js') && !value.endsWith('.json') && (value.startsWith('./') || value.startsWith('../'))) {
            source.node.value = `${value}.js`;
          }
        }
      }
    }
  };
};
