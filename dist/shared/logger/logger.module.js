"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerModule = void 0;
const common_1 = require("@nestjs/common");
const logger_constants_1 = require("./logger.constants");
const logger_service_1 = require("./logger.service");
let LoggerModule = LoggerModule_1 = class LoggerModule {
    static forRoot(options, isGlobal = false) {
        return {
            global: isGlobal,
            module: LoggerModule_1,
            providers: [
                logger_service_1.LoggerService,
                {
                    provide: logger_constants_1.LOGGER_MODULE_OPTIONS,
                    useValue: options,
                },
            ],
            exports: [logger_service_1.LoggerService, logger_constants_1.LOGGER_MODULE_OPTIONS],
        };
    }
    static forRootAsync(options, isGlobal = false) {
        return {
            global: isGlobal,
            module: LoggerModule_1,
            imports: options.imports,
            providers: [
                logger_service_1.LoggerService,
                {
                    provide: logger_constants_1.LOGGER_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
            ],
            exports: [logger_service_1.LoggerService, logger_constants_1.LOGGER_MODULE_OPTIONS],
        };
    }
};
LoggerModule = LoggerModule_1 = __decorate([
    (0, common_1.Module)({})
], LoggerModule);
exports.LoggerModule = LoggerModule;
//# sourceMappingURL=logger.module.js.map