const fs = require("node:fs");
const path = require("node:path");

require("./constants.js");
require("./block-registry.js");
require("./validate.js");
require("./load.js");
require("./resolve.js");
require("./render.js");
require("./importer.js");
require("./excel.js");

const ns = globalThis.LearningPlatformContent;

ns.nodeIo = function (baseDir) {
  return {
    readText: function (filePath) {
      return fs.readFileSync(filePath, "utf8");
    },
    joinPath: function (base, rel) {
      return path.join(base || baseDir, rel);
    }
  };
};

ns.loadPackageFromDirectory = function (directory) {
  return ns.loadPackageSync(directory, ns.nodeIo(directory));
};

ns.validateDirectory = function (directory) {
  const pkg = ns.loadPackageFromDirectory(directory);
  return Object.assign({ package: pkg }, ns.validatePackage(pkg));
};

module.exports = ns;
