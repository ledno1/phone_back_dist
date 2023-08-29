"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const configuration_1 = require("./configuration");
(0, dotenv_1.config)({ path: '.env.development' });
exports.default = new typeorm_1.DataSource((0, configuration_1.getConfiguration)().database);
//# sourceMappingURL=data-source.js.map