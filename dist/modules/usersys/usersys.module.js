"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersysModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const admin_constants_1 = require("../admin/admin.constants");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const top_controller_1 = require("./top/top.controller");
const commission_controller_1 = require("./commission/commission.controller");
const proxy_controller_1 = require("./proxy/proxy.controller");
const top_service_1 = require("./top/top.service");
const commission_service_1 = require("./commission/commission.service");
const proxy_service_1 = require("./proxy/proxy.service");
const system_module_1 = require("../admin/system/system.module");
const sys_user_entity_1 = __importDefault(require("../../entities/admin/sys-user.entity"));
const sys_balance_entity_1 = require("../../entities/admin/sys-balance.entity");
const top_entity_1 = require("../../entities/order/top.entity");
const ma_controller_1 = require("./ma/ma.controller");
const ma_service_1 = require("./ma/ma.service");
let UsersysModule = class UsersysModule {
};
UsersysModule = __decorate([
    (0, common_1.Module)({
        imports: [
            system_module_1.SystemModule,
            typeorm_1.TypeOrmModule.forFeature([
                sys_user_entity_1.default,
                sys_balance_entity_1.SysBalanceLog,
                top_entity_1.TopOrder
            ]),
            bull_1.BullModule.registerQueueAsync({
                name: admin_constants_1.SYS_TASK_QUEUE_NAME,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    redis: {
                        host: configService.get("redis.host"),
                        port: configService.get("redis.port"),
                        password: configService.get("redis.password"),
                        db: configService.get("redis.db")
                    },
                    prefix: admin_constants_1.SYS_TASK_QUEUE_PREFIX
                }),
                inject: [config_1.ConfigService]
            }),
        ],
        controllers: [top_controller_1.TopController, commission_controller_1.CommissionController, proxy_controller_1.ProxyController, ma_controller_1.MaController],
        providers: [top_service_1.TopService, commission_service_1.CommissionService, proxy_service_1.ProxyService, ma_service_1.MaService],
        exports: [top_service_1.TopService, commission_service_1.CommissionService, proxy_service_1.ProxyService, ma_service_1.MaService]
    })
], UsersysModule);
exports.UsersysModule = UsersysModule;
//# sourceMappingURL=usersys.module.js.map