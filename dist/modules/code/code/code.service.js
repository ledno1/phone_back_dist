"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const interface_1 = require("../../api/APIInterFace/interface");
const link_entity_1 = require("../../../entities/resource/link.entity");
const test_service_1 = require("../subHandler/test.service");
const product_entity_1 = require("../../../entities/paycode/product.entity");
const channel_service_1 = require("../../resource/channel/channel.service");
const product_service_1 = require("../product/product.service");
const kakaCheckPhone_service_1 = require("../subHandler/kakaCheckPhone.service");
let CodeService = class CodeService {
    redisService;
    entityManager;
    testService;
    channelService;
    productService;
    kakaCheckPhoneHandlerService;
    util;
    constructor(redisService, entityManager, testService, channelService, productService, kakaCheckPhoneHandlerService, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.testService = testService;
        this.channelService = channelService;
        this.productService = productService;
        this.kakaCheckPhoneHandlerService = kakaCheckPhoneHandlerService;
        this.util = util;
    }
    handlerMap = new Map();
    async onModuleInit() {
        let serviceList = [this.testService, this.kakaCheckPhoneHandlerService];
        let product = await this.entityManager.find(product_entity_1.PayCodeProduct, { select: ['id', 'name'] });
        product.forEach(product => {
            serviceList.forEach(h => {
                if (product.name.includes(h.nameKey)) {
                    this.handlerMap.set(product.id, h);
                }
            });
            if (this.handlerMap.get(product.id) == null) {
                common_1.Logger.error(`产品码${product.id}:${product.name}未绑定处理服务`);
            }
            else {
                common_1.Logger.log(`产品码${product.id}:${product.name}绑定处理服务${this.handlerMap.get(product.id).nameKey}`);
            }
        });
    }
    async createPayCodeByChannel(params, orderRedis) {
        let have = await this.entityManager.findOne(link_entity_1.Link, { where: { target: orderRedis.resource.target } });
        console.log(have);
        if (have) {
        }
        else {
            let c = await this.channelService.getChannelInfo(params.subChannel);
            if (c.productType) {
                let p = c.productType.split(',');
                let productList = await this.productService.getProductByIds(p);
                for (let i = 0; i < productList.length; i++) {
                    let result = this.createPayCodeByProduct(params, orderRedis, productList[i].id);
                    if (result) {
                        console.log("产码成功，更新缓存");
                    }
                    return;
                }
            }
            else {
                console.error(`${c.name}通道未绑定产品码`);
            }
        }
        console.log("createPayCodeByChannel 根据支付通道 产码");
    }
    async createPayCodeByProduct(params, orderRedis, productId) {
        console.log(`根据产品码${productId}创建指定产品支付码`);
        let handler = this.handlerMap.get(Number(productId));
        if (handler) {
            return await handler.result(params, orderRedis);
        }
        else {
            console.error(`产品码${productId}未绑定处理服务`);
        }
    }
    async checkOrderByProduct(params, orderRedis, productId) {
        return [];
        let handler = this.handlerMap.get(Number(productId));
        if (handler) {
            return await handler.checkOrder(params, orderRedis);
        }
    }
    async checkPhoneBalanceByChannel(orderRedis) {
        let c = await this.channelService.getChannelInfo(orderRedis.resource.channel);
        console.log(c);
        if (c.productType) {
            let p = c.productType.split(',');
            let productList = await this.productService.getProductByIds(p);
            for (let i = 0; i < productList.length; i++) {
                let result = await this.checkPhoneBalanceByProduct(orderRedis, productList[i].id);
                if (result) {
                    console.log("查余额成功");
                }
            }
        }
        else {
            console.error(`${c.name}通道未绑定产品码`);
        }
    }
    async checkPhoneBalanceByProduct(orderRedis, productId) {
        let handler = this.handlerMap.get(Number(productId));
        if (handler) {
            return await handler.result(new interface_1.SysPay(), orderRedis);
        }
        else {
            console.error(`产品码${productId}未绑定处理服务`);
        }
    }
};
CodeService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        test_service_1.TestHandlerService,
        channel_service_1.ChannelService,
        product_service_1.PayCodeProductService,
        kakaCheckPhone_service_1.KaKaCheckPhoneHandlerService,
        util_service_1.UtilService])
], CodeService);
exports.CodeService = CodeService;
//# sourceMappingURL=code.service.js.map