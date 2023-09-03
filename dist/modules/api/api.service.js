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
const sys_user_entity_1 = __importDefault(require("../../entities/admin/sys-user.entity"));
const zh_service_1 = require("../resource/zh/zh.service");
const proxy_service_1 = require("../usersys/proxy/proxy.service");
const channel_entity_1 = require("../../entities/resource/channel.entity");
const link_entity_1 = require("../../entities/resource/link.entity");
const top_entity_1 = require("../../entities/order/top.entity");
const bull_1 = require("@nestjs/bull");
const zh_entity_1 = require("../../entities/resource/zh.entity");
const process_1 = __importDefault(require("process"));
const orderTop_service_1 = require("./top/orderTop.service");
const channel_service_1 = require("../resource/channel/channel.service");
const sys_balance_entity_1 = require("../../entities/admin/sys-balance.entity");
const proxyChargingAPI_service_1 = require("./proxyChargingAPI.service");
const proxyChargin_service_1 = require("../resource/proxyCharging/proxyChargin.service");
const wxChannelAPI_service_1 = require("./wxChannelAPI.service");
const handlerTemplate_service_1 = require("./subHandler/handlerTemplate.service");
const InerFace_1 = require("./subHandler/InerFace");
const aLiPayHandler_service_1 = require("./subHandler/aLiPayHandler.service");
const payaccount_entity_1 = require("../../entities/resource/payaccount.entity");
const XiaoMangProxyChargingHandlerservice_1 = require("./subHandler/XiaoMangProxyChargingHandlerservice");
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
    proxyChargingAPI;
    proxyChargingService;
    wxChannelAPIService;
    aLiPayHandlerService;
    handlerTemplateService;
    xiaoMangHandlerService;
    entityManager;
    orderQueue;
    host = null;
    QQPAYCHANNEL;
    WXPAYCHANNEL;
    ALIAYCHANNEL;
    handlerMap = new Map();
    constructor(redisService, util, topUserService, proxyUserService, linkService, topOrderService, zhService, paramConfigService, channelService, proxyChargingAPI, proxyChargingService, wxChannelAPIService, aLiPayHandlerService, handlerTemplateService, xiaoMangHandlerService, entityManager, orderQueue) {
        this.redisService = redisService;
        this.util = util;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.linkService = linkService;
        this.topOrderService = topOrderService;
        this.zhService = zhService;
        this.paramConfigService = paramConfigService;
        this.channelService = channelService;
        this.proxyChargingAPI = proxyChargingAPI;
        this.proxyChargingService = proxyChargingService;
        this.wxChannelAPIService = wxChannelAPIService;
        this.aLiPayHandlerService = aLiPayHandlerService;
        this.handlerTemplateService = handlerTemplateService;
        this.xiaoMangHandlerService = xiaoMangHandlerService;
        this.entityManager = entityManager;
        this.orderQueue = orderQueue;
    }
    async onModuleInit() {
        let tempHandlerList = [this.aLiPayHandlerService, this.handlerTemplateService, this.xiaoMangHandlerService];
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
                throw new Error("收银台域名不能是局域网ip");
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
            if (!user)
                throw new api_exception_1.ApiException(60003);
            body.orderId = this.util.generateUUID();
            body.notifyUrl = `https://www.baidu.com`;
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
            let sign = process_1.default.env.NODE_ENV == "development" ? true : this.util.checkSign(body, md5Key);
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
        let subChannelList = await this.channelService.getSubChannel(this.ALIAYCHANNEL);
        if (!subChannelList || subChannelList.length == 0)
            throw new api_exception_1.ApiException(60011);
        let { attch, channel, subChannel } = body;
        if (attch && attch != "") {
            if (!subChannelList.find(e => e.id == subChannel && e.isUse))
                throw new api_exception_1.ApiException(60002);
        }
        else {
            let subChannelGetStrategy = await this.channelService.getChannelInfo(channel);
        }
        let handlerService = this.handlerMap.get(subChannel);
        if (!handlerService)
            throw new api_exception_1.ApiException(60103);
        try {
            let res = await handlerService.result(body, user);
            return res;
        }
        catch (e) {
            throw new api_exception_1.ApiException(e);
        }
    }
    async payByWX(body) {
        let subChannelList = await this.channelService.getSubChannel(this.WXPAYCHANNEL);
        if (!subChannelList || subChannelList.length == 0)
            throw new api_exception_1.ApiException(60011);
        let l = await this.wxChannelAPIService.getByStrategy(Object.assign(body, {
            rootChannel: this.WXPAYCHANNEL,
            subChannelList: subChannelList
        }));
        return { code: 1, payurl: `${this.host}/pay.html?no=${l.oid}`, sysorderno: l.oid, orderno: body.orderId };
    }
    async payByQQ(body) {
        let { merId, orderAmt } = body;
        let amount = orderAmt;
        orderAmt = String(Number(orderAmt) * 100);
        let haveAmount = await this.linkService.getLinkByAmount(body.orderAmt);
        if (!haveAmount)
            await this.getInstant();
        let l = await this.getLinkByStrategy({
            amount: Number(orderAmt),
            channel: Number(body.channel),
            parentChannel: Number(body.channel)
        });
        let parentChannel = body.channel.toString().padStart(2, "0");
        let buAmount = amount.toString().split(".")[0].padStart(4, "0");
        let oid = "QQ_" + this.util.generateUUID() + parentChannel + buAmount;
        common_1.Logger.log("系统订单号:" + oid);
        let order = new top_entity_1.TopOrder();
        let time = await this.paramConfigService.findValueByKey("orderOutTime");
        if (isNaN(Number(time)))
            throw new api_exception_1.ApiException(60010);
        try {
            let rate = await this.channelService.getRateByChannelId(l.user.id, l.link.channel, l.user.uuid);
            order.zh = l.zh;
            order.SysUser = l.user;
            order.amount = Number(amount) * 100;
            order.mid = Number(merId);
            order.oid = oid;
            order.mOid = body.orderId;
            order.mIp = body.ip;
            order.mNotifyUrl = body.notifyUrl;
            order.channel = l.link.channel;
            order.parentChannel = Number(body.channel);
            order.lOid = l.link.oid;
            order.lRate = rate;
            await this.entityManager.save(order);
            let log = new sys_balance_entity_1.SysBalanceLog();
            log.amount = order.amount * rate / 10000;
            log.uuid = l.user.uuid;
            log.typeEnum = "reduce";
            log.event = "topOrder";
            log.actionUuid = merId;
            log.orderUuid = order.oid;
            log.balance = l.user.balance - order.amount * rate / 10000;
            await this.entityManager.save(log);
            await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, { url: l.link.url })), "EX", time);
            await this.redisService.getRedis().set(`order:${oid}`, JSON.stringify(Object.assign(order, { url: l.link.url })), "EX", Number(time) + 600);
            await this.redisService.getRedis().sadd("topOrder", oid);
        }
        catch (e) {
            throw new api_exception_1.ApiException(60005);
        }
        finally {
            await this.orderQueue.add("orderOutTime", order, { delay: (Number(time) + 600) * 1000, removeOnComplete: true });
        }
        return { code: 1, payurl: `${this.host}/pay.html?no=${oid}`, sysorderno: oid, orderno: body.orderId };
    }
    async getInstant() {
        let instant = await this.paramConfigService.findValueByKey("instant");
        if (Boolean(Number(instant))) {
        }
        else {
            throw new api_exception_1.ApiException(60004);
        }
    }
    async getLinkByStrategy(linkObject, t = 0) {
        switch (t) {
            default:
                return await this.defaultStrategy(linkObject);
        }
    }
    async defaultStrategy(linkObject) {
        let { amount, channel, parentChannel } = linkObject;
        let payUserQueue = await this.redisService.getRedis().get("pay:user:queue");
        if (!payUserQueue) {
            payUserQueue = await this.topUserService.getPayUser(linkObject.amount);
            await this.redisService.getRedis().set("pay:user:queue", JSON.stringify(payUserQueue), "EX", 10);
        }
        else {
            payUserQueue = JSON.parse(payUserQueue);
        }
        if (payUserQueue.length == 0) {
            common_1.Logger.error(`没有可用的代理支付 父通道:${linkObject.parentChannel} 子通道:${linkObject.channel} 金额:${linkObject.amount / 100}元 订单`);
            throw new api_exception_1.ApiException(60004);
        }
        let lastUuid = await this.redisService.getRedis().get("pay:userqueue:lastUuid");
        if (!lastUuid) {
            lastUuid = payUserQueue[0].uuid;
            await this.redisService.getRedis().set("pay:userqueue:lastUuid", lastUuid, "EX", 60 * 60 * 24 * 365);
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
                link = await this.queueByUserZh(Object.assign(linkObject, { nowUuid: nowUuid }));
                if (link)
                    nowUuid.balance = userBalance.balance;
            }
        } while (!link);
        await this.redisService.getRedis().set("pay:userqueue:lastUuid", nowUuid.uuid, "EX", 60 * 60 * 24 * 365);
        if (link)
            return {
                link: link.link,
                zh: link.zh,
                user: nowUuid
            };
        throw new api_exception_1.ApiException(60004);
    }
    async queueByUserZh(linkObject) {
        let { nowUuid, amount, parentChannel } = linkObject;
        let tZhQueue = null;
        let linkLockTime = await this.paramConfigService.findValueByKey("linkLockTime");
        if (process_1.default.env.NODE_ENV == "development") {
            linkLockTime = "0";
        }
        let lastZuid = await this.redisService.getRedis().get("pay:zhqueue:lastUuid:" + nowUuid.username);
        let zhQueue = await this.redisService.getRedis().get("pay:userzh:" + nowUuid.username);
        if (!zhQueue) {
            zhQueue = await this.zhService.getZhQueueById(nowUuid.id, amount);
            tZhQueue = JSON.parse(JSON.stringify(zhQueue));
            await this.redisService.getRedis().set("pay:userzh:" + nowUuid.username, JSON.stringify(zhQueue), "EX", 60);
        }
        else {
            tZhQueue = JSON.parse(zhQueue);
            zhQueue = JSON.parse(zhQueue);
        }
        if (zhQueue.length == 0) {
            return false;
        }
        zhQueue.sort((a, b) => {
            return b.weight - a.weight;
        });
        if (zhQueue[0].weight == 0) {
            zhQueue = tZhQueue;
            let index = zhQueue.findIndex((item) => {
                return item.zuid == lastZuid;
            });
            if (index > -1) {
                zhQueue = zhQueue.slice(index + 1 > zhQueue.length ? 0 : index + 1).concat(zhQueue.slice(0, index + 1 > zhQueue.length ? 0 : index + 1));
            }
        }
        let nowZuid = null, startUid = null, link = null;
        do {
            nowZuid = zhQueue.shift();
            if (!startUid) {
                startUid = nowZuid.zuid;
            }
            else {
                if (nowZuid.zuid == startUid) {
                    break;
                }
            }
            zhQueue.push(nowZuid);
            link = await this.entityManager.transaction(async (entityManager) => {
                try {
                    let l = await entityManager.createQueryBuilder("link", "link")
                        .leftJoin("link.zh", "zh", `zh.id = ${nowZuid.id}`)
                        .leftJoin(channel_entity_1.Channel, "channel", "link.channel = channel.id")
                        .where("link.amount = :amount", { amount: amount })
                        .andWhere("link.parentChannel = :parentChannel", { parentChannel: parentChannel })
                        .andWhere("link.paymentStatus = 0")
                        .andWhere("link.createStatus = 1")
                        .andWhere("link.lockTime < :lockTime", { lockTime: new Date() })
                        .andWhere(`UNIX_TIMESTAMP(now()) < round(UNIX_TIMESTAMP(link.created_at)+ channel.expireTime)`)
                        .andWhere("zh.open = 1")
                        .andWhere(`zh.rechargeLimit - zh.lockLimit  >= ${amount}`)
                        .getOne();
                    if (l) {
                        let rate = await this.channelService.getRateByChannelId(nowUuid.id, l.channel, nowUuid.uuid);
                        let r = await entityManager.createQueryBuilder()
                            .update(link_entity_1.Link)
                            .set({
                            paymentStatus: 2,
                            lockTime: () => {
                                return `DATE_ADD(now(),INTERVAL ${linkLockTime} SECOND)`;
                            },
                            version: () => {
                                return `version + 1`;
                            }
                        })
                            .where("id = :id", { id: l.id, version: l.version })
                            .execute();
                        if (r.affected >= 1) {
                            await entityManager.createQueryBuilder()
                                .update(zh_entity_1.ZH)
                                .set({
                                lockLimit: () => {
                                    return `lockLimit + ${amount}`;
                                }
                            })
                                .where("id = :id", { id: nowZuid.id })
                                .execute();
                            let rateAmount = amount * rate / 10000;
                            await entityManager.createQueryBuilder()
                                .update(sys_user_entity_1.default)
                                .set({
                                balance: () => {
                                    return `balance - ${rateAmount}`;
                                }
                            })
                                .where("id = :id", { id: nowUuid.id })
                                .execute();
                            return l;
                        }
                    }
                    return null;
                }
                catch (e) {
                    common_1.Logger.error("事务提取链接失败");
                    common_1.Logger.error(e.toString());
                    console.log(e);
                }
            });
        } while (!link);
        await this.redisService.getRedis().set("pay:zhqueue:lastUuid:" + nowUuid.username, nowZuid.zuid, "EX", 60 * 60 * 24 * 365);
        if (link)
            return {
                link,
                zh: nowZuid
            };
        return false;
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
    async getPayUrl(params, reqs) {
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
                    console.dir(reqs.connection.remoteAddress);
                    console.log(`${this.util.dayjs().format("YYYY-MM-DD HH:mm:ss")}==${order.mOid}到支付宝收银台,金额${order.amount / 100}元,通道${order.channel}`);
                }
                return {
                    code: 1,
                    price: (realAmount / 100).toString(),
                    orderid: order.oid,
                    userid: resource.uid,
                    createAt: createAt,
                    showOrderid: order.mOid,
                    status: res
                };
            }
            else {
                return {
                    code: 0
                };
            }
        }
        else {
            if (!orderInfo)
                return { code: 3, msg: "订单超时,请重新拉取" };
            orderInfo = JSON.parse(orderInfo);
            let o = orderInfo;
            if (os && os.length > 0 && os.length <= 32 && (os == "ios" || os == "android" || os == "windows" || os == "macOS")) {
                try {
                    await this.entityManager.update(top_entity_1.TopOrder, { oid: orderInfo.oid }, { os });
                }
                catch (e) {
                    console.error("收银台更新订单客户端系统类型出错", e);
                    common_1.Logger.error("收银台更新订单客户端系统类型出错");
                    common_1.Logger.error(e.toString());
                }
            }
            let r = await this.paramConfigService.findValueByKey("devLog");
            if (r == "1") {
                console.dir(reqs.connection.remoteAddress);
                console.log(`${this.util.dayjs().format("YYYY-MM-DD HH:mm:ss")}==${params.os}==${o.mOid}到收银台,金额${o.amount / 100}元,通道${o.channel}`);
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
    __param(15, (0, typeorm_1.InjectEntityManager)()),
    __param(16, (0, bull_1.InjectQueue)("order")),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        util_service_1.UtilService,
        top_service_1.TopService,
        proxy_service_1.ProxyService,
        link_service_1.LinkService,
        orderTop_service_1.OrderTopService,
        zh_service_1.ZhService,
        param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        proxyChargingAPI_service_1.ProxyChargingAPIService,
        proxyChargin_service_1.ProxyChargingService,
        wxChannelAPI_service_1.WxChannelAPIService,
        aLiPayHandler_service_1.ALiPayHandlerService,
        handlerTemplate_service_1.HandlerTemplateService,
        XiaoMangProxyChargingHandlerservice_1.XiaoMangProxyChargingHandlerservice,
        typeorm_2.EntityManager, Object])
], ApiService);
exports.ApiService = ApiService;
//# sourceMappingURL=api.service.js.map