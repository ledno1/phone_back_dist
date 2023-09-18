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
const top_temp_entity_1 = require("../../../entities/order/top_temp.entity");
const admin_ws_service_1 = require("../../ws/admin-ws.service");
const code_service_1 = require("../../code/code/code.service");
const param_config_dto_1 = require("../../admin/system/param-config/param-config.dto");
const REQ = require("request-promise-native");
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
    adminWSService;
    codeService;
    constructor(redisService, entityManager, topUserService, proxyUserService, orderQueue, paramConfigService, channelService, util, adminWSService, codeService) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.topUserService = topUserService;
        this.proxyUserService = proxyUserService;
        this.orderQueue = orderQueue;
        this.paramConfigService = paramConfigService;
        this.channelService = channelService;
        this.util = util;
        this.adminWSService = adminWSService;
        this.codeService = codeService;
    }
    async onModuleInit() {
        if (process.env.NODE_ENV == "development") {
            this.defaultSystemOutTime = 160;
        }
        else {
            this.defaultSystemOutTime = 160;
        }
        this.host = process.env.PAY_HOST;
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
        let aLiPayQrCodeVersion = await this.paramConfigService.findValueByKey(`aLiPayQrCodeVersion`);
        if (!aLiPayQrCodeVersion) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "支付码版本";
            t.key = "aLiPayQrCodeVersion";
            t.value = '2';
            t.remark = "支付码版本 1 随机金额区间 2 固定金额通过char打招呼转账 ";
            await this.paramConfigService.add(t);
        }
        let aLiPayCheckModeVersion = await this.paramConfigService.findValueByKey(`aLiPayCheckModeVersion`);
        if (!aLiPayCheckModeVersion) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "支付宝cookies查单版本";
            t.key = "aLiPayCheckModeVersion";
            t.value = '2';
            t.remark = "支付宝cookies查单版本 1 随机金额区间 2 备注的订单号 ";
            await this.paramConfigService.add(t);
        }
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
    result(params, userinfo) {
        return new Promise(async (resolve, reject) => {
            let account = null, user = null;
            let { nonceStr, desc } = params;
            let o = params.orderAmt.toString().split(".");
            let oid = "ALI_" + params.subChannel + "_" + this.util.generateUUID() + o[0].padStart(4, "0") + (o.length > 1 ? o[1].padEnd(2, "0") : "00");
            try {
                let t = Date.now();
                console.log(`${process.pid} 处理 => 支付直达,请求方${params.merId}订单号:${params.orderId},金额:${params.amount}}`);
                let res = null;
                if (nonceStr === "test" && desc != "0") {
                    let u = new InerFace_1.HaveAmount();
                    u.uuid = userinfo.uuid;
                    u.id = userinfo.id;
                    u.rate = 0;
                    u.username = userinfo.username;
                    u.count = 1;
                    let h = [u];
                    params.ip = "1.1.1.1";
                    let link = await this.findPayAccountAndUpdate(params, u, oid);
                    account = {
                        merchant: u,
                        payAccount: link
                    };
                    console.log("测试订单 = 支付账户", account.payAccount.name, "id", account.payAccount.id, `实际收到金额${account.payAccount.realAmount}`);
                }
                else {
                    let h = await this.haveAmount(params);
                    account = await this.findMerchant(params, h, oid);
                    console.log("支付账户", account.payAccount.name, "id", account.payAccount.id, `实际收到金额${account.payAccount.realAmount}`);
                }
                await this.createOrder(params, account, oid);
                console.log("支付派生类模板耗时" + (Date.now() - t));
                let s = `${this.host}/ali.html?no=${oid}`;
                resolve(res || { code: 1, payurl: s, sysorderno: oid, orderno: params.orderId });
            }
            catch (e) {
                console.error("支付派生类模板异常", e);
                this.rollback(params, account?.payAccount, account?.merchant, oid);
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
            resolve(null);
        });
    }
    findPayAccountAndUpdate(params, user, oid) {
        return new Promise(async (resolve, reject) => {
            try {
                let { amount, subChannel, merId, nonceStr, desc } = params;
                let { id, uuid } = user;
                let rate = await this.channelService.getRateByChannelId(id, subChannel, uuid);
                let rateAmount = amount * rate / 10000;
                let l = await this.entityManager.findOne(sys_user_entity_1.default, { where: { id } });
                let checkMode = await this.paramConfigService.findValueByKey(InerFace_1.PayMode.aLiPayCheckMode);
                let qb;
                if (nonceStr == "test" && desc != "0") {
                    qb = await this.entityManager.transaction(async (entityManager) => {
                        let account = await entityManager.createQueryBuilder(payaccount_entity_1.PayAccount, "payAccount")
                            .select(["payAccount.id", "payAccount.name", "payAccount.cookies", "payAccount.uid", "payAccount.payMode"])
                            .where("payAccount.id = :id", { id: desc })
                            .getOne();
                        return account;
                    });
                    resolve(Object.assign(qb, { realAmount: 100 }));
                    return;
                }
                else {
                    qb = await this.entityManager.transaction(async (entityManager) => {
                        let account = await entityManager.createQueryBuilder(payaccount_entity_1.PayAccount, "payAccount")
                            .leftJoinAndSelect("payAccount.SysUser", "user")
                            .select(["payAccount.id", "payAccount.name", "payAccount.cookies", "payAccount.uid", "payAccount.payMode"])
                            .where("payAccount.open = 1")
                            .andWhere(checkMode == "1" ? "1=1" : "payAccount.status = 1")
                            .andWhere("payAccount.rechargeLimit-payAccount.lockLimit >= :amount", { amount: params.amount })
                            .andWhere("user.id = :id", { id })
                            .orderBy("payAccount.weight", "DESC")
                            .orderBy("payAccount.pullAt", "ASC")
                            .getOne();
                        if (account) {
                            await entityManager.query(`update pay_account set lockLimit = lockLimit + ${params.amount}, totalRecharge = totalRecharge + ${params.amount},pull_at = now() where id = ${account.id}`);
                            await entityManager.query(`update sys_user set balance = balance - ${rateAmount} where id = ${user.id}`);
                            return account;
                        }
                        else {
                            return null;
                        }
                    });
                }
                if (qb) {
                    let isOk = await this.redisService.getRedis().get(`cache:status:${qb.uid}`);
                    let aLiPayQrCodeVersion = await this.paramConfigService.findValueByKey('aLiPayQrCodeVersion');
                    if (checkMode == "1" || (isOk && isOk == "1")) {
                        let random = 1;
                        let realAmount = amount;
                        let is;
                        let i = 1;
                        if (aLiPayQrCodeVersion == '1') {
                            do {
                                realAmount = amount - i;
                                is = await this.redisService.getRedis().get(`realAmount:${qb.uid}:${realAmount.toString()}`);
                                i++;
                                if (i > 50) {
                                    break;
                                }
                            } while (is);
                            if (i > 50) {
                                resolve(null);
                                return;
                            }
                            await this.redisService.getRedis().set(`realAmount:${qb.uid}:${realAmount}`, "1", "EX", "360");
                        }
                        let log = new sys_balance_entity_1.SysBalanceLog();
                        log.amount = rateAmount;
                        log.uuid = uuid;
                        log.typeEnum = "reduce";
                        log.event = "topOrder";
                        log.actionUuid = "1";
                        log.orderUuid = oid;
                        log.balance = l.balance - rateAmount;
                        await this.entityManager.save(log);
                        resolve(Object.assign(qb, { realAmount: realAmount }));
                        return;
                    }
                    else {
                        this.adminWSService.noticeUserToLogout(id, qb.name);
                        await this.entityManager.update(payaccount_entity_1.PayAccount, { id: qb.id }, { open: false, status: false });
                        resolve(null);
                        return;
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
                let appUrl, urlFinal;
                let qrCodeMode = await this.paramConfigService.findValueByKey("aLiPayQrCode");
                let aLiPayQrCodeVersion = await this.paramConfigService.findValueByKey(`aLiPayQrCodeVersion`);
                if (qrCodeMode == "0") {
                    appUrl = payAccount.payMode == 1 ? `${this.host}/alipayu1.html?orderid=${oid}` : `${this.host}/alipayu.html?orderid=${oid}`;
                    let qrcodeURL = encodeURIComponent(appUrl);
                    let qrURL = `https://www.alipay.com/?appId=20000116&actionType=toAccount&sourceId=contactStage&chatUserId=${payAccount.uid}&displayName=TK&chatUserName=TK&chatLoginId=186******71&chatHeaderUrl=http://tfs.alipayobjects.com/images/partner/TB1OD00cMSJDuNj_160X160&chatUserType=1&skipAuth=true&amount=${order.amount / 100}&memo=${order.mOid}`;
                    let deCodeQrUrl = encodeURIComponent(qrURL);
                    let schemeURL = encodeURIComponent(`alipays://platformapi/startapp?saId=10000007&clientVersion=3.7.0.0718&qrcode=${aLiPayQrCodeVersion == '1' ? qrcodeURL : deCodeQrUrl}`);
                    let url = encodeURIComponent(`https://d.alipay.com/i/index.htm?pageSkin=skin-h5cashier&scheme=${schemeURL}`);
                    urlFinal = `alipays://platformapi/startapp?appId=20000691&url=${url}`;
                    await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, {
                        url: urlFinal,
                        qrcode: aLiPayQrCodeVersion == '1' ? qrcodeURL : qrURL,
                        outTime: new Date().getTime() + (Number(time) + this.defaultSystemOutTime) * 1000
                    })), "EX", Number(time) + this.defaultSystemOutTime);
                }
                else if (qrCodeMode == "1") {
                    let appUrl = "";
                    let s = await this.entityManager.findOne(payaccount_entity_1.PayAccount, { where: { id: payAccount.id } });
                    if (!s.mark || s.mark == "") {
                        console.error('该账号静态码为空');
                        reject(61106);
                        return;
                    }
                    let amountList = s.mark.split(",");
                    amountList.forEach((item) => {
                        let amount = item.split("-")[0];
                        if (amount == orderAmt || Number(amount) * 100 == params.amount) {
                            appUrl = item.split("-")[1];
                        }
                    });
                    let qrcodeURL = encodeURIComponent(appUrl);
                    urlFinal = `alipays://platformapi/startapp?saId=10000007&clientVersion=3.7.0.0718&qrcode=${qrcodeURL}`;
                    await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, {
                        url: urlFinal,
                        qrcode: appUrl,
                        outTime: new Date().getTime() + (Number(time) + this.defaultSystemOutTime) * 1000
                    })), "EX", Number(time) + this.defaultSystemOutTime);
                }
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
                    tempOrder.lOid = "zfb_DIRECT_" + account.payAccount.realAmount.toString();
                    tempOrder.lRate = rate;
                    tempOrder.pid = payAccount.id;
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
                        await entityManager.query(`update pay_account set lockLimit = lockLimit - ${params.amount}, totalRecharge = totalRecharge - ${params.amount} where id = ${resource.id}`);
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
                let checkMode = await this.paramConfigService.findValueByKey(InerFace_1.PayMode.aLiPayCheckMode);
                let r = checkMode == "1" ? false : await this.checkOrderApi(params);
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
                    await this.redisService.getRedis().del(`realAmount:${resource.uid}:${realAmount}`);
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
    checkOrder(params) {
        if (this.model == InerFace_1.ProcessModel.SERVICE)
            return Promise.resolve();
        return new Promise(async (resolve, reject) => {
            let info = await this.channelService.getChannelInfo(18);
            if (!info.isUse)
                return Promise.resolve();
            console.log(`${process.pid}执行直达支付定时查单处理`);
            let checkMode = await this.paramConfigService.findValueByKey(InerFace_1.PayMode.aLiPayCheckMode);
            if (checkMode == "1") {
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
                }
                resolve();
                return;
            }
            try {
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
                        let ishave = await this.checkOrderApi(orderRedis);
                        if (ishave) {
                            let { order, resource, user, req, createAt, realAmount } = orderRedis;
                            await this.entityManager.update(top_entity_1.TopOrder, { oid: orderRedis.order.oid }, {
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
            await this.proxyUserService.updateBalance(user.uuid, params.amount, "sub");
            resolve();
        });
    }
    checkOrderApi(params) {
        return new Promise(async (resolve, reject) => {
            let { req, order, resource, user, realAmount } = params;
            resource = resource;
            try {
                let resultList = await this.redisService.getRedis().get(`order:result:${resource.uid}`);
                let aLiPayQrCodeVersion = await this.paramConfigService.findValueByKey('aLiPayQrCodeVersion');
                if (resultList) {
                    resultList = JSON.parse(resultList);
                    let ishave = false;
                    if (resultList.length > 0) {
                        let qrCodeMode = await this.paramConfigService.findValueByKey("aLiPayQrCode");
                        if (qrCodeMode == "0") {
                            if (aLiPayQrCodeVersion == '1') {
                                let real = realAmount / 100;
                                for (let i = 0; i < resultList.length; i++) {
                                    if (resultList[i].tradeAmount == real.toFixed(2)) {
                                        ishave = true;
                                        break;
                                    }
                                }
                            }
                            else if (aLiPayQrCodeVersion == '2') {
                                let real = realAmount / 100;
                                for (let i = 0; i < resultList.length; i++) {
                                    if (order.mOid == resultList[i].transMemo && resultList[i].tradeAmount == real.toFixed(2)) {
                                        ishave = true;
                                        break;
                                    }
                                }
                            }
                        }
                        else if (qrCodeMode == "1") {
                            for (let i = 0; i < resultList.length; i++) {
                                if (order.mOid == resultList[i].transMemo) {
                                    ishave = true;
                                    break;
                                }
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
                    let list = await this.requestApi(resource.uid, cookies, ctoken, resource.name, user.id);
                    let ishaves = false;
                    if (!list) {
                        resolve(false);
                        return;
                    }
                    await this.redisService.getRedis().set(`order:result:${resource.uid}`, JSON.stringify(list), "EX", 20);
                    if (list.length > 0) {
                        let qrCodeMode = await this.paramConfigService.findValueByKey("aLiPayQrCode");
                        if (qrCodeMode == "0") {
                            if (aLiPayQrCodeVersion == '1') {
                                let real = realAmount / 100;
                                for (let i = 0; i < list.length; i++) {
                                    if (list[i].tradeAmount == real.toFixed(2)) {
                                        ishaves = true;
                                        break;
                                    }
                                }
                            }
                            else if (aLiPayQrCodeVersion == '2') {
                                let real = realAmount / 100;
                                for (let i = 0; i < list.length; i++) {
                                    if (order.mOid == list[i].transMemo && list[i].tradeAmount == real.toFixed(2)) {
                                        ishaves = true;
                                        break;
                                    }
                                }
                            }
                        }
                        else if (qrCodeMode == "1") {
                            for (let i = 0; i < list.length; i++) {
                                if (order.mOid == list[i].transMemo) {
                                    ishaves = true;
                                    break;
                                }
                            }
                        }
                    }
                    resolve(ishaves);
                    return;
                }
                else {
                    console.error(`aLiPay订单查单失败,${resource.id}-${resource.name}cookies失效`);
                    common_1.Logger.error(`aLiPay订单查单失败,${resource.id}-${resource.name}cookies失效`);
                    resolve(false);
                }
            }
            catch (e) {
                console.error("订单查单失败", e);
                common_1.Logger.error("订单查单失败", e, "checkOrderApi");
                resolve(false);
            }
        });
    }
    requestApi(uid, cookies, ctoken, name, id, accountType = 1) {
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
                    startDateInput: (0, dayjs_1.default)().subtract(4, "minute").add(40, "seconds").format("YYYY-MM-DD HH:mm:ss"),
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
                if (accountType == 0) {
                }
                let isproxy = await this.paramConfigService.findValueByKey("isProxy");
                let p = false;
                if (isproxy == "1") {
                    p = `socks://socks5:socks5@45.89.230.134:5555`;
                }
                let res = await this.util.requestPost(url, data, headers, p);
                if (res.stat == "deny") {
                    console.error(`aLiPay订单查单失败,${uid}|${name} =>  cookies失效`);
                    common_1.Logger.error(`aLiPay订单查单失败,${uid}|${name} => cookies失效`);
                    this.adminWSService.noticeUserToLogout(id, name);
                    await this.redisService.getRedis().set(`cache:status:${uid}`, "0");
                    resolve(false);
                    return;
                }
                if (res.status == "failed") {
                    console.error(`${uid}|${name} => aLiPay订单查单失败,频繁等待90秒`);
                    this.adminWSService.noticeUserToLogout(id, name);
                    await this.redisService.getRedis().set(`order:result:${uid}`, JSON.stringify([]), "EX", 90);
                    resolve(false);
                    return;
                }
                else {
                    if (res.result?.detail) {
                        let r = await this.paramConfigService.findValueByKey("devLog");
                        if (r == "1")
                            console.log(`${uid}|${name} => aLiPay订单查单成功`, res.result?.detail);
                        resolve(res.result?.detail);
                        return;
                    }
                }
                resolve(false);
            }
            catch (e) {
                console.error(`查单失败${uid}|${name}请求超时` + "requestApi" + e.toString());
                await this.redisService.getRedis().set(`order:result:${uid}`, JSON.stringify([]), "EX", 20);
                common_1.Logger.error(e);
                resolve(false);
            }
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
        this.adminWSService.noticeUserToLogout(1, "测试");
        return;
        let zfbList = await this.entityManager.find(payaccount_entity_1.PayAccount);
        for (let i = 0; i < zfbList.length; i++) {
            let cookies = await this.redisService.getRedis().get(`cache:cookies:${zfbList[i].uid}`);
            if (cookies) {
                let ctoken = cookies.split("ctoken=")[1].split(";")[0];
                this.requestApi(zfbList[i].uid, cookies, ctoken, zfbList[i].name, 1);
            }
        }
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
        util_service_1.UtilService,
        admin_ws_service_1.AdminWSService,
        code_service_1.CodeService])
], ALiPayHandlerService);
exports.ALiPayHandlerService = ALiPayHandlerService;
//# sourceMappingURL=aLiPayHandler.service.js.map