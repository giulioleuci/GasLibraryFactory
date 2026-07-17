const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.gs')) {
      callback(path.join(dir, f));
    }
  });
}

const targetDirs = [
  '__testOnline__',
  'DomainRepositoryLib/__testOnline__',
  'RoleResolutionLib/__testOnline__',
  'GasDataImporter/__testOnline__'
];

targetDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    walkDir(dir, (filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      const dbRegex =
        /(?:const logger = new LoggerService\(\);\s*)?const db = new DatabaseService\((.*?)\);/g;

      content = content.replace(dbRegex, (match, p1) => {
        changed = true;
        // p1 is the spreadsheet ID
        return `const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(${p1}, logger, utils, cache, exceptionService);`;
      });

      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed', filePath);
      }
    });
  }
});
