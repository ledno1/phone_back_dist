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
exports.ApiService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../shared/services/redis.service");
const util_service_1 = require("../../shared/services/util.service");
const top_service_1 = require("../usersys/top/top.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const link_service_1 = require("../resource/link/link.service");
const param_config_service_1 = require("../admin/system/param-config/param-config.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const zh_service_1 = require("../resource/zh/zh.service");
const proxy_service_1 = require("../usersys/proxy/proxy.service");
const bull_1 = require("@nestjs/bull");
const process_1 = __importDefault(require("process"));
const orderTop_service_1 = require("./top/orderTop.service");
const channel_service_1 = require("../resource/channel/channel.service");
const proxyChargin_service_1 = require("../resource/proxyCharging/proxyChargin.service");
const handlerTemplate_service_1 = require("./subHandler/handlerTemplate.service");
const InerFace_1 = require("./subHandler/InerFace");
const aLiPayHandler_service_1 = require("./subHandler/aLiPayHandler.service");
const payaccount_entity_1 = require("../../entities/resource/payaccount.entity");
const XiaoMangProxyChargingHandlerservice_1 = require("./subHandler/XiaoMangProxyChargingHandlerservice");
const checkModePhoneProxyChargingHandlerservice_1 = require("./subHandler/checkModePhoneProxyChargingHandlerservice");
const sys_user_entity_1 = __importDefault(require("../../entities/admin/sys-user.entity"));
const param_config_dto_1 = require("../admin/system/param-config/param-config.dto");
let ApiService = class ApiService {
    redisService;
    util;
    topUserService;
    proxyUserService;
    linkService;
    topOrderService;
    zhService;
    paramConfigService;
    channelService;
    proxyChargingService;
    aLiPayHandlerService;
    handlerTemplateService;
    xiaoMangHandlerService;
    checkModePhoneHandlerService;
    entityManager;
    orderQueue;
    host = null;
    QQPAYCHANNEL;
    WXPAYCHANNEL;
    ALIAYCHANNEL;
    handlerMap = new Map();
    constructor(redisService, util, topUserService, proxyUserService, linkService, topOrderService, zhService, paramConfigService, channelService, proxyChargingService, aLiPayHandlerService, handlerTemplateService, xiaoMangHandlerService, checkModePhoneHandlerService, entityManager, orderQueue) {
        this.redisService = redisService;
        this.util = util;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.linkService = linkService;
        this.topOrderService = topOrderService;
        this.zhService = zhService;
        this.paramConfigService = paramConfigService;
        this.channelService = channelService;
        this.proxyChargingService = proxyChargingService;
        this.aLiPayHandlerService = aLiPayHandlerService;
        this.handlerTemplateService = handlerTemplateService;
        this.xiaoMangHandlerService = xiaoMangHandlerService;
        this.checkModePhoneHandlerService = checkModePhoneHandlerService;
        this.entityManager = entityManager;
        this.orderQueue = orderQueue;
    }
    appHost;
    async onModuleInit() {
        let TestOpen = await this.paramConfigService.findValueByKey(`TestOpen`);
        if (!TestOpen) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "允许拉起测试";
            t.key = `TestOpen`;
            t.value = '0';
            t.remark = "允许拉起测试";
            await this.paramConfigService.add(t);
        }
        let showPhone = await this.paramConfigService.findValueByKey('showPhone');
        if (!showPhone) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "话单模块显示";
            t.key = `showPhone`;
            t.value = '0';
            t.remark = "话单模块显示";
            await this.paramConfigService.add(t);
        }
        this.appHost = await this.paramConfigService.findValueByKey(`appHost`);
        let tempHandlerList = [this.aLiPayHandlerService, this.handlerTemplateService, this.xiaoMangHandlerService, this.checkModePhoneHandlerService];
        let channelList = await this.channelService.channelRoot();
        channelList.forEach(e => {
            if (e.name.includes("QQ")) {
                this.QQPAYCHANNEL = e.id;
            }
            else if (e.name.includes("微信")) {
                this.WXPAYCHANNEL = e.id;
            }
            else if (e.name.includes("支付宝")) {
                this.ALIAYCHANNEL = e.id;
            }
        });
        let host = process_1.default.env.PAY_HOST;
        if (!host) {
            throw new Error("未设置收银台域名");
        }
        else {
            let isLocal = host.startsWith("https://127.0") || host.startsWith("https://192.168") || host.startsWith("http://192.168") || host.startsWith("10.0") || host.startsWith("http://127.0");
            if (isLocal && process_1.default.env.NODE_ENV != "development") {
            }
        }
        this.host = host;
        if (!this.QQPAYCHANNEL)
            throw new Error("QQ支付渠道未配置");
        if (!this.WXPAYCHANNEL)
            throw new Error("微信支付渠道未配置");
        if (!this.ALIAYCHANNEL)
            throw new Error("支付宝支付渠道未配置");
        let subList = [];
        for (let i = 1; i < 4; i++) {
            let list = await this.channelService.getSubChannel(i, 0);
            subList = subList.concat(list);
        }
        subList.forEach(subChannel => {
            tempHandlerList.forEach(h => {
                if (subChannel.name.includes(h.nameKey)) {
                    this.handlerMap.set(subChannel.id, h);
                }
            });
            if (this.handlerMap.get(subChannel.id) == null) {
                common_1.Logger.error(`子通道${subChannel.id}:${subChannel.name}未绑定处理服务`);
            }
            else {
                common_1.Logger.log(`子通道${subChannel.id}:${subChannel.name}绑定处理服务${this.handlerMap.get(subChannel.id).nameKey}`);
            }
        });
    }
    async payMd5(body, user = null) {
        let { merId, sign, attch } = body;
        if (sign == "test00001111") {
            let t = await this.paramConfigService.findValueByKey(`TestOpen`);
            if (!t && t != '66666')
                throw new api_exception_1.ApiException(66666);
            if (!user)
                throw new api_exception_1.ApiException(60003);
            body.orderId = this.util.generateUUID();
            body.notifyUrl = process_1.default.env.NODE_ENV == 'development' ? `http://127.0.0.1:7001/api/test/callback` : this.appHost + `/api/test/callback`;
            body.userId = user.id.toString();
            if (body.channel == this.QQPAYCHANNEL) {
                return await this.payByQQ(body);
            }
            else if (body.channel == this.ALIAYCHANNEL) {
                return await this.payByALI(body, user);
            }
            else if (body.channel == this.WXPAYCHANNEL) {
                return await this.payByWX(body);
            }
        }
        else {
            let md5Key = await this.topUserService.getMd5Key(Number(merId));
            let sign = this.util.checkSign(body, md5Key);
            if (sign) {
                let p = body;
                p.md5Key = md5Key;
                p.amount = Number(body.orderAmt) * 100;
                attch && attch != "" && !isNaN(Number(attch)) ? p.subChannel = Number(attch) : null;
                if (body.channel == this.QQPAYCHANNEL) {
                    return await this.payByQQ(p);
                }
                else if (body.channel == this.ALIAYCHANNEL) {
                    return await this.payByALI(p);
                }
                else if (body.channel == this.WXPAYCHANNEL) {
                    return await this.payByWX(p);
                }
            }
        }
        throw new api_exception_1.ApiException(60003);
    }
    async payByALI(body, user = null) {
        let { attch, channel, subChannel } = body;
        let handlerService = this.handlerMap.get(subChannel);
        if (!handlerService) {
            console.error(`创建订单失败,请联系管理员`);
            throw new api_exception_1.ApiException(60103);
        }
        try {
            let res = await handlerService.result(body, user);
            return res;
        }
        catch (e) {
            throw new api_exception_1.ApiException(e);
        }
    }
    async payByWX(body) {
        return { code: 1, payurl: ``, sysorderno: '', orderno: body.orderId };
    }
    async payByQQ(body) {
        return { code: 1, payurl: ``, sysorderno: '', orderno: body.orderId };
    }
    async payCheck(body) {
        let { merId, orderId } = body;
        if (merId) {
            let md5Key = await this.topUserService.getMd5Key(Number(merId));
            let sign = process_1.default.env.NODE_ENV == "development" ? true : this.util.checkSign(body, md5Key);
            if (sign) {
                let o = await this.topOrderService.payCheck(orderId);
                if (o) {
                    let res = {
                        merId: merId,
                        orderId: orderId,
                        status: (o.status == 1 || o.status == 3 || o.status == 4) ? "1" : "0",
                        sysOrderId: o.oid,
                        orderAmt: (o.amount / 100).toString(),
                        nonceStr: this.util.generateRandomValue(16)
                    };
                    let sign = this.util.ascesign(res, md5Key);
                    res["sign"] = sign;
                    return res;
                }
                throw new api_exception_1.ApiException(60031);
            }
            throw new api_exception_1.ApiException(60003);
        }
        throw new api_exception_1.ApiException(60032);
    }
    async getPayUrl(params, ip) {
        let { orderid, channel, action, os } = params;
        let orderInfo = await this.redisService.getRedis().get(`orderClient:${orderid}`);
        let code = 0;
        if (action == "checkorder") {
            if (orderInfo) {
                orderInfo = JSON.parse(orderInfo);
                orderInfo = orderInfo;
                let { oid } = orderInfo;
                let subChannel = oid.split("_")[1];
                let handlerService = this.handlerMap.get(Number(subChannel));
                let obj = await this.redisService.getRedis().get(`order:${oid}`);
                let orderRedis = JSON.parse(obj);
                if (handlerService) {
                    let res = await handlerService.checkOrderBySql(orderRedis);
                    if (res) {
                        return { code: 1 };
                    }
                    else {
                        return { code: 2 };
                    }
                }
            }
            return { code: -1 };
        }
        else if (action == "orderinfo") {
            if (orderInfo) {
                orderInfo = JSON.parse(orderInfo);
                orderInfo = orderInfo;
                let { oid } = orderInfo;
                let subChannel = oid.split("_")[1];
                let handlerService = this.handlerMap.get(Number(subChannel));
                let obj = await this.redisService.getRedis().get(`order:${oid}`);
                let orderRedis = JSON.parse(obj);
                let { showOrder, createAt, req, resource, order, user, realAmount } = orderRedis;
                resource = resource;
                let res = false;
                if (handlerService) {
                    res = await handlerService.checkOrderBySql(orderRedis);
                }
                let r = await this.paramConfigService.findValueByKey("devLog");
                if (r == "1") {
                    console.log(`${ip}==${this.util.dayjs().format("YYYY-MM-DD HH:mm:ss")}==${order.mOid}到支付宝收银台,金额${order.amount / 100}元,通道${order.channel}`);
                }
                return {
                    code: 1,
                    price: (realAmount / 100).toString(),
                    orderid: order.oid,
                    userid: resource.uid,
                    createAt: createAt,
                    showOrderid: order.mOid,
                    status: res,
                    oid: order.mOid
                };
            }
            else {
                return {
                    code: 0
                };
            }
        }
        else if (action == 'matchOrderInfo') {
            if (!orderInfo)
                return { code: 3, msg: "订单超时,请重新拉取" };
            orderInfo = JSON.parse(orderInfo);
            let o = orderInfo;
            if (isNaN(Number(channel)))
                return { code: 3, msg: "订单超时,请重新拉取" };
            let handlerService = this.handlerMap.get(Number(channel));
            if (handlerService) {
                if (o.lOid != '无符合代充订单') {
                    try {
                        let r = await this.redisService.getRedis().incrby(`action:${o.oid}`, 1);
                        if (Number(r) === 1) {
                            let obj = await this.redisService.getRedis().get(`order:${o.oid}`);
                            let orderRedis = JSON.parse(obj);
                            handlerService.codeService.checkPhoneBalanceByProduct(orderRedis, 4);
                        }
                        else {
                            let obj = await this.redisService.getRedis().get(`order:${o.oid}`);
                            let orderRedis = JSON.parse(obj);
                            if (orderRedis.phoneBalance) {
                                return {
                                    code: 1,
                                    phone: orderRedis.resource.target,
                                    outTime: orderInfo.outTime
                                };
                            }
                        }
                    }
                    catch (e) {
                    }
                }
            }
            return Object.assign({ code: 0 }, { outTime: orderInfo.outTime });
        }
        else if (action == 'payat') {
            if (!orderInfo)
                return { code: 3, msg: "订单超时,请重新拉取" };
            orderInfo = JSON.parse(orderInfo);
            let o = orderInfo;
            this.topOrderService.upDateClientData(o.oid, params, ip, action);
        }
        else {
            if (!orderInfo)
                return { code: 3, msg: "订单超时,请重新拉取" };
            orderInfo = JSON.parse(orderInfo);
            let o = orderInfo;
            this.topOrderService.upDateClientData(o.oid, params, ip);
            let r = await this.paramConfigService.findValueByKey("devLog");
            if (r == "1") {
                console.log(`${ip}==${this.util.dayjs().format("YYYY-MM-DD HH:mm:ss")}==${params.os}==${o.mOid}到收银台,金额${o.amount / 100}元,通道${o.channel}`);
            }
            let mode = await this.paramConfigService.findValueByKey("aLiPayQrCode");
            return {
                code,
                msg: "ok",
                url: orderInfo.url,
                qrcode: orderInfo.qrcode,
                outTime: orderInfo.outTime,
                mode,
                mOid: o.mOid
            };
        }
    }
    async alipayNotify(params, query) {
        let checkMode = await this.paramConfigService.findValueByKey(InerFace_1.PayMode.aLiPayCheckMode);
        if (checkMode == "1") {
            let { type, no, money, mark, dt, idnumber, sign } = params;
            let { id, channel } = query;
            let p = await this.entityManager.findOne(payaccount_entity_1.PayAccount, { where: { uid: idnumber } });
            if (!p) {
                console.error(`通知 ${idnumber} 不存在 ${money}`);
                return "fail";
            }
            let md5Key = this.util.md5(p.id + p.uid);
            if (md5Key != id) {
                console.error(`通知 ${idnumber} 校验错误 ${money}`);
                return "fail";
            }
            let handlerService = this.handlerMap.get(Number(channel));
            if (!handlerService)
                return "fail";
            let r = await handlerService.autoCallback(params, p);
            return r ? "success" : "fail";
        }
    }
    async callOrder(params, cookies) {
        let { uuid } = params;
        if (!uuid) {
            return '如需补单请咨询客服获取补单链接';
        }
        let have = await this.redisService.getRedis().get(`order:callorder:${uuid}`);
        if (!have) {
            return '如需补单请咨询客服获取补单链接';
        }
        const match = cookies.match(/fingerprintID=([^;]*)/);
        if (match) {
            const fingerprintIDValue = match[1];
            return await this.topOrderService.callOrderSetLOid(fingerprintIDValue, params.uuid);
        }
        else {
            return '请使用付款时使用的浏览器访问补单链接';
        }
    }
    async directPush(params) {
        let { merId, orderId } = params;
        if (merId) {
            let md5Key = await this.topUserService.getMd5Key(Number(merId));
            if (!md5Key) {
                throw new api_exception_1.ApiException(10017);
            }
            let sign = process_1.default.env.NODE_ENV == "development" ? true : this.util.checkSign(params, md5Key);
            if (sign) {
                return await this.proxyChargingService.directPush(params);
            }
            throw new api_exception_1.ApiException(60003);
        }
    }
    async directBack(params) {
        let { merId, orderId } = params;
        if (merId) {
            let md5Key = await this.topUserService.getMd5Key(Number(merId));
            if (!md5Key) {
                throw new api_exception_1.ApiException(10017);
            }
            let sign = process_1.default.env.NODE_ENV == "development" ? true : this.util.checkSign(params, md5Key);
            if (sign) {
                return await this.proxyChargingService.directBack(params);
            }
            throw new api_exception_1.ApiException(60003);
        }
    }
    async isIpWhitelisted(ip, merId) {
        let u = await this.entityManager.findOne(sys_user_entity_1.default, { where: { id: Number(merId) } });
        if (u) {
            return u.whiteIP.includes(`0.0.0.0`) ? true : u.whiteIP.split(',').includes(ip);
        }
        return false;
    }
    sid;
    async test(params) {
        let { action } = params;
        let handlerService = this.handlerMap.get(18);
        handlerService.test();
        if (action == "start") {
            let handlerService = this.handlerMap.get(18);
            this.sid = setInterval(async () => {
                handlerService.test();
            }, 20000);
        }
        else {
            clearImmediate(this.sid);
        }
    }
};
ApiService = __decorate([
    (0, common_1.Injectable)(),
    __param(14, (0, typeorm_1.InjectEntityManager)()),
    __param(15, (0, bull_1.InjectQueue)("order")),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        util_service_1.UtilService,
        top_service_1.TopService,
        proxy_service_1.ProxyService,
        link_service_1.LinkService,
        orderTop_service_1.OrderTopService,
        zh_service_1.ZhService,
        param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        proxyChargin_service_1.ProxyChargingService,
        aLiPayHandler_service_1.ALiPayHandlerService,
        handlerTemplate_service_1.HandlerTemplateService,
        XiaoMangProxyChargingHandlerservice_1.XiaoMangProxyChargingHandlerService,
        checkModePhoneProxyChargingHandlerservice_1.CheckModePhoneProxyChargingHandlerService,
        typeorm_2.EntityManager, Object])
], ApiService);
exports.ApiService = ApiService;
//# sourceMappingURL=api.service.js.map