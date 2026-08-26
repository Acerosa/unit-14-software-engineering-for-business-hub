const path = require("node:path");
const engine = require("../../content/engine/index.js");

module.exports = engine.loadPackageFromDirectory(path.join(__dirname, "../../content/unit-14"));
