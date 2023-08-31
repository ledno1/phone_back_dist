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
exports.ALiPayHandlerService = exports.TopOrderRedirect = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const interface_1 = require("../APIInterFace/interface");
const InerFace_1 = require("./InerFace");
const top_service_1 = require("../../usersys/top/top.service");
const proxy_service_1 = require("../../usersys/proxy/proxy.service");
const bull_1 = require("@nestjs/bull");
const redlock_1 = __importStar(require("redlock"));
const payaccount_entity_1 = require("../../../entities/resource/payaccount.entity");
const top_entity_1 = require("../../../entities/order/top.entity");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const lodash_1 = require("lodash");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const channel_service_1 = require("../../resource/channel/channel.service");
const sys_balance_entity_1 = require("../../../entities/admin/sys-balance.entity");
const schedule_1 = require("@nestjs/schedule");
const dayjs_1 = __importDefault(require("dayjs"));
class TopOrderRedirect extends top_entity_1.TopOrder {
    url;
}
exports.TopOrderRedirect = TopOrderRedirect;
let ALiPayHandlerService = class ALiPayHandlerService {
    redisService;
    entityManager;
    topUserService;
    proxyUserService;
    orderQueue;
    paramConfigService;
    channelService;
    util;
    constructor(redisService, entityManager, topUserService, proxyUserService, orderQueue, paramConfigService, channelService, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.orderQueue = orderQueue;
        this.paramConfigService = paramConfigService;
        this.channelService = channelService;
        this.util = util;
    }
    async onModuleInit() {
        if (process.env.NODE_ENV == "development") {
            this.defaultSystemOutTime = 160;
        }
        else {
            this.defaultSystemOutTime = 280;
        }
        this.host = process.env.HOST;
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
    queueKey = "pay:user:phoneQueue";
    lastUuidKey = "pay:user:phoneLastUuid";
    redisOrderName = "aLiPayTopOrder";
    channelType = InerFace_1.ChannelType.DIRECT;
    nameKey = "直达支付";
    result(params) {
        return new Promise(async (resolve, reject) => {
            let account = null, user = null;
            let o = params.orderAmt.toString().split(".");
            console.log(o);
            let oid = "ALI_" + params.subChannel + "_" + this.util.generateUUID() + o[0].padStart(4, "0") + (o.length > 1 ? o[1].padEnd(2, "0") : "00");
            try {
                let t = Date.now();
                console.log(`${process.pid} 处理 => 支付直达,请求方${params.merId}订单号:${params.orderId},金额:${params.amount}}`);
                let res = null;
                let h = await this.haveAmount(params);
                account = await this.findMerchant(params, h, oid);
                console.log("支付账户", account.payAccount.name, "id", account.payAccount.id, `实际收到金额${account.payAccount.realAmount}`);
                await this.createOrder(params, account, oid);
                console.error("支付派生类模板耗时" + (Date.now() - t));
                let s = `${this.host}/ali.html?no=${oid}`;
                resolve(res || { code: 1, payurl: s, sysorderno: oid, orderno: params.orderId });
            }
            catch (e) {
                console.log("支付派生类模板异常", e);
                this.rollback(params, account?.payAccount, account?.merchant, oid);
                if ((0, lodash_1.isNaN)(e)) {
                    reject(61100);
                    return;
                }
                reject(e);
            }
        });
    }
    haveAmount(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let t = Date.now();
                let qb = await this.entityManager.createQueryBuilder(payaccount_entity_1.PayAccount, "payAccount")
                    .leftJoin("payAccount.SysUser", "user")
                    .select(["user.id AS id", "user.uuid as uuid", "user.username as username", "COUNT(*) AS count"])
                    .where("user.selfOpen = 1")
                    .andWhere("user.parentOpen = 1")
                    .andWhere("payAccount.open = 1")
                    .andWhere("payAccount.rechargeLimit-payAccount.lockLimit >= :amount", { amount: params.amount })
                    .andWhere("user.balance >= :amount", { amount: params.amount })
                    .groupBy("user.id")
                    .getRawMany();
                console.error(`流程0 执行是否有符合代充金额/支付宝账户,结果，耗时${Date.now() - t}`);
                if (qb.length === 0) {
                    reject(61102);
                }
                else {
                    resolve(qb.sort((a, b) => a.id - b.id));
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    findMerchant(params, payUserQueue, oid) {
        return new Promise(async (resolve, reject) => {
            let t = new Date().getTime();
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
                        console.error(`流程1 按照轮流策略 从商家队列中取出一个商家，并从该商家提取一个可收款支付宝账户 耗时${Date.now() - t}`);
                        link = await this.findPayAccountAndUpdate(params, nowUuid, oid);
                    }
                } while (!link);
                await this.redisService.getRedis().set(this.lastUuidKey, nowUuid.uuid, "EX", 60 * 60 * 24 * 365);
                if (link) {
                    resolve({
                        merchant: nowUuid,
                        payAccount: link
                    });
                    return;
                }
                reject(60004);
            }
            catch (e) {
                reject(e);
            }
            finally {
                console.error("流程耗时" + (new Date().getTime() - t));
                try {
                    await lock.release();
                }
                catch (e) {
                    console.log("释放锁失败");
                }
            }
        });
    }
    findOrder(params, user) {
        return new Promise(async (resolve, reject) => {
            console.log("执行指定用户查找代理订单");
            resolve(1);
        });
    }
    findPayAccountAndUpdate(params, user, oid) {
        return new Promise(async (resolve, reject) => {
            try {
                let { amount, subChannel, merId } = params;
                let { id, uuid } = user;
                let rate = await this.channelService.getRateByChannelId(id, subChannel, uuid);
                let rateAmount = amount * rate / 10000;
                let l = await this.entityManager.findOne(sys_user_entity_1.default, { where: { id } });
                let qb = await this.entityManager.transaction(async (entityManager) => {
                    let account = await entityManager.createQueryBuilder(payaccount_entity_1.PayAccount, "payAccount")
                        .leftJoin("payAccount.SysUser", "user")
                        .select(["payAccount.id", "payAccount.name", "payAccount.cookies", "payAccount.uid"])
                        .where("payAccount.open = 1")
                        .andWhere("payAccount.status = 1")
                        .andWhere("payAccount.rechargeLimit-payAccount.lockLimit >= :amount", { amount: params.amount })
                        .andWhere("user.id = :id", { id })
                        .orderBy("payAccount.weight", "DESC")
                        .orderBy("payAccount.updatedAt", "ASC")
                        .getOne();
                    if (account) {
                        await entityManager.query(`update pay_account set lockLimit = lockLimit + ${params.amount}, totalRecharge = totalRecharge + ${params.amount} where id = ${account.id}`);
                        await entityManager.query(`update sys_user set balance = balance - ${rateAmount} where id = ${user.id}`);
                        console.log(`流程2.1 执行指定用户查找符合的支付宝账户,${l.id}扣款前:${l.balance / 100},扣款后:${(l.balance - rateAmount) / 100}`);
                        return account;
                    }
                    else {
                        return null;
                    }
                });
                if (qb) {
                    let isOk = await this.redisService.getRedis().get(`cache:status:${qb.uid}`);
                    if (isOk && isOk == "1") {
                        let random = 1;
                        let realAmount;
                        let is;
                        let i = 0;
                        do {
                            realAmount = amount - random;
                            is = await this.redisService.getRedis().get(`realAmount:${qb.uid}:${realAmount.toString()}`);
                            i++;
                            if (1 > 50 || realAmount <= 0) {
                                break;
                            }
                            random = random + i;
                        } while (is);
                        if (i > 50 || realAmount <= 0) {
                            resolve(null);
                        }
                        else {
                            let log = new sys_balance_entity_1.SysBalanceLog();
                            log.amount = rateAmount;
                            log.uuid = uuid;
                            log.typeEnum = "reduce";
                            log.event = "topOrder";
                            log.actionUuid = "1";
                            log.orderUuid = oid;
                            log.balance = l.balance - rateAmount;
                            await this.entityManager.save(log);
                            await this.redisService.getRedis().set(`realAmount:${qb.uid}:${realAmount}`, "1", "EX", "600");
                            resolve(Object.assign(qb, { realAmount: realAmount }));
                            return;
                        }
                    }
                    else {
                        await this.entityManager.update(payaccount_entity_1.PayAccount, { id: qb.id }, { open: false, status: false });
                    }
                }
                resolve(qb);
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
            let time = await this.paramConfigService.findValueByKey("orderOutTime");
            console.log("流程3 执行创建订单,订单超时设定:" + (Number(time) + this.defaultSystemOutTime) * 1000);
            let { merchant, payAccount } = account;
            let { amount, merId, channel, subChannel, orderId, ip, notifyUrl, orderAmt } = params;
            let rate = await this.channelService.getRateByChannelId(merchant.id, subChannel, merchant.uuid);
            let order = new top_entity_1.TopOrder();
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
                order.lOid = "zfb_DIRECT_" + account.payAccount.realAmount.toString();
                order.lRate = rate;
                order.pid = payAccount.id;
                await this.entityManager.save(order);
                let appUrl = `${this.host}/alipayu.html?orderid=${oid}`;
                let qrcodeURL = encodeURIComponent(appUrl);
                let schemeURL = encodeURIComponent(`alipays://platformapi/startapp?saId=10000007&clientVersion=3.7.0.0718&qrcode=${qrcodeURL}`);
                let url = encodeURIComponent(`https://d.alipay.com/i/index.htm?pageSkin=skin-h5cashier&scheme=${schemeURL}`);
                let urlFinal = `alipays://platformapi/startapp?appId=20000691&url=${url}`;
                await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, {
                    url: urlFinal,
                    qrcode: appUrl,
                    outTime: new Date().getTime() + (Number(time) + this.defaultSystemOutTime) * 1000
                })), "EX", Number(time) + this.defaultSystemOutTime);
                await this.redisService.getRedis().set(`order:${oid}`, JSON.stringify({
                    createAt: new Date().toLocaleString(),
                    req: params,
                    order,
                    resource: payAccount,
                    user: merchant,
                    realAmount: account.payAccount.realAmount,
                    showOrder: new Date().getTime().toString().substring(-8)
                }), "EX", 600);
                await this.redisService.getRedis().sadd(this.redisOrderName, oid);
                resolve();
            }
            catch (e) {
                reject(61104);
            }
        });
    }
    rollback(params, resource, user, oid) {
        return new Promise(async (resolve, reject) => {
            console.log("回滚");
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
                        await entityManager.query(`update pay_account set lockLimit = lockLimit - ${params.amount}, totalRecharge = totalRecharge - ${params.amount} where id = ${resource.id}`);
                        await entityManager.query(`update sys_user set balance = balance + ${params.amount * rate / 10000} where id = ${user.id}`);
                        let q = await entityManager.query(`select balance from sys_user where id = ${user.id}`);
                        nowBalance = q[0].balance;
                        console.log("执行用户余额回滚,回滚后余额为" + nowBalance / 100);
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
                let { order, resource, user, req, createAt, realAmount } = params;
                console.log(`订单创建时间:${createAt},超时时间:${new Date().toLocaleString()},执行订单超时处理,订单号为${order.oid},资源为${resource.id},用户为${user.id}`);
                let r = await this.checkOrderApi(params);
                if (r) {
                    let err;
                    try {
                        let body = {
                            merId: order.mid,
                            orderId: order.mOid,
                            sysOrderId: order.oid,
                            desc: "",
                            orderAmt: req.orderAmt,
                            status: "1",
                            nonceStr: this.util.generateRandomValue(8),
                            attch: ""
                        };
                        let sign = this.util.ascesign(body, req.md5Key);
                        body["sign"] = sign;
                        let res = await this.util.requestPost(order.mNotifyUrl, body);
                        console.log("回调结果", res);
                        if (res == "success") {
                            err = false;
                        }
                        else {
                            err = JSON.stringify(res);
                        }
                    }
                    catch (e) {
                        console.log("回调失败", e);
                        common_1.Logger.error("回调失败" + JSON.stringify(e));
                        err = e.toString();
                    }
                    await this.entityManager.update(top_entity_1.TopOrder, { oid: order.oid }, {
                        status: 1,
                        callback: err ? 2 : 1,
                        callbackInfo: err ? err : ""
                    });
                }
                else {
                    await this.rollback(req, resource, user, order.oid);
                    await this.redisService.getRedis().del(`realAmount:${resource.uid}:${realAmount}`);
                    await this.entityManager.update(top_entity_1.TopOrder, { oid: order.oid }, { status: -1 });
                }
                resolve();
            }
            catch (e) {
                console.log("订单超时处理失败", e);
                reject(e);
            }
        });
    }
    checkOrder(params) {
        if (this.model == InerFace_1.ProcessModel.SERVICE)
            return Promise.resolve();
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await this.redisService.getRedis().smembers(this.redisOrderName);
                if (orders.length == 0)
                    return;
                for (let i = 0; i < orders.length; i++) {
                    console.log(`正在处理订单${orders[i]}`);
                    let orderInfo = await this.redisService.getRedis().get(`orderClient:${orders[i]}`);
                    let obj = await this.redisService.getRedis().get(`order:${orders[i]}`);
                    let orderRedis = JSON.parse(obj);
                    if (!orderInfo) {
                        this.outTime(orderRedis);
                        await this.redisService.getRedis().srem(this.redisOrderName, orders[i]);
                    }
                    else {
                        let ishave = await this.checkOrderApi(orderRedis);
                        console.log(`订单${orders[i]}是否到账:${ishave ? "是" : "否"}`);
                        if (ishave) {
                            let { order, resource, user, req, createAt, realAmount } = orderRedis;
                            let err;
                            let body = {
                                merId: order.mid,
                                orderId: order.mOid,
                                sysOrderId: order.oid,
                                desc: "",
                                orderAmt: req.orderAmt,
                                status: "1",
                                nonceStr: this.util.generateRandomValue(8),
                                attch: ""
                            };
                            let sign = this.util.ascesign(body, req.md5Key);
                            body["sign"] = sign;
                            try {
                                let res = await this.util.requestPost(order.mNotifyUrl, body);
                                console.log("回调结果", res);
                                if (res == "success") {
                                    err = false;
                                }
                                else {
                                    err = JSON.stringify(res);
                                }
                            }
                            catch (e) {
                                err = e.toString();
                            }
                            await this.entityManager.update(top_entity_1.TopOrder, { oid: orderRedis.order.oid }, {
                                status: 1,
                                callback: err ? 2 : 1,
                                callbackInfo: err ? err : ""
                            });
                            await this.redisService.getRedis().srem(this.redisOrderName, orders[i]);
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
            console.log("流程2.2 更新商家余额");
            await this.proxyUserService.updateBalance(user.uuid, params.amount, "sub");
            resolve();
        });
    }
    checkOrderApi(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let { req, order, resource, user, realAmount } = params;
                resource = resource;
                let resultList = await this.redisService.getRedis().get(`order:result:${order.oid}`);
                if (resultList) {
                    console.log("使用缓存充值订单结果");
                    resultList = JSON.parse(resultList);
                    let ishave = false;
                    if (resultList.length > 0) {
                        let real = realAmount / 100;
                        for (let i = 0; i < resultList.length; i++) {
                            if (resultList[i].tradeAmount == real.toString()) {
                                ishave = true;
                                break;
                            }
                        }
                    }
                    resolve(ishave);
                    return;
                }
                let is = await this.redisService.getRedis().get("cache:status:" + resource.uid);
                if (is == "1") {
                    let cookies = await this.redisService.getRedis().get(`cache:cookies:${resource.uid}`);
                    let ctoken = cookies.split("ctoken=")[1].split(";")[0];
                    let list = await this.requestApi(resource.uid, cookies, ctoken);
                    let ishaves = false;
                    if (!list) {
                        resolve(false);
                        return;
                    }
                    if (list.length > 0) {
                        let real = realAmount / 100;
                        for (let i = 0; i < list.length; i++) {
                            if (list[i].tradeAmount == real.toString()) {
                                ishaves = true;
                                break;
                            }
                        }
                        await this.redisService.getRedis().set(`order:result:${order.oid}`, JSON.stringify(list), "EX", 15);
                    }
                    resolve(ishaves);
                    return;
                }
                else {
                    common_1.Logger.error(`aLiPay订单查单失败,${resource.id}-${resource.name}cookies失效`);
                    resolve(false);
                }
            }
            catch (e) {
                common_1.Logger.error("订单查单失败", e, "checkOrderApi");
                resolve(false);
            }
        });
    }
    requestApi(uid, cookies, ctoken) {
        return new Promise(async (resolve, reject) => {
            try {
                let url = `https://mbillexprod.alipay.com/enterprise/fundAccountDetail.json?ctoken=${ctoken}&_output_charset=utf-8`;
                let headers = {
                    Cookie: cookies,
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Referer: "https://b.alipay.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                };
                let data = {
                    billUserId: uid,
                    startDateInput: (0, dayjs_1.default)().subtract(8, "minute").format("YYYY-MM-DD HH:mm:ss"),
                    endDateInput: (0, dayjs_1.default)().format("YYYY-MM-DD HH:mm:ss"),
                    pageNum: "1",
                    pageSize: "100",
                    showType: "0",
                    settleBillRadio: "1",
                    queryEntrance: "1",
                    querySettleAccount: false,
                    switchToFrontEnd: true,
                    accountType: "",
                    _input_charset: "gbk"
                };
                let res = await this.util.requestPost(url, data, headers);
                if (res.stat == "deny") {
                    common_1.Logger.error(`aLiPay订单查单失败,${uid}===cookies失效`);
                    await this.redisService.getRedis().set(`cache:status:${uid}`, "0");
                    resolve(false);
                    return;
                }
                if (res.status == "failed") {
                    resolve(false);
                    return;
                }
                else {
                    if (res.result?.detail) {
                        resolve(res.result?.detail);
                        return;
                    }
                }
                resolve(false);
            }
            catch (e) {
                console.error(e.toString());
                resolve(false);
            }
        });
    }
    checkOrderBySql(orderRedis) {
        return new Promise(async (resolve, reject) => {
            let order = await this.entityManager.findOne(top_entity_1.TopOrder, { where: { oid: orderRedis.order.oid } });
            console.log(order.status);
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
};
__decorate([
    (0, schedule_1.Cron)("*/10 * * * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [interface_1.SysPay]),
    __metadata("design:returntype", Promise)
], ALiPayHandlerService.prototype, "checkOrder", null);
ALiPayHandlerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __param(4, (0, bull_1.InjectQueue)("order")),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        top_service_1.TopService,
        proxy_service_1.ProxyService, Object, param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        util_service_1.UtilService])
], ALiPayHandlerService);
exports.ALiPayHandlerService = ALiPayHandlerService;
//# sourceMappingURL=aLiPayHandler.service.js.map