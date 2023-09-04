"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const admin_constants_1 = require("../admin/admin.constants");
const config_1 = require("@nestjs/config");
const ws_module_1 = require("../ws/ws.module");
const typeorm_1 = require("@nestjs/typeorm");
const api_controller_1 = require("./api.controller");
const orderTop_controller_1 = require("./top/orderTop.controller");
const orderSell_service_1 = require("./sell/orderSell.service");
const orderSell_controller_1 = require("./sell/orderSell.controller");
const orderTop_service_1 = require("./top/orderTop.service");
const api_service_1 = require("./api.service");
const system_module_1 = require("../admin/system/system.module");
const resource_module_1 = require("../resource/resource.module");
const usersys_module_1 = require("../usersys/usersys.module");
const orderHandler_service_1 = require("./orderHandler.service");
const path_1 = require("path");
const top_entity_1 = require("../../entities/order/top.entity");
const proxyChargingAPI_service_1 = require("./proxyChargingAPI.service");
const wxChannelAPI_service_1 = require("./wxChannelAPI.service");
const aLiPayHandler_service_1 = require("./subHandler/aLiPayHandler.service");
const handlerTemplate_service_1 = require("./subHandler/handlerTemplate.service");
const top_temp_entity_1 = require("../../entities/order/top_temp.entity");
const XiaoMangProxyChargingHandlerservice_1 = require("./subHandler/XiaoMangProxyChargingHandlerservice");
const paycode_module_1 = require("../payCode/paycode.module");
const paycode_service_1 = require("../payCode/paycode.service");
let ApiModule = class ApiModule {
};
ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            system_module_1.SystemModule,
            usersys_module_1.UsersysModule,
            resource_module_1.ResourceModule,
            paycode_module_1.PayCodeModule,
            typeorm_1.TypeOrmModule.forFeature([
                top_entity_1.TopOrder,
                top_temp_entity_1.TopOrderTemp
            ]),
            bull_1.BullModule.registerQueueAsync({
                name: 'order',
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    redis: {
                        host: configService.get("redis.host"),
                        port: configService.get("redis.port"),
                        password: configService.get("redis.password"),
                        db: configService.get("redis.db")
                    },
                    prefix: admin_constants_1.SYS_TASK_QUEUE_PREFIX,
                    processors: [(0, path_1.join)(__dirname, 'orderHandler.service.js')],
                }),
                inject: [config_1.ConfigService]
            }),
            ws_module_1.WSModule
        ],
        controllers: [orderSell_controller_1.OrderSellController, orderTop_controller_1.OrderTopController, api_controller_1.ApiController],
        providers: [orderSell_service_1.OrderSellService, orderTop_service_1.OrderTopService, api_service_1.ApiService, orderHandler_service_1.orderConsumer, proxyChargingAPI_service_1.ProxyChargingAPIService, wxChannelAPI_service_1.WxChannelAPIService, aLiPayHandler_service_1.ALiPayHandlerService, handlerTemplate_service_1.HandlerTemplateService, XiaoMangProxyChargingHandlerservice_1.XiaoMangProxyChargingHandlerservice, paycode_service_1.PayCodeService],
        exports: [orderSell_service_1.OrderSellService, orderTop_service_1.OrderTopService, api_service_1.ApiService]
    })
], ApiModule);
exports.ApiModule = ApiModule;
//# sourceMappingURL=api.module.js.map