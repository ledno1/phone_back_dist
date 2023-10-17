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
exports.PayCodePhoneChargingHandlerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const InerFace_1 = require("./InerFace");
const redlock_1 = __importDefault(require("redlock"));
const top_service_1 = require("../../usersys/top/top.service");
const proxy_service_1 = require("../../usersys/proxy/proxy.service");
const proxyChargin_entity_1 = require("../../../entities/resource/proxyChargin.entity");
const code_service_1 = require("../../code/code/code.service");
const lodash_1 = require("lodash");
const top_entity_1 = require("../../../entities/order/top.entity");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const top_temp_entity_1 = require("../../../entities/order/top_temp.entity");
const sys_balance_entity_1 = require("../../../entities/admin/sys-balance.entity");
const channel_service_1 = require("../../resource/channel/channel.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const param_config_dto_1 = require("../../admin/system/param-config/param-config.dto");
let PayCodePhoneChargingHandlerService = class PayCodePhoneChargingHandlerService {
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
    matchTime;
    CheckModePhoneProxyChargingMaxCount;
    host;
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
    nameKey = "话费充值";
    async onModuleInit() {
        let matchTime = await this.paramConfigService.findValueByKey('PayCodePhoneProxyChargingMatchTime');
        if (!matchTime) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "PayCodePhoneProxyChargingMatchTime";
            t.key = "PayCodePhoneProxyChargingMatchTime";
            t.value = '180';
            t.remark = "PayCodePhoneProxyChargingMatchTime订单匹配时间限定设定";
            await this.paramConfigService.add(t);
            this.matchTime = 180;
        }
        else {
            this.matchTime = Number(matchTime);
        }
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
                        tempOrder.lOid = "无匹配账户";
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
    findMerchant(params, payUserQueue, oid) {
        return new Promise(async (resolve, reject) => {
            if (payUserQueue.length === 0) {
                resolve(null);
                return;
            }
            let t = 5000;
            let { desc } = params;
            if (desc == 'test') {
                t = 60000;
            }
            let lock = await this.redlock.acquire("lock", t);
            try {
                if (desc == 'test') {
                    await this.util.sleep(55 * 1000);
                }
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
    createOrder(params, account, oid) {
        return new Promise(async (resolve, reject) => {
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
                    outTime: new Date().getTime() + (this.matchTime + this.defaultSystemOutTime) * 1000
                })), "EX", this.matchTime + this.defaultSystemOutTime);
                resolve();
                return;
            }
            let { merchant, proxyCharging } = account;
            let rate = await this.channelService.getRateByChannelId(merchant.id, subChannel, merchant.uuid);
            try {
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
                    outTime: new Date().getTime() + (this.matchTime + this.defaultSystemOutTime) * 1000,
                    matchOutTime: new Date().getTime() + this.matchTime * 1000,
                    payTime: this.defaultSystemOutTime
                })), "EX", this.matchTime + this.defaultSystemOutTime);
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
PayCodePhoneChargingHandlerService = __decorate([
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
], PayCodePhoneChargingHandlerService);
exports.PayCodePhoneChargingHandlerService = PayCodePhoneChargingHandlerService;
//# sourceMappingURL=payCodePhoneChargingHandler.service.js.map