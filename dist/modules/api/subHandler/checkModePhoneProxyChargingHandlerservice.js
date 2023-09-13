"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.CheckModePhoneProxyChargingHandlerService = exports.TopOrderRedirect = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const interface_1 = require("../APIInterFace/interface");
const InerFace_1 = require("./InerFace");
const top_service_1 = require("../../usersys/top/top.service");
const proxy_service_1 = require("../../usersys/proxy/proxy.service");
const redlock_1 = __importStar(require("redlock"));
const top_entity_1 = require("../../../entities/order/top.entity");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const lodash_1 = require("lodash");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const channel_service_1 = require("../../resource/channel/channel.service");
const sys_balance_entity_1 = require("../../../entities/admin/sys-balance.entity");
const schedule_1 = require("@nestjs/schedule");
const top_temp_entity_1 = require("../../../entities/order/top_temp.entity");
const proxyChargin_entity_1 = require("../../../entities/resource/proxyChargin.entity");
const code_service_1 = require("../../code/code/code.service");
const param_config_dto_1 = require("../../admin/system/param-config/param-config.dto");
const REQ = require("request-promise-native");
class TopOrderRedirect extends top_entity_1.TopOrder {
    url;
}
exports.TopOrderRedirect = TopOrderRedirect;
let CheckModePhoneProxyChargingHandlerService = class CheckModePhoneProxyChargingHandlerService {
    redisService;
    entityManager;
    topUserService;
    proxyUserService;
    paramConfigService;
    channelService;
    util;
    codeService;
    constructor(redisService, entityManager, topUserService, proxyUserService, paramConfigService, channelService, util, codeService) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.paramConfigService = paramConfigService;
        this.channelService = channelService;
        this.util = util;
        this.codeService = codeService;
    }
    DIANXINAndLIANTONGCheck = `CheckModePhoneProxyChargingDIANXINAndLIANTONGCheck`;
    YIDONGCheck = `CheckModePhoneProxyChargingYIDONGCheck`;
    CheckModePhoneProxyChargingMaxCount;
    async onModuleInit() {
        if (process.env.NODE_ENV == "development") {
            this.defaultSystemOutTime = 160;
        }
        else {
            let timeOut = await this.paramConfigService.findValueByKey('CheckModePhoneProxyChargingPayTimeOut');
            if (!timeOut) {
                let t = new param_config_dto_1.CreateParamConfigDto();
                t.name = "CheckModePhoneProxyChargingPayTimeOut";
                t.key = "CheckModePhoneProxyChargingPayTimeOut";
                t.value = '160';
                t.remark = "CheckModePhoneProxyCharging订单超时时间设定";
                await this.paramConfigService.add(t);
                this.defaultSystemOutTime = 160;
            }
            else {
                this.defaultSystemOutTime = Number(timeOut);
            }
        }
        let CheckModePhoneProxyChargingMaxCount = await this.paramConfigService.findValueByKey('CheckModePhoneProxyChargingMaxCount');
        if (!CheckModePhoneProxyChargingMaxCount) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "CheckModePhoneProxyChargingMaxCount";
            t.key = "CheckModePhoneProxyChargingMaxCount";
            t.value = '5';
            t.remark = "拉取号码最多拉起次数，默认5次";
            await this.paramConfigService.add(t);
            this.CheckModePhoneProxyChargingMaxCount = 5;
        }
        this.CheckModePhoneProxyChargingMaxCount = Number(CheckModePhoneProxyChargingMaxCount);
        let DIANXINAndLIANTONGCheck = await this.paramConfigService.findValueByKey('CheckModePhoneProxyChargingDIANXINAndLIANTONGCheck');
        if (!DIANXINAndLIANTONGCheck) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "电信和联通查单间隔";
            t.key = "CheckModePhoneProxyChargingDIANXINAndLIANTONGCheck";
            t.value = '70';
            t.remark = "电信和联通在发放充值号码后每多少秒开始查单默认70";
            await this.paramConfigService.add(t);
        }
        let YIDONGCheck = await this.paramConfigService.findValueByKey('CheckModePhoneProxyChargingYIDONGCheck');
        if (!YIDONGCheck) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "移动查单间隔";
            t.key = "CheckModePhoneProxyChargingYIDONGCheck";
            t.value = '300';
            t.remark = "移动在发放充值号码后每多少秒开始查单默认70";
            await this.paramConfigService.add(t);
        }
        let host = await this.paramConfigService.findValueByKey('CheckModePhoneProxyChargingPayHost');
        if (!host) {
            throw new Error(`未设置${this.nameKey}收银台地址,字段名:  CheckModePhoneProxyChargingPayHost  `);
        }
        this.host = host;
        this.redlock = new redlock_1.default([this.redisService.getRedis()], {
            driftFactor: 0.01,
            retryCount: -1,
            retryDelay: 200,
            retryJitter: 200,
            automaticExtensionThreshold: 500
        });
        this.redlock.on("error", (error) => {
            if (error instanceof redlock_1.ResourceLockedError) {
                return;
            }
            common_1.Logger.error(error);
        });
        this.model = process.env.MODEL ? process.env.MODEL : InerFace_1.ProcessModel.CHECK;
    }
    model;
    defaultSystemOutTime;
    host;
    redlock = null;
    lastUuidKey = "pay:user:phoneLastUuid";
    redisOrderName = "CheckModePhone";
    channelType = InerFace_1.ChannelType.PROXY;
    nameKey = "话费代充";
    result(params, userinfo) {
        return new Promise(async (resolve, reject) => {
            let account = null, user = null;
            let { nonceStr, desc } = params;
            let o = params.orderAmt.toString().split(".");
            const timestamp = new Date().getTime();
            const randomDigits = Math.floor(Math.random() * 10000);
            let oid = "ALI-" + params.subChannel + "-" + timestamp + "-" + randomDigits + o[0].padStart(4, "0") + (o.length > 1 ? o[1].padEnd(2, "0") : "00");
            try {
                let t = Date.now();
                console.log(`${process.pid} 处理 => 代充支付,请求方${params.merId}订单号:${params.orderId},金额:${params.amount}}`);
                let res = null;
                if (nonceStr === "test" && desc != "0") {
                }
                else {
                    let h = await this.haveAmount(params);
                    console.log(h);
                    account = await this.findMerchant(params, h, oid);
                    if (account) {
                        account = account;
                        console.log("匹配订单", account?.proxyCharging?.target, "id", account?.proxyCharging?.id, `实际收到金额${(account?.proxyCharging?.amount / 100).toFixed(2)}`);
                    }
                    else {
                        console.log("无匹配订单");
                    }
                }
                await this.createOrder(params, account, oid);
                console.log("支付派生类模板耗时" + (Date.now() - t));
                let s = `${this.host}?no=${oid}`;
                resolve(res || { code: 1, payurl: s, sysorderno: oid, orderno: params.orderId });
            }
            catch (e) {
                console.error("支付派生类模板异常", e);
                this.rollback(params, account?.proxyCharging, account?.merchant, oid);
                if ((0, lodash_1.isNaN)(e)) {
                    reject(61100);
                    return;
                }
                else if (e == 61102) {
                    try {
                        let tempOrder = new top_entity_1.TopOrder();
                        tempOrder.SysUser = null;
                        tempOrder.amount = params.amount;
                        tempOrder.mid = Number(params.merId);
                        tempOrder.oid = oid;
                        tempOrder.mOid = params.orderId;
                        tempOrder.mIp = params.ip;
                        tempOrder.mNotifyUrl = params.notifyUrl;
                        tempOrder.channel = params.subChannel;
                        tempOrder.parentChannel = Number(params.channel);
                        tempOrder.lOid = "zfb_DIRECT_无匹配支付宝账户";
                        tempOrder.lRate = 0;
                        tempOrder.pid = 0;
                        tempOrder.status = -1;
                        tempOrder.callback = 0;
                        await this.entityManager.save(tempOrder);
                    }
                    catch (e) {
                    }
                }
                reject(e);
            }
        });
    }
    haveAmount(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let qb = await this.entityManager.createQueryBuilder(proxyChargin_entity_1.ProxyCharging, "proxyCharging")
                    .leftJoin("proxyCharging.SysUser", "user")
                    .select(["user.id AS id", "user.uuid as uuid", "user.username as username", "COUNT(*) AS count"])
                    .where("user.selfOpen = 1")
                    .andWhere("user.parentOpen = 1")
                    .andWhere("user.balance >= :amount", { amount: params.amount })
                    .andWhere("proxyCharging.amount = :amount", { amount: params.amount })
                    .andWhere("proxyCharging.status = 0")
                    .andWhere("proxyCharging.locking = 0")
                    .andWhere("proxyCharging.isClose = 0")
                    .andWhere(`proxyCharging.count < ${this.CheckModePhoneProxyChargingMaxCount + 1}`)
                    .andWhere("proxyCharging.parentChannel = :parentChannel", { parentChannel: params.channel })
                    .andWhere("proxyCharging.channel = :channel", { channel: params.subChannel })
                    .andWhere("proxyCharging.outTime-now() > :outTime", { outTime: this.defaultSystemOutTime })
                    .groupBy("user.id");
                console.log(qb.getSql());
                let qb2 = await qb.getRawMany();
                if (qb2.length === 0) {
                    resolve([]);
                }
                else {
                    resolve(qb2.sort((a, b) => a.id - b.id));
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    findMerchant(params, payUserQueue, oid) {
        return new Promise(async (resolve, reject) => {
            if (payUserQueue.length === 0) {
                resolve(null);
                return;
            }
            let lock = await this.redlock.acquire("lock", 5000);
            try {
                let { amount, subChannel, channel } = params;
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
                        link = await this.findProxyChargingAndUpdate(params, nowUuid, oid);
                    }
                } while (!link);
                await this.redisService.getRedis().set(this.lastUuidKey, nowUuid.uuid, "EX", 60 * 60 * 24 * 365);
                if (link) {
                    resolve({
                        merchant: nowUuid,
                        proxyCharging: link
                    });
                    return;
                }
                reject(60004);
            }
            catch (e) {
                reject(e);
            }
            finally {
                try {
                    await lock.release();
                }
                catch (e) {
                    console.error("释放锁失败");
                }
            }
        });
    }
    findProxyChargingAndUpdate(params, user, oid) {
        return new Promise(async (resolve, reject) => {
            try {
                let { amount, subChannel, merId, nonceStr, desc } = params;
                let { id, uuid } = user;
                let rate = await this.channelService.getRateByChannelId(id, subChannel, uuid);
                let rateAmount = amount * rate / 10000;
                let l = await this.entityManager.findOne(sys_user_entity_1.default, { where: { id } });
                let qb;
                if (nonceStr == "test" && desc != "0") {
                    resolve(Object.assign(qb, { realAmount: 100 }));
                    return;
                }
                else {
                    qb = await this.entityManager.transaction(async (entityManager) => {
                        let proxyCharging = await entityManager.createQueryBuilder(proxyChargin_entity_1.ProxyCharging, "proxyCharging")
                            .leftJoinAndSelect("proxyCharging.SysUser", "user")
                            .select()
                            .where("proxyCharging.isClose = 0")
                            .andWhere("proxyCharging.amount = :amount", { amount })
                            .andWhere("proxyCharging.status = 0")
                            .andWhere("proxyCharging.locking = 0")
                            .andWhere(`proxyCharging.count < ${this.CheckModePhoneProxyChargingMaxCount + 1}`)
                            .andWhere("proxyCharging.parentChannel = :parentChannel", { parentChannel: params.channel })
                            .andWhere("proxyCharging.channel = :channel", { channel: params.subChannel })
                            .andWhere("proxyCharging.outTime-now() > :outTime", { outTime: this.defaultSystemOutTime + 60 })
                            .andWhere("user.id = :id", { id })
                            .orderBy("proxyCharging.weight", "DESC")
                            .orderBy("proxyCharging.createdAt", "ASC")
                            .orderBy("proxyCharging.count", "ASC")
                            .getOne();
                        if (proxyCharging) {
                            await entityManager.query(`update proxy_charging set status = 2,locking = 1,count = count + 1  where id = ${proxyCharging.id}`);
                            await entityManager.query(`update sys_user set balance = balance - ${rateAmount} where id = ${user.id}`);
                            return proxyCharging;
                        }
                        else {
                            return null;
                        }
                    });
                }
                if (qb) {
                    let log = new sys_balance_entity_1.SysBalanceLog();
                    log.amount = rateAmount;
                    log.uuid = uuid;
                    log.typeEnum = "reduce";
                    log.event = "topOrder";
                    log.actionUuid = "1";
                    log.orderUuid = oid;
                    log.balance = l.balance - rateAmount;
                    await this.entityManager.save(log);
                }
                resolve(qb);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    findPayAccountAndUpdate(params, user, oid) {
        return new Promise(async (resolve, reject) => {
            resolve(null);
        });
    }
    getApiUrl(params) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createOrder(params, account, oid) {
        return new Promise(async (resolve, reject) => {
            let time = await this.paramConfigService.findValueByKey("orderOutTime");
            let order = new top_entity_1.TopOrder();
            let { amount, merId, channel, subChannel, orderId, ip, notifyUrl, orderAmt } = params;
            if (!account) {
                let tSysUser = new sys_user_entity_1.default();
                let tempOrder = null;
                tSysUser.id = 1;
                order.SysUser = tSysUser;
                order.amount = amount;
                order.mid = Number(merId);
                order.oid = oid;
                order.mOid = orderId;
                order.mIp = ip;
                order.mNotifyUrl = notifyUrl;
                order.channel = subChannel;
                order.parentChannel = Number(channel);
                order.lOid = "无符合代充订单";
                order.lRate = 1;
                order.pid = 1;
                order.status = -1;
                try {
                    await this.entityManager.save(order);
                }
                catch (e) {
                    if (e instanceof typeorm_2.QueryFailedError) {
                        console.error("订单号重复");
                        tempOrder = new top_entity_1.TopOrder();
                        tempOrder.SysUser = tSysUser;
                        tempOrder.amount = amount;
                        tempOrder.mid = Number(merId);
                        tempOrder.oid = oid;
                        tempOrder.mOid = this.util.generateRandomValue(2) + '重复' + orderId;
                        tempOrder.mIp = ip;
                        tempOrder.mNotifyUrl = notifyUrl;
                        tempOrder.channel = subChannel;
                        tempOrder.parentChannel = Number(channel);
                        tempOrder.lOid = "无符合代充订单";
                        tempOrder.lRate = 1;
                        tempOrder.pid = 1;
                        tempOrder.status = -1;
                        await this.entityManager.save(tempOrder);
                    }
                }
                await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, {
                    outTime: new Date().getTime() + (Number(time) + this.defaultSystemOutTime) * 1000
                })), "EX", Number(time) + this.defaultSystemOutTime);
                resolve();
                return;
            }
            let { merchant, proxyCharging } = account;
            let rate = await this.channelService.getRateByChannelId(merchant.id, subChannel, merchant.uuid);
            try {
                if ((0, lodash_1.isNaN)(Number(time))) {
                    reject(61103);
                    return;
                }
                order.SysUser = merchant;
                order.amount = amount;
                order.mid = Number(merId);
                order.oid = oid;
                order.mOid = orderId;
                order.mIp = ip;
                order.mNotifyUrl = notifyUrl;
                order.channel = subChannel;
                order.parentChannel = Number(channel);
                order.lOid = "test";
                order.lRate = rate;
                order.pid = proxyCharging.id;
                try {
                    await this.entityManager.save(order);
                }
                catch (e) {
                    if (e instanceof typeorm_2.QueryFailedError) {
                        console.error("订单号重复");
                        let tSysUser = new sys_user_entity_1.default();
                        tSysUser.id = 1;
                        let tempOrder = new top_entity_1.TopOrder();
                        tempOrder.SysUser = tSysUser;
                        tempOrder.amount = amount;
                        tempOrder.mid = Number(merId);
                        tempOrder.oid = oid;
                        tempOrder.mOid = this.util.generateRandomValue(2) + '重复' + orderId;
                        tempOrder.mIp = ip;
                        tempOrder.mNotifyUrl = notifyUrl;
                        tempOrder.channel = subChannel;
                        tempOrder.parentChannel = Number(channel);
                        tempOrder.lOid = "订单号重复";
                        tempOrder.lRate = 1;
                        tempOrder.pid = 1;
                        tempOrder.status = -1;
                        await this.entityManager.save(tempOrder);
                    }
                }
                await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, {
                    outTime: new Date().getTime() + (Number(time) + this.defaultSystemOutTime) * 1000
                })), "EX", Number(time) + this.defaultSystemOutTime);
                let orderRedis = {
                    createAt: new Date().toLocaleString(),
                    req: params,
                    order,
                    resource: proxyCharging,
                    user: merchant,
                    showOrder: new Date().getTime().toString().substring(-8)
                };
                await this.redisService.getRedis().set(`order:${oid}`, JSON.stringify(orderRedis), "EX", 600);
                await this.redisService.getRedis().sadd(this.redisOrderName, oid);
                await this.redisService.getRedis().set(`action:${oid}`, '0', "EX", 600);
                resolve();
            }
            catch (e) {
                console.log(e);
                if (e instanceof typeorm_2.QueryFailedError) {
                    console.error("订单号重复");
                    let tempOrder = new top_temp_entity_1.TopOrderTemp();
                    tempOrder.SysUser = merchant;
                    tempOrder.amount = amount;
                    tempOrder.mid = Number(merId);
                    tempOrder.oid = oid;
                    tempOrder.mOid = orderId;
                    tempOrder.mIp = ip;
                    tempOrder.mNotifyUrl = notifyUrl;
                    tempOrder.channel = subChannel;
                    tempOrder.parentChannel = Number(channel);
                    tempOrder.lOid = "test";
                    tempOrder.lRate = rate;
                    tempOrder.pid = proxyCharging.id;
                    await this.entityManager.save(tempOrder);
                }
                reject(61104);
            }
        });
    }
    rollback(params, resource, user, oid) {
        return new Promise(async (resolve, reject) => {
            try {
                if (resource) {
                    let order = await this.entityManager.findOne(top_entity_1.TopOrder, { where: { oid } });
                    if (order && (order.status == 1 || order.status == 3 || order.status == 4)) {
                        resolve();
                        return;
                    }
                    let rate = await this.channelService.getRateByChannelId(user.id, params.subChannel, user.uuid);
                    let amt = params.amount * rate / 10000;
                    let nowBalance;
                    await this.entityManager.transaction(async (entityManager) => {
                        console.log("执行资源回滚");
                        await entityManager.query(`update proxy_charging set locking =0,status = 0  where id = ${resource.id}`);
                        await entityManager.query(`update sys_user set balance = balance + ${params.amount * rate / 10000} where id = ${user.id}`);
                        let q = await entityManager.query(`select balance from sys_user where id = ${user.id}`);
                        nowBalance = q[0].balance;
                    });
                    if (nowBalance) {
                        let log = new sys_balance_entity_1.SysBalanceLog();
                        log.amount = amt;
                        log.uuid = user.uuid;
                        log.typeEnum = "add";
                        log.event = "topOrderRe";
                        log.actionUuid = "1";
                        log.orderUuid = oid;
                        log.balance = nowBalance;
                        await this.entityManager.save(log);
                    }
                }
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    outTime(params) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!params)
                    return;
                let { order, resource, user, req, createAt, realAmount } = params;
                let r = await this.checkOrderApi(params);
                if (r) {
                    await this.entityManager.update(top_entity_1.TopOrder, { oid: order.oid }, {
                        status: 1
                    });
                    let err;
                    let body = {
                        merId: order.mid,
                        orderId: order.mOid,
                        sysOrderId: order.oid,
                        desc: "1",
                        orderAmt: req.orderAmt,
                        status: "1",
                        nonceStr: this.util.generateRandomValue(8),
                        attch: "1"
                    };
                    try {
                        this.notifyRequest(order.mNotifyUrl, body, req.md5Key);
                    }
                    catch (e) {
                    }
                }
                else {
                    if (order.mIp != "1.1.1.1")
                        await this.rollback(req, resource, user, order.oid);
                    await this.entityManager.update(top_entity_1.TopOrder, { oid: order.oid }, { status: -1 });
                }
                resolve();
            }
            catch (e) {
                console.error("订单超时处理失败", e);
                reject(e);
            }
        });
    }
    checkOrder() {
        if (this.model == InerFace_1.ProcessModel.SERVICE)
            return Promise.resolve();
        return new Promise(async (resolve, reject) => {
            try {
                let info = await this.channelService.getChannelInfo(20);
                if (!info.isUse)
                    return Promise.resolve();
                console.log(`${process.pid}执行查余额代充定时查单处理${new Date().toLocaleString()}`);
                let orders = await this.redisService.getRedis().smembers(this.redisOrderName);
                if (orders.length == 0)
                    return;
                for (let i = 0; i < orders.length; i++) {
                    let orderInfo = await this.redisService.getRedis().get(`orderClient:${orders[i]}`);
                    let obj = await this.redisService.getRedis().get(`order:${orders[i]}`);
                    let orderRedis = JSON.parse(obj);
                    if (!orderInfo) {
                        await this.outTime(orderRedis);
                        await this.redisService.getRedis().srem(this.redisOrderName, orders[i]);
                    }
                    else {
                        if (orderRedis.phoneBalance) {
                            let now = new Date().getTime();
                            let t1 = await this.paramConfigService.findValueByKey(this.DIANXINAndLIANTONGCheck);
                            let t2 = await this.paramConfigService.findValueByKey(this.YIDONGCheck);
                            let r = orderRedis.resource;
                            let t = r.operator == "YIDONG" ? t2 : t1;
                            if (now - orderRedis.firstCheckTime > (Number(t)) * 1000) {
                                console.log("checkModePhoneProxyChargingHandlerService 足70秒执行二次查询");
                                orderRedis.firstCheckTime = new Date().getTime();
                                await this.redisService.getRedis().set(`order:${orderRedis.order.oid}`, JSON.stringify(orderRedis));
                                let res = await this.codeService.checkOrderByProduct(new interface_1.SysPay(), orderRedis, 4);
                                if ((0, lodash_1.isArray)(res)) {
                                    console.log(`出错了`);
                                }
                                else {
                                    let r = res;
                                    if (r.balance > Number(orderRedis.phoneBalance)) {
                                        console.log(`充值成功,执行回调,订单状态改变`);
                                        let { order, resource, user, req, createAt, realAmount } = orderRedis;
                                        await this.entityManager.update(top_entity_1.TopOrder, { oid: orderRedis.order.oid }, {
                                            oid: orderRedis.order.oid,
                                            status: 1,
                                            callback: 1
                                        });
                                        await this.entityManager.update(proxyChargin_entity_1.ProxyCharging, { id: resource.id }, {
                                            status: 1
                                        });
                                        let err;
                                        let body = {
                                            merId: order.mid,
                                            orderId: order.mOid,
                                            sysOrderId: order.oid,
                                            desc: "1",
                                            orderAmt: req.orderAmt,
                                            status: "1",
                                            nonceStr: this.util.generateRandomValue(8),
                                            attch: "1"
                                        };
                                        try {
                                            this.notifyRequest(order.mNotifyUrl, body, req.md5Key);
                                        }
                                        catch (e) {
                                        }
                                        console.log(`执行推单回调`);
                                        await this.redisService.getRedis().srem(this.redisOrderName, orders[i]);
                                    }
                                    else if (r.balance < Number(orderRedis.phoneBalance)) {
                                        console.log(`金额减少了,疑似被充值被扣费，订单当作充值成功，但不回调`);
                                        let { order, resource, user, req, createAt, realAmount } = orderRedis;
                                        await this.entityManager.update(top_entity_1.TopOrder, { oid: orderRedis.order.oid }, {
                                            status: 1
                                        });
                                        await this.entityManager.update(proxyChargin_entity_1.ProxyCharging, { id: resource.id }, {
                                            status: 1,
                                            oid: orderRedis.order.oid,
                                            errInfo: `二次查询金额减少了${Number(orderRedis.phoneBalance) - r.balance}`
                                        });
                                        await this.redisService.getRedis().srem(this.redisOrderName, orders[i]);
                                    }
                                }
                            }
                            else {
                                console.log("checkModePhoneProxyChargingHandlerService 未足70秒 ，不执行二次查询");
                            }
                        }
                        else {
                            console.log("checkModePhoneProxyChargingHandlerService 尚未查询到第一次余额 ，不执行改变后的查询");
                        }
                    }
                }
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    updateMerchant(params, user) {
        return new Promise(async (resolve, reject) => {
            await this.proxyUserService.updateBalance(user.uuid, params.amount, "sub");
            resolve();
        });
    }
    checkOrderApi(params) {
        return new Promise(async (resolve, reject) => {
            resolve(false);
        });
    }
    requestApi(uid, cookies, ctoken, name, id, accountType = 1) {
        return new Promise(async (resolve, reject) => {
            resolve(false);
        });
    }
    checkOrderBySql(orderRedis) {
        return new Promise(async (resolve, reject) => {
            let order = await this.entityManager.findOne(top_entity_1.TopOrder, { where: { oid: orderRedis.order.oid } });
            if (order && (order.status == 1 || order.status == 3 || order.status == 4)) {
                resolve(true);
            }
            else if (order && order.status == -1) {
                resolve(false);
            }
            else if (order && order.status == 2) {
                let res = await this.checkOrderApi(orderRedis);
                resolve(res);
            }
        });
    }
    async notifyRequest(url, notify, yan, time = 5, times = 3000) {
        let sign = this.util.ascesign(notify, yan);
        let form = JSON.stringify(notify);
        form = JSON.parse(form);
        form["sign"] = sign;
        let that = this;
        try {
            this.retry(that.reqCallback, time, url, form, times).then(res => {
                this.entityManager.update(top_entity_1.TopOrder, { oid: notify.sysOrderId }, {
                    callback: 1,
                    callbackInfo: "回调成功"
                });
            }).catch(e => {
                this.entityManager.update(top_entity_1.TopOrder, { oid: notify.sysOrderId }, {
                    callback: 2,
                    callbackInfo: e.msg
                });
            });
        }
        catch (e) {
        }
    }
    retry(fn, times, url, form, time) {
        return new Promise((res, rej) => {
            const attempt = (fn, url, form) => {
                fn(url, form).then(res).catch(async (error) => {
                    await this.util.sleep(time);
                    times-- > 0 ? attempt(fn, url, form) : rej(error);
                });
            };
            attempt(fn, url, form);
        });
    }
    ;
    reqCallback(url, form) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await REQ.post({ url: url, form: form });
                console.log(form.orderId + "回调结果", r);
                if (r && r === "success") {
                    resolve({
                        result: true,
                        msg: ""
                    });
                }
                reject({
                    result: false,
                    msg: r
                });
            }
            catch (error) {
                reject({
                    result: false,
                    msg: error.toString().substring(0, 30)
                });
            }
        });
    }
    async test() {
        return new Promise(async (resolve, reject) => {
            resolve(null);
        });
    }
    autoCallback(params, p) {
        return new Promise(async (resolve, reject) => {
            let orders = await this.redisService.getRedis().smembers(this.redisOrderName);
            let { type, no, money, mark, dt, idnumber, sign } = params;
            let notifyMoney = Number(money) * 100;
            if (orders.length == 0)
                return;
            let result = false;
            try {
                for (let i = 0; i < orders.length; i++) {
                    let orderInfo = await this.redisService.getRedis().get(`orderClient:${orders[i]}`);
                    if (orderInfo == null)
                        continue;
                    orderInfo = JSON.parse(orderInfo);
                    console.log("通知金额", notifyMoney, "订单金额", orderInfo.amount, "通知pid", p.id, "订单pid", orderInfo.pid);
                    if (notifyMoney == orderInfo.amount && orderInfo.pid == p.id) {
                        await this.entityManager.update(top_entity_1.TopOrder, { oid: orders[i] }, { status: 1 });
                        let obj = await this.redisService.getRedis().get(`order:${orders[i]}`);
                        let orderRedis = JSON.parse(obj);
                        let { order, resource, user, req, createAt, realAmount } = orderRedis;
                        let body = {
                            merId: order.mid,
                            orderId: order.mOid,
                            sysOrderId: order.oid,
                            desc: "1",
                            orderAmt: req.orderAmt,
                            status: "1",
                            nonceStr: this.util.generateRandomValue(8),
                            attch: "1"
                        };
                        try {
                            this.notifyRequest(order.mNotifyUrl, body, req.md5Key);
                        }
                        catch (e) {
                            console.error("回调失败", e);
                        }
                        await this.redisService.getRedis().del(`order:${orders[i]}`);
                        await this.redisService.getRedis().del(`orderClient:${orders[i]}`);
                        await this.redisService.getRedis().srem(this.redisOrderName, orders[i]);
                        result = true;
                        break;
                    }
                }
                resolve(result);
            }
            catch (e) {
                resolve(false);
            }
        });
    }
};
__decorate([
    (0, schedule_1.Cron)("*/10 * * * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CheckModePhoneProxyChargingHandlerService.prototype, "checkOrder", null);
CheckModePhoneProxyChargingHandlerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        top_service_1.TopService,
        proxy_service_1.ProxyService,
        param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        util_service_1.UtilService,
        code_service_1.CodeService])
], CheckModePhoneProxyChargingHandlerService);
exports.CheckModePhoneProxyChargingHandlerService = CheckModePhoneProxyChargingHandlerService;
//# sourceMappingURL=checkModePhoneProxyChargingHandlerservice.js.map