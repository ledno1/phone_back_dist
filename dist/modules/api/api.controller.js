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
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const api_service_1 = require("./api.service");
const param_config_service_1 = require("../admin/system/param-config/param-config.service");
const authorize_decorator_1 = require("../admin/core/decorators/authorize.decorator");
const api_exception_1 = require("../../common/exceptions/api.exception");
const channel_service_1 = require("../resource/channel/channel.service");
const redis_service_1 = require("../../shared/services/redis.service");
const keep_decorator_1 = require("../../common/decorators/keep.decorator");
const swagger_1 = require("@nestjs/swagger");
const interface_1 = require("./APIInterFace/interface");
const admin_user_decorator_1 = require("../admin/core/decorators/admin-user.decorator");
const util_service_1 = require("../../shared/services/util.service");
let ApiController = class ApiController {
    apiService;
    paramConfigService;
    channelService;
    redis;
    utils;
    constructor(apiService, paramConfigService, channelService, redis, utils) {
        this.apiService = apiService;
        this.paramConfigService = paramConfigService;
        this.channelService = channelService;
        this.redis = redis;
        this.utils = utils;
    }
    async onModuleInit() {
        let have = await this.paramConfigService.findValueByKey("proxyCharging_open");
        if (!have) {
            throw new Error("推单开关未设置,字段 proxyCharging_open 未设置");
        }
    }
    async pay(body) {
        let { channel, merId, sign, attch } = body;
        if (!attch || attch == "")
            throw new api_exception_1.ApiException(60102);
        let subChannel = Number(attch);
        let pay = await this.paramConfigService.findValueByKey("pay_open");
        if (Boolean(Number(pay)) === true) {
            let channelList = await this.redis.getRedis().get("channel:list");
            if (!channelList) {
                channelList = await this.channelService.channelRoot();
                channelList = channelList.map((item) => item.id);
                await this.redis.getRedis().set("channel:list", JSON.stringify(channelList), "EX", 36000 * 1);
            }
            else {
                channelList = JSON.parse(channelList);
            }
            if (!channelList.includes(Number(channel))) {
                throw new api_exception_1.ApiException(60002);
            }
            let subChannelList = await this.redis.getRedis().get(`channel:subChannelList:${channel}`);
            if (!subChannelList) {
                subChannelList = await this.channelService.getSubChannel(Number(channel));
                await this.redis.getRedis().set(`channel:subChannelList:${channel}`, JSON.stringify(subChannelList), "EX", 36000 * 1);
            }
            else {
                subChannelList = JSON.parse(subChannelList);
            }
            subChannelList.forEach((item) => {
                if (item.id === subChannel) {
                    if (item.amountType && item.amountType !== "") {
                        if (item.amountType.includes('-')) {
                            let a = item.amountType.split("-");
                            let b = body.orderAmt.includes('.') ? body.orderAmt.split(".")[0] : body.orderAmt;
                            if (isNaN(Number(b))) {
                                console.error('订单金额必须是数字');
                                throw new api_exception_1.ApiException(60015);
                            }
                            if (Number(a[0]) > Number(b) || Number(b) > Number(a[1])) {
                                console.error(`订单金额不在范围内,${body.orderAmt} 不在 ${a[0]} - ${a[1]} 之间`);
                                throw new api_exception_1.ApiException(60015);
                            }
                        }
                        else {
                            let a = item.amountType.split(",");
                            let b = body.orderAmt.includes('.') ? body.orderAmt.split(".")[0] : body.orderAmt;
                            if (!a.includes(b)) {
                                console.error(body.orderAmt + "  金额不在范围内");
                                throw new api_exception_1.ApiException(60015);
                            }
                        }
                    }
                }
            });
            if (sign?.toString().length > 32) {
                throw new api_exception_1.ApiException(60003);
                return 1;
            }
            else {
                return await this.apiService.payMd5(body);
            }
        }
        throw new api_exception_1.ApiException(60001);
    }
    async payTest(body, user) {
        let { channel, merId, sign, attch, orderAmt } = body;
        let p = body;
        p.amount = Number(body.orderAmt) * 100;
        p.sign = "test00001111";
        attch && attch != "" && !isNaN(Number(attch)) ? p.subChannel = Number(attch) : null;
        if (!attch || attch == "")
            throw new api_exception_1.ApiException(60102);
        let subChannel = Number(attch);
        let pay = await this.paramConfigService.findValueByKey("pay_open");
        if (Boolean(Number(pay)) === true) {
            let channelList = await this.redis.getRedis().get("channel:list");
            if (!channelList) {
                channelList = await this.channelService.channelRoot();
                channelList = channelList.map((item) => item.id);
                await this.redis.getRedis().set("channel:list", JSON.stringify(channelList), "EX", 60 * 1);
            }
            else {
                channelList = JSON.parse(channelList);
            }
            if (!channelList.includes(Number(channel))) {
                throw new api_exception_1.ApiException(60002);
            }
            let subChannelList = await this.redis.getRedis().get(`channel:subChannelList:${channel}`);
            if (!subChannelList) {
                subChannelList = await this.channelService.getSubChannel(Number(channel));
                await this.redis.getRedis().set(`channel:subChannelList:${channel}`, JSON.stringify(subChannelList), "EX", 60 * 1);
            }
            else {
                subChannelList = JSON.parse(subChannelList);
            }
            subChannelList.forEach((item) => {
                if (item.id === subChannel) {
                    if (item.amountType && item.amountType !== "") {
                        if (item.amountType.includes('-')) {
                            let a = item.amountType.split("-");
                            let b = body.orderAmt.includes('.') ? body.orderAmt.split(".")[0] : body.orderAmt;
                            if (isNaN(Number(b))) {
                                console.error('订单金额必须是数字');
                                throw new api_exception_1.ApiException(60015);
                            }
                            if (Number(a[0]) > Number(b) || Number(b) > Number(a[1])) {
                                console.error(`订单金额不在范围内,${body.orderAmt} 不在 ${a[0]} - ${a[1]} 之间`);
                                throw new api_exception_1.ApiException(60015);
                            }
                        }
                        else {
                            let a = item.amountType.split(",");
                            let b = body.orderAmt.includes('.') ? body.orderAmt.split(".")[0] : body.orderAmt;
                            if (!a.includes(b)) {
                                console.error(body.orderAmt + "  金额不在范围内");
                                throw new api_exception_1.ApiException(60015);
                            }
                        }
                    }
                }
            });
            if (sign?.toString().length > 32) {
                throw new api_exception_1.ApiException(60003);
                return 1;
            }
            else {
                return await this.apiService.payMd5(body, user);
            }
        }
        throw new api_exception_1.ApiException(60001);
    }
    async payCheck(body) {
        return await this.apiService.payCheck(body);
    }
    async getpayurl(body, request) {
        const clientIP = request.headers['x-forwarded-for'] || '127.0.0.1';
        let { fingerprint } = body;
        if (body.action == 'orderinfo' || body.action == "checkorder") {
            return await this.apiService.getPayUrl(body, clientIP.toString().split(",")[0]);
        }
        else {
            return await this.apiService.getPayUrl(body, clientIP.toString().split(",")[0]);
        }
    }
    async alipayNotify(body, query) {
        return await this.apiService.alipayNotify(body, query);
    }
    async startcheck(query) {
        if (process.env.NODE_ENV == "development") {
            return await this.apiService.test(query);
        }
    }
    async callback() {
        return 'success';
    }
    async notify_url(query) {
        console.log(query);
        return 'success';
    }
    async return_rul(query) {
        console.log(query);
        return 'success';
    }
    async directPush(body, request) {
        let proxyCharging = await this.paramConfigService.findValueByKey("proxyCharging_open");
        if (Boolean(Number(proxyCharging)) === true) {
            let c = await this.channelService.getChannelInfo(body.channel);
            if (!c) {
                throw new api_exception_1.ApiException(60017);
            }
            if (!c.isUse) {
                throw new api_exception_1.ApiException(60018);
            }
            if (c.amountType.includes('-')) {
                let a = c.amountType.split("-");
                let b = body.orderAmt.includes('.') ? body.orderAmt.split(".")[0] : body.orderAmt;
                if (isNaN(Number(b))) {
                    console.error('订单金额必须是数字');
                    throw new api_exception_1.ApiException(60015);
                }
                if (Number(a[0]) > Number(b) || Number(b) > Number(a[1])) {
                    console.error(`订单金额不在范围内,${body.orderAmt} 不在 ${a[0]} - ${a[1]} 之间`);
                    throw new api_exception_1.ApiException(60015);
                }
            }
            else {
                let a = c.amountType.split(",");
                let b = body.orderAmt.includes('.') ? body.orderAmt.split(".")[0] : body.orderAmt;
                if (!a.includes(b)) {
                    console.error(body.orderAmt + "  金额不在范围内");
                    throw new api_exception_1.ApiException(60015);
                }
            }
            const clientIP = request.headers['x-forwarded-for'] || '127.0.0.1';
            console.log(clientIP);
            if (!await this.apiService.isIpWhitelisted(clientIP.toString().split(',')[0], body.merId)) {
                throw new api_exception_1.ApiException(10103);
            }
            return await this.apiService.directPush(body);
        }
        throw new api_exception_1.ApiException(60016);
    }
    async directBack(body, request) {
        const clientIP = request.headers['x-forwarded-for'] || '127.0.0.1';
        console.log(clientIP);
        if (!await this.apiService.isIpWhitelisted(clientIP.toString().split(',')[0], body.merId)) {
            throw new api_exception_1.ApiException(10103);
        }
        return await this.apiService.directBack(body);
    }
    async callOrder(query, request) {
        return await this.apiService.callOrder(query, request.headers.cookie);
    }
};
__decorate([
    (0, keep_decorator_1.Keep)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiDefaultResponse)({ type: interface_1.PayResponse, description: "成功响应数据结构,Schema可查看字段作用" }),
    (0, swagger_1.ApiOkResponse)({ type: interface_1.PayResponseError, description: "失败响应数据结构,Schema可查看字段作用" }),
    (0, swagger_1.ApiBody)({
        type: interface_1.Pay, description: `签名方法如下:\n
      1、将接口中的请求字段按照Ascii码方式进行升序排序\r\n
      2、按照key1=val1&key2=val2&key3=val3....&key=md5秘钥生成加密字符串\r\n
      例子: attch=123434&channel=wxwap&desc=商品&ip=1.1.1.1&merId=111111&nonceStr=IMGFpXzpLGIehps&notifyUrl=http://www.qq.com.com&returnUrl=http://www.qq.com.com&smstyle=1&userId=878&key=iopiioiopiopipip\r\n
      3、将上一步生成的字符串进行MD5加密，并转换成大写得到0801A337E8B7270F01B824E11F98BD29
      4、将MD5加密后得到的字符串作为sign字段传入\r\n
      
      `
    }),
    (0, common_1.Post)("/pay"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [interface_1.Pay]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "pay", null);
__decorate([
    (0, keep_decorator_1.Keep)(),
    (0, common_1.Post)("/pay/test"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "payTest", null);
__decorate([
    (0, keep_decorator_1.Keep)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/pay/query"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [interface_1.PayCheck]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "payCheck", null);
__decorate([
    (0, keep_decorator_1.Keep)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/getpayurl"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "getpayurl", null);
__decorate([
    (0, keep_decorator_1.Keep)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/alipay/notify"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "alipayNotify", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Get)("/test/startcheck"),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "startcheck", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/test/callback"),
    (0, keep_decorator_1.Keep)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "callback", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/notify_url"),
    (0, keep_decorator_1.Keep)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "notify_url", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/return_rul"),
    (0, keep_decorator_1.Keep)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "return_rul", null);
__decorate([
    (0, keep_decorator_1.Keep)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/order/directPush"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [interface_1.DirectPush, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "directPush", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, keep_decorator_1.Keep)(),
    (0, common_1.Post)("/order/directBack"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [interface_1.DirectBack, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "directBack", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, keep_decorator_1.Keep)(),
    (0, common_1.Get)('/callorder'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "callOrder", null);
ApiController = __decorate([
    (0, swagger_1.ApiTags)("API模块"),
    (0, common_1.Controller)({
        path: process.env.NODE_ENV == "development" ? "/api" : '/',
    }),
    __metadata("design:paramtypes", [api_service_1.ApiService,
        param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], ApiController);
exports.ApiController = ApiController;
//# sourceMappingURL=api.controller.js.map