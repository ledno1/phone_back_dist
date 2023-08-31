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
exports.PhoneHandlerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const InerFace_1 = require("./InerFace");
let PhoneHandlerService = class PhoneHandlerService {
    redisService;
    entityManager;
    util;
    constructor(redisService, entityManager, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.util = util;
    }
    checkOrderBySql(params) {
        throw new Error("Method not implemented.");
    }
    updateMerchant(params, user) {
        throw new Error("Method not implemented.");
    }
    rollback(params, resource) {
        throw new Error("Method not implemented.");
    }
    channelType = InerFace_1.ChannelType.PROXY;
    nameKey = "话单";
    result(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let res = null;
                await this.haveAmount(params);
                await this.findMerchant(params);
                if (this.channelType === InerFace_1.ChannelType.PROXY) {
                    await this.findOrder(params);
                    await this.getApiUrl(params);
                }
                else if (this.channelType === InerFace_1.ChannelType.DIRECT) {
                    await this.findPayAccountAndUpdate(params);
                }
                await this.createOrder(params);
                resolve(res);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    haveAmount(params) {
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    console.log("执行查询是否匹配金额的订单phone" + new Date().toLocaleString());
                    resolve([new InerFace_1.HaveAmount()]);
                }, 1000);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    findMerchant(params) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    findOrder(params) {
        return new Promise(async (resolve, reject) => {
            resolve();
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
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createOrder(params) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve();
            }
            catch (e) {
                reject(e);
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
    defaultSystemOutTime;
    redisOrderName;
    onModuleInit() {
    }
    model;
    checkOrderApi(params) {
        return Promise.resolve(false);
    }
    outTime(params) {
        return Promise.resolve(undefined);
    }
    test() {
        return Promise.resolve(undefined);
    }
    autoCallback(params, p) {
        return Promise.resolve(undefined);
    }
};
PhoneHandlerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        util_service_1.UtilService])
], PhoneHandlerService);
exports.PhoneHandlerService = PhoneHandlerService;
//# sourceMappingURL=phoneProxyHandler.service.js.map