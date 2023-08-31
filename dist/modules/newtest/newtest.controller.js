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
exports.NewtestController = void 0;
const common_1 = require("@nestjs/common");
const newtest_service_1 = require("./newtest.service");
const update_newtest_dto_1 = require("./dto/update-newtest.dto");
const authorize_decorator_1 = require("../admin/core/decorators/authorize.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const microservices_1 = require("@nestjs/microservices");
const alipay_sdk_1 = __importDefault(require("alipay-sdk"));
let NewtestController = class NewtestController {
    newtestService;
    client;
    alipaySdk;
    appId = "9021000123611056";
    constructor(newtestService, client) {
        this.newtestService = newtestService;
        this.client = client;
    }
    onModuleInit() {
        let p = '';
        if (process.env.NODE_ENV == 'development') {
            p = __dirname.replace("\\dist\\modules\\newtest", "");
        }
        else {
            p = `/www/wwwroot/phone_back`;
        }
        this.alipaySdk = new alipay_sdk_1.default({
            appId: "9021000123611056",
            privateKey: "MIIEowIBAAKCAQEAlzGzlhFqFMCCCVBFfgI6TlcxPVzaO31/YnXWA+1MXgTlO0Qjme/FAgvApWjruTVJnf7x9Pc4xx/2zIEiqcVkpLpiXVDhn+FxK3myc3pmRfwXYurb4JsfDvZfJ4EE2rfUI8/jozPpPs58rQ0iQ+8njTfet9GP2oDzyX0/k3546OcW0omyHUwtxPrJd/QkG3JMt+rZXEayLX0ecISfXQpTPjmoti9IcT2XbyBelmd8fGjh/AEtD1ivxrh3YqHeZf28G9jjKBrjgJfgp08zPgmozt9aXM2IuOanCpmmyWEpmm6AENhNCc53ABnojpyibUUR4EPPQ19ECWbRtIMRzSqJ+QIDAQABAoIBAF7GvyahP/hGPL2N3iIBT39wVON8YyjLoKCd8UyA4lBFjVS7f/2tObfwmhCWVr3A06cA+7dtid/4/4JuqMX3gQFp/OM2IllQvtpb7StKXPYd8qMFSlPfqXZ9pmRjEiHw/kB8vtu9XMcMNUddZk9jiU2S6kAcU6rLDwcNRl809qI304OzaqMQjPpnxqxRLB270tpZlAJpAEQy3TGQxCxg4EO2i8VY3rCNzTG9vx6rixPW4W7FEYIGp4LBxAE1/U2FNpBkGqH9Cgo69ra1JvYlcTYwVBBLfb8dcpOFoW1KIgLIsWYQJJWBBibbo656+SHACSTGY48hEPd0vFybjsJi/QECgYEAxgoRHY7rgo5AcolNUZBBY3/KTDNDFeM24qaX1uGrwfv+OMtF1ppO+pDugIC1xqrj/eEbrWOKMcF8VaD0NqUhygZI2JipWP3uN6qAaRWv8xLaFKkeq857jlXFoFlPXn2PAND+TEeFiPJ7cGprs+s+2SSheUJfiHktfhsTMDR90dECgYEAw3HMYOthdCWWM/X35Ak0H26DMV8FnOGBHKqRjnXHjPrzsQyet4995moMH+LanW6zgbmrocAR+00M7iEU62R398hAUoIJFujG/elhBMmRVfJy6BoOUN3V+ubNlqCnDZ8X4MRI9LjT98mV4Qc5LAuLfnuNi7jPYEgwunJ3U1U9V6kCgYBv1iuIN7fECLVYeTVSxFZI7Fe/5IsUBzZtlIrW7KZka/xK8nBEGuxTEBnAM+9ze/o42zEYH8hhBNVEPhrr6SFFx3rH5p5sBSrMANt3fKnaaWECnecWOwsHfGSYgxcRU3K4kU2qohFFHzqaZ17fQhBB7C/MHLF6joQkXQHfDSWooQKBgQCAq4jMPeqY1q3+Y27h2BVSpCUG+fHuCKBBySGu0mefrw+EfjR30KYobaSx0V3vy5OuUhhmktbDxUQ/+dOV7Tz2CgYey7FEPdfUDjNrPXDLTqTLnWvTXVikqBKtmfKhCx5jQZZuVshmF3bvARxonOknShwz4mXUk3JRLU7VtAaAkQKBgCCKTytZPrs0o4JWZarGQIdR8YJSDzmkSwxBDPE9HLYRv7hrJ4dP2P4r7029R1HuG+FSA2w0/Vezr2mNR9BQ1jHXHeY+ICnrDIfjCdphPBwEmw3q7k/4qLgvpI2lpSxXmXNtXBDYyQvHllbZE4gJWAIOn2DuxrTRJlvWDmeZ0KSx",
            gateway: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
        });
    }
    async findOne(dto) {
        console.log("测试");
        return 1;
        const bizContent = {
            out_trade_no: "ALIPfdf1211sdfsd12gfddsgs3",
            product_code: "FAST_INSTANT_TRADE_PAY",
            subject: "100元充值",
            body: "234",
            total_amount: "100.00"
        };
        const result = this.alipaySdk.pageExec('alipay.trade.wap.pay', {
            method: 'POST',
            bizContent,
            returnUrl: 'https://www.taobao.com'
        });
        console.log(result);
        return result;
    }
    async upfile(file) {
        return;
        return this.newtestService.upfile(file);
    }
    async testMicroservice() {
        let r = await this.client.send('accumulate', [1, 2, 3, 4, 5, 100]);
        let r2 = await this.client.send('stat', "");
        return r2;
    }
};
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Get)('getone'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NewtestController.prototype, "findOne", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)('/upfile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_newtest_dto_1.SelfFile]),
    __metadata("design:returntype", Promise)
], NewtestController.prototype, "upfile", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Get)('testMicroservice'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewtestController.prototype, "testMicroservice", null);
NewtestController = __decorate([
    (0, common_1.Controller)('newtest'),
    __param(1, (0, common_1.Inject)('MATH_SERVICE')),
    __metadata("design:paramtypes", [newtest_service_1.NewtestService,
        microservices_1.ClientProxy])
], NewtestController);
exports.NewtestController = NewtestController;
//# sourceMappingURL=newtest.controller.js.map