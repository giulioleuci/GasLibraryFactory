const { sources: { RawSource }, Compilation } = require('webpack');

class StripCommentsPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('StripCommentsPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'StripCommentsPlugin',
          // Run AFTER DEV_TOOLING (500) where source maps are extracted,
          // so Code.js.map is already finalized before we strip comments.
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        () => {
          for (const asset of compilation.getAssets()) {
            if (!asset.name.endsWith('.js')) continue;

            let source = asset.source.source();
            // Replace block comments preserving line count for source map accuracy
            source = source.replace(/\/\*[\s\S]*?\*\//g, (match) => {
              const lineCount = match.split('\n').length;
              return lineCount > 1 ? '\n'.repeat(lineCount - 1) : '';
            });
            source = source.replace(/(?<![:\\])\/\/[^\n]*/g, '');
            compilation.updateAsset(asset.name, new RawSource(source));
          }
        }
      );
    });
  }
}

module.exports = StripCommentsPlugin;
