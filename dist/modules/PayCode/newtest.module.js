"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewtestModule = void 0;
const common_1 = require("@nestjs/common");
const payCode_service_1 = require("./payCode.service");
const newtest_controller_1 = require("./newtest.controller");
const bull_1 = require("@nestjs/bull");
const admin_constants_1 = require("../admin/admin.constants");
const config_1 = require("@nestjs/config");
const ws_module_1 = require("../ws/ws.module");
const typeorm_1 = require("@nestjs/typeorm");
const newtest_entity_1 = require("../../entities/newTest/newtest.entity");
const microservices_1 = require("@nestjs/microservices");
let NewtestModule = class NewtestModule {
};
NewtestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                newtest_entity_1.Newtest,
            ]),
            microservices_1.ClientsModule.register([
                { name: 'MATH_SERVICE', transport: microservices_1.Transport.TCP, options: { port: 8001 } },
            ]),
            bull_1.BullModule.registerQueueAsync({
                name: admin_constants_1.SYS_TASK_QUEUE_NAME,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    redis: {
                        host: configService.get('redis.host'),
                        port: configService.get('redis.port'),
                        password: configService.get('redis.password'),
                        db: configService.get('redis.db'),
                    },
                    prefix: admin_constants_1.SYS_TASK_QUEUE_PREFIX,
                }),
                inject: [config_1.ConfigService],
            }),
            ws_module_1.WSModule,
        ],
        controllers: [newtest_controller_1.NewtestController],
        providers: [payCode_service_1.PayCodeService]
    })
], NewtestModule);
exports.NewtestModule = NewtestModule;
//# sourceMappingURL=newtest.module.js.map