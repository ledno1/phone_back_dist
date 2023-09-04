"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayCodeModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const admin_constants_1 = require("../admin/admin.constants");
const config_1 = require("@nestjs/config");
const ws_module_1 = require("../ws/ws.module");
const typeorm_1 = require("@nestjs/typeorm");
const paycode_controller_1 = require("./paycode.controller");
const paycode_service_1 = require("./paycode.service");
const proxy_controller_1 = require("./proxy/proxy.controller");
const proxy_service_1 = require("./proxy/proxy.service");
const account_controller_1 = require("./account/account.controller");
const account_service_1 = require("./account/account.service");
const product_controller_1 = require("./product/product.controller");
const product_service_1 = require("./product/product.service");
const channel_service_1 = require("../resource/channel/channel.service");
const resource_module_1 = require("../resource/resource.module");
const usersys_module_1 = require("../usersys/usersys.module");
const system_module_1 = require("../admin/system/system.module");
const channel_entity_1 = require("../../entities/resource/channel.entity");
const product_entity_1 = require("../../entities/paycode/product.entity");
let PayCodeModule = class PayCodeModule {
};
PayCodeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            system_module_1.SystemModule,
            usersys_module_1.UsersysModule,
            resource_module_1.ResourceModule,
            typeorm_1.TypeOrmModule.forFeature([
                channel_entity_1.Channel,
                product_entity_1.PayCodeProduct,
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
        controllers: [paycode_controller_1.PayCodeController, proxy_controller_1.PayCodeProxyController, account_controller_1.PayCodeAccountController, product_controller_1.PayCodeProductController],
        providers: [paycode_service_1.PayCodeService, proxy_service_1.PayCodeProxyService, account_service_1.PayCodeAccountService, product_service_1.PayCodeProductService, channel_service_1.ChannelService],
        exports: [paycode_service_1.PayCodeService],
    })
], PayCodeModule);
exports.PayCodeModule = PayCodeModule;
//# sourceMappingURL=paycode.module.js.map