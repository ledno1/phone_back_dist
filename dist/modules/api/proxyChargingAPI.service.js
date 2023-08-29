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
exports.ProxyChargingAPIService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../shared/services/redis.service");
const util_service_1 = require("../../shared/services/util.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const top_service_1 = require("../usersys/top/top.service");
const proxy_service_1 = require("../usersys/proxy/proxy.service");
const orderTop_service_1 = require("./top/orderTop.service");
const proxyChargin_service_1 = require("../resource/proxyCharging/proxyChargin.service");
const channel_service_1 = require("../resource/channel/channel.service");
const bull_1 = require("@nestjs/bull");
const interface_1 = require("./APIInterFace/interface");
let ProxyChargingAPIService = class ProxyChargingAPIService {
    redisService;
    entityManager;
    topUserService;
    proxyUserService;
    proxyChargingService;
    channelService;
    topOrderService;
    orderQueue;
    util;
    queueKey = "pay:user:phoneQueue";
    lastUuidKey = "pay:user:phoneLastUuid";
    constructor(redisService, entityManager, topUserService, proxyUserService, proxyChargingService, channelService, topOrderService, orderQueue, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.proxyChargingService = proxyChargingService;
        this.channelService = channelService;
        this.topOrderService = topOrderService;
        this.orderQueue = orderQueue;
        this.util = util;
    }
    async getByStrategy(body) {
        let { merId, orderAmt } = body;
        let amount = orderAmt;
        orderAmt = Number(orderAmt) * 100;
        let parentChannel = body.parentChannel.toString().padStart(2, "0");
        let buAmount = amount.toString().split(".")[0].padStart(4, "0");
        let oid = "HF_" + this.util.generateUUID() + parentChannel + buAmount;
        let strategy = await this.channelService.getStrategyByChannelId(body.rootChannel);
        console.log("根通道策略", strategy);
        for (let i = 0; i < 5; i++) {
            let proxyCharging;
            switch (strategy) {
                default:
                    proxyCharging = await this.defaultStrategy({
                        amount: orderAmt,
                        channel: body.channel,
                        parentChannel: body.parentChannel,
                        merId: merId,
                        oid: oid
                    });
            }
            if (!proxyCharging) {
                throw new api_exception_1.ApiException(60014);
            }
            let takeLinks = await this.channelService.getTakeLinkByChannelId(proxyCharging.proxyChargingInfo.channel);
            if (!takeLinks || takeLinks.length == 0) {
                throw new api_exception_1.ApiException(60011);
            }
            let l = await this.getLinkFromAPIByStrategy(proxyCharging, takeLinks, body, oid);
            if (l) {
                return Object.assign(l, { oid });
            }
        }
        throw new api_exception_1.ApiException(60014);
    }
    async defaultStrategy(linkObject) {
        let { amount, channel, parentChannel } = linkObject;
        let payUserQueue = await this.redisService.getRedis().get(this.queueKey);
        if (!payUserQueue) {
            payUserQueue = await this.topUserService.getPayUser(linkObject.amount);
            await this.redisService.getRedis().set(this.queueKey, JSON.stringify(payUserQueue), "EX", 10);
        }
        else {
            payUserQueue = JSON.parse(payUserQueue);
        }
        if (payUserQueue.length == 0) {
            common_1.Logger.error(`没有可用的代理支付 父通道:${linkObject.parentChannel} 子通道:${linkObject.channel} 金额:${linkObject.amount / 100}元 订单`);
            throw new api_exception_1.ApiException(60004);
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
            let userBalance = await this.proxyUserService.checkBalance(nowUuid.uuid, amount);
            if (userBalance) {
                link = await this.proxyChargingService.getPhoneOrder({
                    id: nowUuid.id, amount,
                    uuid: nowUuid.uuid,
                    merId: linkObject.merId,
                    oid: linkObject.oid
                });
            }
        } while (!link);
        await this.redisService.getRedis().set(this.lastUuidKey, nowUuid.uuid, "EX", 60 * 60 * 24 * 365);
        if (link) {
            await this.orderQueue.add("proxyChargingReset", link, { delay: 30000, removeOnComplete: true });
            return {
                proxyChargingInfo: link,
                user: nowUuid
            };
        }
        throw new api_exception_1.ApiException(60004);
    }
    async getLinkFromAPIByStrategy(proxyCharging, takeLinks, body, oid) {
        let strategy = await this.channelService.getStrategyByChannelId(proxyCharging.proxyChargingInfo.channel);
        switch (strategy) {
            case 1:
                takeLinks.sort((a, b) => {
                    return b.weight - a.weight;
                });
                for (let i = 0; i < takeLinks.length; i++) {
                    let link = await this.getLinkByAPIKey(takeLinks[i], Object.assign(body, { subChannelId: proxyCharging.proxyChargingInfo.channel }), proxyCharging, oid);
                    if (link) {
                        return link;
                    }
                    else {
                        console.error(takeLinks[i].name + "拉取失败");
                    }
                }
                return false;
                break;
            case 2:
                break;
            default:
                let firstTakeLinkId;
                do {
                    let lastTakeLinkId = await this.redisService.getRedis().get(`channel:phone:${proxyCharging.proxyChargingInfo.channel}:lastTakeLinkId`);
                    if (!firstTakeLinkId) {
                        firstTakeLinkId = lastTakeLinkId;
                    }
                    else {
                        if (firstTakeLinkId == lastTakeLinkId) {
                            return false;
                        }
                    }
                    let lastTakeLinkIndex = takeLinks.findIndex(item => item.id == Number(lastTakeLinkId));
                    await this.redisService.getRedis().set(`channel:phone:${proxyCharging.proxyChargingInfo.channel}:lastTakeLinkId`, takeLinks.length == lastTakeLinkIndex + 1 ? takeLinks[0].id : takeLinks[lastTakeLinkIndex + 1].id);
                    let link = await this.getLinkByAPIKey(takeLinks[lastTakeLinkIndex], Object.assign(body, { subChannelId: proxyCharging.proxyChargingInfo.channel }), proxyCharging, oid);
                    if (link) {
                        return link;
                    }
                    else {
                        console.error(takeLinks[lastTakeLinkIndex].name + "拉取失败");
                        if (takeLinks.length == lastTakeLinkIndex + 1) {
                            takeLinks = takeLinks.slice(0, lastTakeLinkIndex);
                        }
                        if (takeLinks.length == 0) {
                            return false;
                        }
                        if (takeLinks.length == 1 && takeLinks[0].id == firstTakeLinkId) {
                            return false;
                        }
                    }
                } while (true);
                break;
        }
    }
    async getLinkByAPIKey(takeLink, body, proxyCharging, oid) {
        let result;
        console.log("拉取API", takeLink.key);
        if (takeLink.key == "蚂蚁") {
            console.log("蚂蚁拉取");
            result = "http://www.baidu.com";
            await this.proxyChargingService.upDateCreateStatus(proxyCharging.proxyChargingInfo.id);
            result = await this.topOrderService.createOrderMY({
                link: result,
                APIOrderId: "123123",
                amount: body.amount
            }, body, proxyCharging, oid);
        }
        else if (takeLink.key == "KaKa") {
            const APIChannel = {
                "17": 1,
                "16": 2,
                "15": 3
            };
            const APIPayment = [
                "ALIPAY", "WXPAY", "CPAPP"
            ];
            try {
                let b = new interface_1.KaKa();
                b.user_id = 100258;
                b.order_sn = oid;
                b.channel = APIChannel[proxyCharging.proxyChargingInfo.channel.toString()];
                b.amount = proxyCharging.proxyChargingInfo.amount;
                b.ip = body.ip;
                b.payment = APIPayment[0];
                b.phone = proxyCharging.proxyChargingInfo.target;
                b.ua = "iOS";
                let res = await this.util.requestPost(takeLink.url, b, { "Content-Type": "application/json" }, 60 * 1000);
                console.log(res);
                if (res.code == 10000) {
                    result = res.data.payParams;
                    await this.proxyChargingService.upDateCreateStatus(proxyCharging.proxyChargingInfo.id);
                    result = await this.topOrderService.createOrderKaKa({
                        link: result,
                        APIOrderId: res.data.orderId,
                        amount: body.amount,
                        queryUrl: res.data.query_url ? res.data.query_url : null
                    }, body, proxyCharging, oid);
                }
                else {
                    console.error("KaKa", interface_1.KaKaCode[res.code.toString()]);
                }
            }
            catch (e) {
                console.error("KaKa", e);
            }
        }
        return result;
    }
    async proxyChargingReset(job) {
        await this.proxyChargingService.resetStatusAndLock(job.data);
    }
};
ProxyChargingAPIService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __param(7, (0, bull_1.InjectQueue)("order")),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        top_service_1.TopService,
        proxy_service_1.ProxyService,
        proxyChargin_service_1.ProxyChargingService,
        channel_service_1.ChannelService,
        orderTop_service_1.OrderTopService, Object, util_service_1.UtilService])
], ProxyChargingAPIService);
exports.ProxyChargingAPIService = ProxyChargingAPIService;
//# sourceMappingURL=proxyChargingAPI.service.js.map