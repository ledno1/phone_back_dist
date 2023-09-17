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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneBalanceData = exports.BlackType = exports.PhoneBalance = exports.BlackPhoneResult = exports.BlackPhone = exports.KaKaCheckResult = exports.BalanceCode = exports.KaKaBalancePhoneOperator = exports.KaKaCheckPhoneHandlerService = void 0;
const common_1 = require("@nestjs/common");
const util_service_1 = require("../../../shared/services/util.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const proxyChargin_entity_1 = require("../../../entities/resource/proxyChargin.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const top_entity_1 = require("../../../entities/order/top.entity");
const redis_service_1 = require("../../../shared/services/redis.service");
const param_config_dto_1 = require("../../admin/system/param-config/param-config.dto");
const backphone_entity_1 = require("../../../entities/resource/backphone.entity");
const checklog_entity_1 = require("../../../entities/resource/checklog.entity");
const redlock_1 = __importStar(require("redlock"));
const retry = require('retry');
let KaKaCheckPhoneHandlerService = class KaKaCheckPhoneHandlerService {
    paramConfigService;
    entityManager;
    redis;
    util;
    constructor(paramConfigService, entityManager, redis, util) {
        this.paramConfigService = paramConfigService;
        this.entityManager = entityManager;
        this.redis = redis;
        this.util = util;
    }
    user_id;
    timeout;
    retryCount;
    retryOptions = {
        factor: 1,
        minTimeout: 3000,
        maxTimeout: 3000,
        randomize: false,
    };
    PhoneBlackListJoin;
    redlock;
    CheckModePhoneProxyChargingMaxCount;
    defaultSystemOutTime;
    async onModuleInit() {
        this.CheckModePhoneProxyChargingMaxCount = await this.paramConfigService.findValueByKey('CheckModePhoneProxyChargingMaxCount');
        this.defaultSystemOutTime = await this.paramConfigService.findValueByKey(`CheckModePhoneProxyChargingPayTimeOut`);
        this.user_id = await this.paramConfigService.findValueByKey('KaKaUser_id');
        if (!this.user_id) {
            throw new Error('KaKaUser_id 配置表中未设置');
        }
        let t = await this.paramConfigService.findValueByKey('KaKaRequestTimeout');
        if (!t) {
            let tt = new param_config_dto_1.CreateParamConfigDto();
            tt.name = "KaKa请求超时时间";
            tt.key = "KaKaRequestTimeout";
            tt.value = '30000';
            tt.remark = "KaKa请求超时时间,默认30秒";
            await this.paramConfigService.add(tt);
            this.timeout = 30000;
        }
        else {
            this.timeout = Number(t);
        }
        this.timeout = Number(t);
        let r = await this.paramConfigService.findValueByKey(`KaKaRetryCount`);
        if (!r) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "KaKa请求重试次数";
            t.key = "KaKaRetryCount";
            t.value = '2';
            t.remark = "KaKa请求重试次数,默认2次";
            await this.paramConfigService.add(t);
            this.retryCount = 2;
        }
        else {
            this.retryCount = Number(r);
        }
        let d = await this.paramConfigService.findValueByKey(`KaKaRetryDelay`);
        if (!d) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "KaKa请求重试等待时间";
            t.key = "KaKaRetryDelay";
            t.value = '2000';
            t.remark = "KaKa请求重试等待时间,默认2000毫秒";
            await this.paramConfigService.add(t);
            this.retryOptions.minTimeout = 2000;
            this.retryOptions.maxTimeout = 2000;
        }
        else {
            this.retryOptions.maxTimeout = Number(d);
            this.retryOptions.minTimeout = Number(d);
        }
        let b = await this.paramConfigService.findValueByKey(`PhoneBlackListJoin`);
        if (!b) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "无法查询余额的号码是否加入黑名单";
            t.key = "PhoneBlackListJoin";
            t.value = '1';
            t.remark = "无法查询余额的号码是否加入黑名单";
            await this.paramConfigService.add(t);
            this.PhoneBlackListJoin = true;
        }
        else {
            this.PhoneBlackListJoin = b == '1' ? true : false;
        }
        this.redlock = new redlock_1.default([this.redis.getRedis()], {
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
    }
    result(paramsD, orderRedis) {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await this.checkBalance(orderRedis);
                if (res.is) {
                    console.log("执行缓存更新");
                    this.entityManager.insert(checklog_entity_1.CheckLog, {
                        phone: orderRedis.resource.target,
                        balance: res.balance.toString(),
                    });
                    orderRedis.phoneBalance = res.balance.toString();
                    orderRedis.firstCheckTime = Date.now();
                    await this.redis.getRedis().set(`order:${orderRedis.order.oid}`, JSON.stringify(orderRedis), "EX", 360);
                    resolve(res.balance.toString());
                    return;
                }
            }
            catch (e) {
                console.log(e);
                let firstErr = e;
                console.error(`${orderRedis.resource.target}查询余额失败,最后一次原因:${e[e.length - 1].msg}`);
                if (e[e.length - 1].msg.includes(`SYSERROR`) || e[e.length - 1].msg.includes(`OTHER`) || e[e.length - 1].msg.includes(`AxiosError: timeout of`)) {
                    let a = {
                        "YIDONG": false,
                        "LIANTONG": false,
                        "DIANXIN": false
                    };
                    a[orderRedis.resource.operator] = true;
                    let arr = Object.keys(a);
                    for (let i = 0; i < arr.length; i++) {
                        console.log(`尝试${arr[i]}运营商查询余额,查询状态:${a[arr[i]]}`);
                        if (!a[arr[i]]) {
                            orderRedis.resource.operator = arr[i];
                            try {
                                let res = await this.checkBalance(orderRedis);
                                if (res.is) {
                                    console.log("执行缓存更新");
                                    this.entityManager.insert(checklog_entity_1.CheckLog, {
                                        phone: orderRedis.resource.target,
                                        balance: res.balance.toString(),
                                    });
                                    orderRedis.phoneBalance = res.balance.toString();
                                    orderRedis.firstCheckTime = Date.now();
                                    await this.redis.getRedis().set(`order:${orderRedis.order.oid}`, JSON.stringify(orderRedis), "EX", 360);
                                    resolve(res.balance.toString());
                                    return;
                                }
                            }
                            catch (e) {
                                firstErr = firstErr.concat(e);
                                a[arr[i]] = true;
                                console.log("重试出错");
                                console.log(e);
                            }
                        }
                    }
                    if (this.PhoneBlackListJoin) {
                        console.log(`尝试全部运营商余额均无法查询到,请加入黑名单`);
                        this.entityManager.insert(backphone_entity_1.BackPhone, {
                            phone: orderRedis.resource.target,
                            reason: `尝试全部运营商余额均无法查询到,请加入黑名单`
                        });
                    }
                }
                this.entityManager.update(top_entity_1.TopOrder, { oid: orderRedis.order.oid }, { errInfo: JSON.stringify(firstErr) });
                console.log(JSON.stringify(e) + "尝试重新取号匹配");
                let lock = await this.redlock.acquire("lock", 5000);
                try {
                    let { req, user } = orderRedis;
                    let params = req;
                    let { id } = user;
                    let { amount, subChannel, merId, nonceStr, desc } = params;
                    let qb = await this.entityManager.transaction(async (entityManager) => {
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
                            return proxyCharging;
                        }
                        else {
                            return null;
                        }
                    });
                    if (qb) {
                    }
                }
                catch (e) {
                    console.log('二次派号错误');
                    console.log(e);
                }
                finally {
                    try {
                        await lock.release();
                    }
                    catch (e) {
                        console.error("释放锁失败");
                    }
                }
            }
            resolve("Failed");
        });
    }
    nameKey = '天猫旗舰';
    checkOrder(params, orderRedis) {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await this.checkBalance(orderRedis);
                if (res.is) {
                    this.entityManager.insert(checklog_entity_1.CheckLog, {
                        phone: orderRedis.resource.target,
                        balance: res.balance.toString(),
                    });
                }
                resolve(res);
            }
            catch (e) {
                resolve(e);
            }
        });
    }
    checkBalanceBase(pc) {
        return new Promise(async (resolve, reject) => {
            try {
                let proxy = process.env.NODE_ENV == 'production' ? false : `socks5://127.0.0.1:7890`;
                let res = await this.util.requestPost('http://pdapi.panda763.com:1338/api/order/create', {
                    user_id: this.user_id,
                    order_sn: 1,
                    channel: KaKaBalancePhoneOperator[pc.operator],
                    payment: "WXPAY",
                    amount: 5000,
                    phone: pc.target,
                    ip: "127.0.0.1",
                    ua: "iOS",
                    prov: "1",
                }, {
                    'Content-Type': 'application/json'
                }, proxy, this.timeout);
                let result = res;
                if (result.code == BalanceCode.SUCCESS) {
                    resolve({
                        is: true,
                        balance: result.data.curFee,
                    });
                }
                else if (result.code == BalanceCode.SYSERROR) {
                    reject({
                        is: false,
                        balance: 0,
                        msg: "SYSERROR",
                        errDate: this.util.dayjsFormat(new Date())
                    });
                }
                else if (result.code == BalanceCode.IPNOTINWHITELIST) {
                    reject({
                        is: false,
                        balance: 0,
                        msg: "IPNOTINWHITELIST",
                        errDate: this.util.dayjsFormat(new Date())
                    });
                }
                else {
                    reject({
                        is: false,
                        balance: 0,
                        msg: "OTHER:" + JSON.stringify(result),
                        errDate: this.util.dayjsFormat(new Date())
                    });
                }
            }
            catch (e) {
                console.error('查询余额请求出错');
                common_1.Logger.error(`查询余额请求出错`, e);
                reject({
                    is: false,
                    balance: 0,
                    msg: e.toString(),
                    errDate: this.util.dayjsFormat(new Date())
                });
            }
        });
    }
    checkBalance(orderRedis) {
        return new Promise((resolve, reject) => {
            const operation = retry.operation({
                retries: this.retryCount,
                ...this.retryOptions,
            });
            let resultArray = [];
            operation.attempt(async (currentAttempt) => {
                console.log(`第${currentAttempt}次查询余额,${this.util.dayjsFormat(new Date())}`);
                try {
                    const result = await this.checkBalanceBase(orderRedis.resource);
                    console.log(`查询余额成功${result.balance}`);
                    resolve(result);
                    return;
                }
                catch (err) {
                    if (operation.retry(err)) {
                        resultArray.push(err);
                        return;
                    }
                    reject(resultArray);
                }
            });
        });
    }
    isBlackPhoneBase(orderRedis) {
        return new Promise(async (resolve, reject) => {
            try {
                let pc = orderRedis.resource;
                let res = await this.util.requestGet(`http://pdapi.panda763.com:1338/isBlackphone?user_id=${this.user_id}&charge_num_type=${BlackType[pc.operator]}&phone=${pc.target}`, {
                    "Content-Type": "application/x-www-form-urlencoded"
                }, this.timeout);
                let result = res;
                if (result.code == BalanceCode.SUCCESS && result.data == 'true') {
                    resolve({
                        is: true
                    });
                }
                else {
                    resolve({
                        is: false
                    });
                }
            }
            catch (e) {
                console.error('查询黑名单请求出错');
                common_1.Logger.error(`查询黑名单请求出错`, e);
                resolve({
                    is: true,
                    msg: "Failed"
                });
            }
        });
    }
    isBlackPhone(orderRedis) {
        return new Promise((resolve, reject) => {
            const operation = retry.operation({
                retries: this.retryCount,
                ...this.retryOptions,
            });
            operation.attempt(async (currentAttempt) => {
                try {
                    const result = await this.isBlackPhoneBase(orderRedis);
                    resolve(result);
                }
                catch (err) {
                    if (operation.retry(err)) {
                        return;
                    }
                    reject(err);
                }
            });
        });
    }
    checkBalanceByPhoneAndOperator(phone, operator) {
        return new Promise(async (resolve, reject) => {
            let t = new proxyChargin_entity_1.ProxyCharging();
            t.target = phone;
            t.operator = operator;
            try {
                let res = await this.checkBalanceBase(t);
                resolve(res);
            }
            catch (e) {
                resolve(e);
            }
        });
    }
};
KaKaCheckPhoneHandlerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [param_config_service_1.SysParamConfigService,
        typeorm_2.EntityManager,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], KaKaCheckPhoneHandlerService);
