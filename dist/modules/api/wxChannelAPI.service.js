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
exports.WxChannelAPIService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../shared/services/redis.service");
const util_service_1 = require("../../shared/services/util.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const top_service_1 = require("../usersys/top/top.service");
const proxy_service_1 = require("../usersys/proxy/proxy.service");
const orderTop_service_1 = require("./top/orderTop.service");
const param_config_service_1 = require("../admin/system/param-config/param-config.service");
const channel_service_1 = require("../resource/channel/channel.service");
let WxChannelAPIService = class WxChannelAPIService {
    redisService;
    entityManager;
    paramConfigService;
    channelService;
    topUserService;
    proxyUserService;
    topOrderService;
    util;
    queueKey = "pay:user:phoneQueue";
    lastUuidKey = "pay:user:phoneLastUuid";
    constructor(redisService, entityManager, paramConfigService, channelService, topUserService, proxyUserService, topOrderService, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.paramConfigService = paramConfigService;
        this.channelService = channelService;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.topOrderService = topOrderService;
        this.util = util;
    }
    async getByStrategy(body) {
        let strategy = await this.channelService.getStrategyByChannelId(body.rootChannel);
        switch (strategy) {
            case 1:
                break;
            case 2:
                break;
            default:
                let firstChannelId;
                do {
                    let subChannelId = await this.getSubChannelByQueue(body.subChannelList);
                    if (!subChannelId) {
                        throw new api_exception_1.ApiException(60011);
                    }
                    else {
                        if (!firstChannelId) {
                            firstChannelId = subChannelId;
                        }
                        else {
                            if (firstChannelId == subChannelId) {
                                throw new api_exception_1.ApiException(60013);
                            }
                        }
                    }
                    console.log("使用子通道", subChannelId);
                    let takeLinks = await this.channelService.getTakeLinkByChannelId(subChannelId);
                    if (!takeLinks || takeLinks.length == 0) {
                        throw new api_exception_1.ApiException(60011);
                    }
                    let l = await this.getLinkFromAPIByStrategy(subChannelId, takeLinks, body);
                    if (l) {
                        return l;
                    }
                } while (true);
                break;
        }
    }
    async getSubChannelByQueue(subChannelList) {
        let lastChannelId = await this.redisService.getRedis().get(`channel:wx:lastChannelId`);
        let lastChannelIndex = subChannelList.findIndex(item => item.id == lastChannelId);
        await this.redisService.getRedis().set(`channel:wx:lastChannelId`, subChannelList.length == lastChannelIndex + 1 ? subChannelList[0].id : subChannelList[lastChannelIndex + 1].id);
        return subChannelList.length == lastChannelIndex + 1 ? subChannelList[0].id : subChannelList[lastChannelIndex + 1].id;
    }
    async getSubChannelByWeight(subChannelList) {
    }
    async getSubChannelByRandom(subChannelList) {
    }
    async getLinkByStrategy(body) {
    }
    async getLinkFromAPIByStrategy(subChannelId, takeLinks, body) {
        let strategy = await this.channelService.getStrategyByChannelId(subChannelId);
        switch (strategy) {
            case 1:
                break;
            case 2:
                break;
            default:
                let firstTakeLinkId;
                do {
                    let lastTakeLinkId = await this.redisService.getRedis().get(`channel:wx:${subChannelId}:lastTakeLinkId`);
                    if (!firstTakeLinkId) {
                        firstTakeLinkId = lastTakeLinkId;
                    }
                    else {
                        if (firstTakeLinkId == lastTakeLinkId) {
                            return false;
                        }
                    }
                    let lastTakeLinkIndex = takeLinks.findIndex(item => item.id == Number(lastTakeLinkId));
                    await this.redisService.getRedis().set(`channel:wx:${subChannelId}:lastTakeLinkId`, takeLinks.length == lastTakeLinkIndex + 1 ? takeLinks[0].id : takeLinks[lastTakeLinkIndex + 1].id);
                    let link = await this.getLinkByAPIKey(takeLinks[lastTakeLinkIndex], Object.assign(body, { subChannelId }));
                    if (link) {
                        return link;
                    }
                    else {
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
    async getLinkByAPIKey(takeLink, body) {
        let result;
        if (takeLink.key == "麦当劳") {
            let t = Math.floor(new Date().getTime() / 1000);
            let sign = this.util.md5(t.toString() + "0123456789ABCDEF");
            let b = {
                t,
                sign,
                order: body.orderId,
                amount: Number(body.orderAmt)
            };
            try {
                let res = await this.util.requestPost(takeLink.url, b);
                if (res.status == 404) {
                    common_1.Logger.error("麦当劳");
                    common_1.Logger.error(res);
                }
                else if (res.status == 200) {
                    result = await this.topOrderService.createOrderMDL({
                        link: res.data.PayUrl,
                        APIOrderId: res.data.orderId,
                        amount: res.data.Price
                    }, body);
                }
            }
            catch (e) {
                common_1.Logger.error("麦当劳拉取", e);
            }
        }
        return result;
    }
};
WxChannelAPIService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        top_service_1.TopService,
        proxy_service_1.ProxyService,
        orderTop_service_1.OrderTopService,
        util_service_1.UtilService])
], WxChannelAPIService);
exports.WxChannelAPIService = WxChannelAPIService;
//# sourceMappingURL=wxChannelAPI.service.js.map