"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceModule = void 0;
const common_1 = require("@nestjs/common");
const zh_service_1 = require("./zh/zh.service");
const zh_controller_1 = require("./zh/zh.controller");
const bull_1 = require("@nestjs/bull");
const admin_constants_1 = require("../admin/admin.constants");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const zh_entity_1 = require("../../entities/resource/zh.entity");
const link_controller_1 = require("./link/link.controller");
const channel_controller_1 = require("./channel/channel.controller");
const link_entity_1 = require("../../entities/resource/link.entity");
const channel_entity_1 = require("../../entities/resource/channel.entity");
const link_service_1 = require("./link/link.service");
const channel_service_1 = require("./channel/channel.service");
const system_module_1 = require("../admin/system/system.module");
const group_entity_1 = require("../../entities/resource/group.entity");
const group_controller_1 = require("./group/group.controller");
const group_service_1 = require("./group/group.service");
const usersys_module_1 = require("../usersys/usersys.module");
const top_entity_1 = require("../../entities/order/top.entity");
const proxyChargincontroller_1 = require("./proxyCharging/proxyChargincontroller");
const proxyChargin_service_1 = require("./proxyCharging/proxyChargin.service");
const proxyChargin_entity_1 = require("../../entities/resource/proxyChargin.entity");
const takeLink_controller_1 = require("./takeLink/takeLink.controller");
const takeLink_service_1 = require("./takeLink/takeLink.service");
const takeLinkAPI_entity_1 = require("../../entities/resource/takeLinkAPI.entity");
const payaccount_service_1 = require("./payaccount/payaccount.service");
const payaccount_controller_1 = require("./payaccount/payaccount.controller");
const payaccount_entity_1 = require("../../entities/resource/payaccount.entity");
const backphone_entity_1 = require("../../entities/resource/backphone.entity");
const checklog_entity_1 = require("../../entities/resource/checklog.entity");
const code_service_1 = require("../code/code/code.service");
const test_service_1 = require("../code/subHandler/test.service");
const product_service_1 = require("../code/product/product.service");
const kakaCheckPhone_service_1 = require("../code/subHandler/kakaCheckPhone.service");
const ipBackList_controller_1 = require("./ipbacklist/ipBackList.controller");
const ipBackList_service_1 = require("./ipbacklist/ipBackList.service");
const backip_entity_1 = require("../../entities/resource/backip.entity");
const kakaPayCode_service_1 = require("../code/subHandler/kakaPayCode.service");
let ResourceModule = class ResourceModule {
};
ResourceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            system_module_1.SystemModule,
            usersys_module_1.UsersysModule,
            typeorm_1.TypeOrmModule.forFeature([
                zh_entity_1.ZH,
                link_entity_1.Link,
                channel_entity_1.Channel,
                group_entity_1.Group,
                top_entity_1.TopOrder,
                proxyChargin_entity_1.ProxyCharging,
                takeLinkAPI_entity_1.TakeLink,
                payaccount_entity_1.PayAccount,
                checklog_entity_1.CheckLog,
                backphone_entity_1.BackPhone,
                backip_entity_1.BackIP
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
            })
        ],
        controllers: [zh_controller_1.ZhController, link_controller_1.LinkController, channel_controller_1.ChannelController, group_controller_1.GroupController, proxyChargincontroller_1.ProxyChargingController, takeLink_controller_1.TakeLinkController, payaccount_controller_1.PayAccountController, ipBackList_controller_1.IpBackListController],
        providers: [zh_service_1.ZhService, link_service_1.LinkService, channel_service_1.ChannelService, group_service_1.GroupService, proxyChargin_service_1.ProxyChargingService, takeLink_service_1.TakeLinkService, payaccount_service_1.PayAccountService, code_service_1.CodeService, test_service_1.TestHandlerService, product_service_1.PayCodeProductService, ipBackList_service_1.IpBackListService,
            kakaCheckPhone_service_1.KaKaCheckPhoneHandlerService, kakaPayCode_service_1.KaKaPayCodeHandlerService
        ],
        exports: [zh_service_1.ZhService, link_service_1.LinkService, channel_service_1.ChannelService, group_service_1.GroupService, proxyChargin_service_1.ProxyChargingService, takeLink_service_1.TakeLinkService, payaccount_service_1.PayAccountService, ipBackList_service_1.IpBackListService]
    })
], ResourceModule);
exports.ResourceModule = ResourceModule;
//# sourceMappingURL=resource.module.js.map