exports.KaKaCheckPhoneHandlerService = KaKaCheckPhoneHandlerService;
var KaKaBalancePhoneOperator;
(function (KaKaBalancePhoneOperator) {
    KaKaBalancePhoneOperator[KaKaBalancePhoneOperator["DIANXIN"] = 33] = "DIANXIN";
    KaKaBalancePhoneOperator[KaKaBalancePhoneOperator["YIDONG"] = 23] = "YIDONG";
    KaKaBalancePhoneOperator[KaKaBalancePhoneOperator["LIANTONG"] = 13] = "LIANTONG";
})(KaKaBalancePhoneOperator = exports.KaKaBalancePhoneOperator || (exports.KaKaBalancePhoneOperator = {}));
var BalanceCode;
(function (BalanceCode) {
    BalanceCode[BalanceCode["SUCCESS"] = 10000] = "SUCCESS";
    BalanceCode[BalanceCode["SYSERROR"] = 10001] = "SYSERROR";
    BalanceCode[BalanceCode["IPNOTINWHITELIST"] = 10013] = "IPNOTINWHITELIST";
    BalanceCode[BalanceCode["SELFERROR"] = 10014] = "SELFERROR";
})(BalanceCode = exports.BalanceCode || (exports.BalanceCode = {}));
class KaKaCheckResult {
    is;
    balance;
    msg;
    errDate;
}
exports.KaKaCheckResult = KaKaCheckResult;
class BlackPhone {
    code;
    data;
}
exports.BlackPhone = BlackPhone;
class BlackPhoneResult {
    is;
    msg;
}
exports.BlackPhoneResult = BlackPhoneResult;
class PhoneBalance {
    code;
    msg;
    data;
}
exports.PhoneBalance = PhoneBalance;
var BlackType;
(function (BlackType) {
    BlackType[BlackType["LIANTONG"] = 1] = "LIANTONG";
    BlackType[BlackType["YIDONG"] = 2] = "YIDONG";
    BlackType[BlackType["DIANXIN"] = 3] = "DIANXIN";
})(BlackType = exports.BlackType || (exports.BlackType = {}));
class PhoneBalanceData {
    charge_num_type;
    curFee;
}
exports.PhoneBalanceData = PhoneBalanceData;
//# sourceMappingURL=kakaCheckPhone.service.js.map