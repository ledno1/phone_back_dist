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
exports.PhoneBalanceData = exports.BlackType = exports.PhoneBalance = exports.BlackPhoneResult = exports.BlackPhone = exports.KaKaCheckResult = exports.BalanceCode = exports.KaKaBalancePhoneOperator = exports.KaKaCheckPhoneHandlerService = void 0;
const common_1 = require("@nestjs/common");
const util_service_1 = require("../../../shared/services/util.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const top_entity_1 = require("../../../entities/order/top.entity");
const redis_service_1 = require("../../../shared/services/redis.service");
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
    async onModuleInit() {
        this.user_id = await this.paramConfigService.findValueByKey('KaKaUser_id');
        if (!this.user_id) {
            throw new Error('KaKaUser_id 配置表中未设置');
        }
        let t = await this.paramConfigService.findValueByKey('KaKaRequestTimeout');
        if (!t) {
            throw new Error('KaKaRequestTimeout 配置表中未设置');
        }
        this.timeout = Number(t);
    }
    result(params, orderRedis) {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await this.checkBalance(orderRedis);
                if (res.is) {
                    console.log("执行缓存更新");
                    orderRedis.phoneBalance = res.balance.toString();
                    await this.redis.getRedis().set(`order:${orderRedis.order.oid}`, JSON.stringify(orderRedis));
                    resolve(res.balance.toString());
                    return;
                }
            }
            catch (e) {
                console.log(e);
                let firstErr = e;
                console.error(`${orderRedis.resource.target}查询余额失败,最后一次原因:${e[e.length - 1].msg}`);
                if (e[e.length - 1].msg.includes(`SYSERROR`) || e[e.length - 1].msg.includes(`AxiosError: timeout of`)) {
                    let a = {
                        "YIDONG": false,
                        "LIANTONG": false,
                        "DIANXIN": false
                    };
                    a[orderRedis.resource.operator] = true;
                    let arr = Object.keys(a);
                    for (let i = 0; i < arr.length; i++) {
                        if (!a[arr[i]]) {
                            orderRedis.resource.operator = arr[i];
                            try {
                                let res = await this.checkBalance(orderRedis);
                                if (res.is) {
                                    console.log("执行缓存更新");
                                    orderRedis.phoneBalance = res.balance.toString();
                                    await this.redis.getRedis().set(`order:${orderRedis.order.oid}`, JSON.stringify(orderRedis));
                                    resolve(res.balance.toString());
                                    return;
                                }
                            }
                            catch (e) {
                                firstErr = firstErr.concat(e);
                                a[arr[i]] = true;
                            }
                        }
                    }
                    console.log(`尝试全部运营商余额均无法查询到,请加入黑名单`);
                }
                this.entityManager.update(top_entity_1.TopOrder, { oid: orderRedis.order.oid }, { errInfo: JSON.stringify(e) });
            }
            resolve("Failed");
        });
    }
    nameKey = '天猫旗舰';
    checkOrder(params, orderRedis) {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await this.checkBalance(orderRedis);
                resolve(res);
            }
            catch (e) {
                resolve(e);
            }
        });
    }
    checkBalanceBase(orderRedis) {
        return new Promise(async (resolve, reject) => {
            try {
                let pc = orderRedis.resource;
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
            const maxRetries = 3;
            const retryOptions = {
                factor: 1,
                minTimeout: 1000,
                maxTimeout: 1000,
                randomize: false,
            };
            const operation = retry.operation({
                retries: maxRetries,
                ...retryOptions,
            });
            let resultArray = [];
            operation.attempt(async (currentAttempt) => {
                console.log(`第${currentAttempt}次查询余额`);
                try {
                    const result = await this.checkBalanceBase(orderRedis);
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
            const maxRetries = 3;
            const retryOptions = {
                factor: 1,
                minTimeout: 500,
                maxTimeout: 500,
                randomize: false,
            };
            const operation = retry.operation({
                retries: maxRetries,
                ...retryOptions,
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