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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerTemplateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const InerFace_1 = require("./InerFace");
const redlock_1 = __importDefault(require("redlock"));
const top_service_1 = require("../../usersys/top/top.service");
const proxy_service_1 = require("../../usersys/proxy/proxy.service");
const bull_1 = require("@nestjs/bull");
let HandlerTemplateService = class HandlerTemplateService {
    redisService;
    entityManager;
    topUserService;
    proxyUserService;
    orderQueue;
    util;
    constructor(redisService, entityManager, topUserService, proxyUserService, orderQueue, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.orderQueue = orderQueue;
        this.util = util;
    }
    autoCallback(params, p) {
        throw new Error("Method not implemented.");
    }
    test() {
        throw new Error("Method not implemented.");
    }
    redlock = null;
    queueKey = "pay:user:phoneQueue";
    lastUuidKey = "pay:user:phoneLastUuid";
    channelType = InerFace_1.ChannelType.PROXY;
    nameKey = "template";
    async onModuleInit() {
        if (process.env.NODE_ENV == "development") {
            this.defaultSystemOutTime = 0;
        }
        else {
            this.defaultSystemOutTime = 600;
        }
        this.redlock = new redlock_1.default([this.redisService.getRedis()], {
            driftFactor: 0.01,
            retryCount: 10,
            retryDelay: 200,
            retryJitter: 200,
            automaticExtensionThreshold: 500
        });
    }
    result(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let t = Date.now();
                console.log("支付派生类模板template");
                let res = null;
                await this.haveAmount(params);
                if (this.channelType === InerFace_1.ChannelType.PROXY) {
                    let selfProxyOrder = await this.findMerchant(params);
                    console.log("根据通道绑定的第三方API拉取平台获取支付链接,查单接口");
                    await this.getApiUrl(selfProxyOrder);
                }
                else if (this.channelType === InerFace_1.ChannelType.DIRECT) {
                    let account = await this.findMerchant(params);
                    await this.findPayAccountAndUpdate(params);
                }
                await this.createOrder(params);
                console.log("支付派生类模板耗时" + (Date.now() - t));
                resolve(res || { code: -1, payurl: "-1", sysorderno: "-1", orderno: "-1" });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    haveAmount(params) {
        return new Promise((resolve, reject) => {
            try {
                console.log("执行查询是否匹配金额的订单template" + new Date().toLocaleString());
                resolve([new InerFace_1.HaveAmount()]);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    findMerchant(params) {
        return new Promise(async (resolve, reject) => {
            let t = new Date().getTime();
            let lock = await this.redlock.acquire(["lock"], 5000);
            try {
                let { orderAmt, attch, channel } = params;
                let payUserQueue = await this.redisService.getRedis().get(this.queueKey);
                if (!payUserQueue) {
                    payUserQueue = await this.topUserService.getPayUser(Number(orderAmt) * 100);
                    await this.redisService.getRedis().set(this.queueKey, JSON.stringify(payUserQueue), "EX", 10);
                }
                else {
                    payUserQueue = JSON.parse(payUserQueue);
                }
                if (payUserQueue.length == 0) {
                    common_1.Logger.error(`没有可用的代理支付 父通道:${channel} 子通道:${attch} 金额:${Number(orderAmt)}元 订单`);
                    reject(61102);
                }
                let lastUuid = await this.redisService.getRedis().get(this.lastUuidKey);
                if (!lastUuid) {
                    lastUuid = payUserQueue[0].uuid;
                    await this.redisService.getRedis().set(this.lastUuidKey, lastUuid, "EX", 60 * 60 * 24 * 365);
                }
                let l = [];
                let index = payUserQueue.findIndex((item) => {
                    return item.uuid == lastUuid;
                });
                if (index > -1) {
                    payUserQueue = payUserQueue.slice(index + 1 > payUserQueue.length ? 0 : index + 1).concat(payUserQueue.slice(0, index + 1 > payUserQueue.length ? 0 : index + 1));
                }
                let nowUuid = null, startUid = null, link = null;
                do {
                    nowUuid = payUserQueue.shift();
                    if (!startUid) {
                        startUid = nowUuid.uuid;
                    }
                    else {
                        if (nowUuid.uuid == startUid) {
                            break;
                        }
                    }
                    payUserQueue.push(nowUuid);
                    let userBalance = await this.proxyUserService.checkBalance(nowUuid.uuid, Number(orderAmt) * 100);
                    if (userBalance) {
                        link = await this.findOrder(params);
                    }
                } while (!link);
                await this.redisService.getRedis().set(this.lastUuidKey, nowUuid.uuid, "EX", 60 * 60 * 24 * 365);
                if (link) {
                    await this.orderQueue.add("proxyChargingReset", link, { delay: 30000, removeOnComplete: true });
                    console.log("流程耗时" + (new Date().getTime() - t));
                    resolve(null);
                }
                reject(60004);
            }
            catch (e) {
                reject(e);
            }
            finally {
                await lock.release();
            }
        });
    }
    findOrder(params) {
        return new Promise(async (resolve, reject) => {
            console.log("执行指定用户查找代理订单");
            resolve(1);
        });
    }
    findPayAccountAndUpdate(params) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getApiUrl(params) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("执行获取第三方API平台拉取链接");
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createOrder(params) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("执行创建订单");
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    checkOrder(params) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    rollback(params, resource) {
        return Promise.resolve(undefined);
    }
    updateMerchant(params, user) {
        return Promise.resolve(undefined);
    }
    redisOrderName;
    defaultSystemOutTime;
    model;
    checkOrderApi(params) {
        return Promise.resolve(false);
    }
    outTime(params) {
        return Promise.resolve(undefined);
    }
    checkOrderBySql(params) {
        return Promise.resolve(false);
    }
};
HandlerTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __param(4, (0, bull_1.InjectQueue)("order")),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        top_service_1.TopService,
        proxy_service_1.ProxyService, Object, util_service_1.UtilService])
], HandlerTemplateService);
exports.HandlerTemplateService = HandlerTemplateService;
//# sourceMappingURL=handlerTemplate.service.js.map