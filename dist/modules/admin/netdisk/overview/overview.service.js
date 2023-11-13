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
exports.NetDiskOverviewService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const qiniu = __importStar(require("qiniu"));
const date_fns_1 = require("date-fns");
const admin_constants_1 = require("../../admin.constants");
let NetDiskOverviewService = class NetDiskOverviewService {
    qiniuConfig;
    httpService;
    mac;
    FORMAT = 'yyyyMMddHHmmss';
    constructor(qiniuConfig, httpService) {
        this.qiniuConfig = qiniuConfig;
        this.httpService = httpService;
        this.mac = new qiniu.auth.digest.Mac(this.qiniuConfig.accessKey, this.qiniuConfig.secretKey);
    }
    getZeroHourToDay(current) {
        const month = (0, date_fns_1.getMonth)(current);
        const year = (0, date_fns_1.getYear)(current);
        const date = (0, date_fns_1.getDate)(current);
        return new Date(year, month, date, 0);
    }
    getZeroHourAnd1Day(current) {
        const month = (0, date_fns_1.getMonth)(current);
        const year = (0, date_fns_1.getYear)(current);
        return new Date(year, month, 1, 0);
    }
    async getSpace(start, end = new Date()) {
        const beginDate = (0, date_fns_1.format)(start, this.FORMAT);
        const endDate = (0, date_fns_1.format)(end, this.FORMAT);
        const url = `${admin_constants_1.QINIU_API}/v6/space?bucket=${this.qiniuConfig.bucket}&g=day&begin=${beginDate}&end=${endDate}`;
        const accessToken = qiniu.util.generateAccessTokenV2(this.mac, url, 'GET', 'application/x-www-form-urlencoded');
        const { data } = await this.httpService.axiosRef.get(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `${accessToken}`,
            },
        });
        return {
            datas: data.datas,
            times: data.times.map((e) => {
                return (0, date_fns_1.getDate)((0, date_fns_1.fromUnixTime)(e));
            }),
        };
    }
    async getCount(start, end = new Date()) {
        const beginDate = (0, date_fns_1.format)(start, this.FORMAT);
        const endDate = (0, date_fns_1.format)(end, this.FORMAT);
        const url = `${admin_constants_1.QINIU_API}/v6/count?bucket=${this.qiniuConfig.bucket}&g=day&begin=${beginDate}&end=${endDate}`;
        const accessToken = qiniu.util.generateAccessTokenV2(this.mac, url, 'GET', 'application/x-www-form-urlencoded');
        const { data } = await this.httpService.axiosRef.get(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `${accessToken}`,
            },
        });
        return {
            times: data.times.map((e) => {
                return (0, date_fns_1.getDate)((0, date_fns_1.fromUnixTime)(e));
            }),
            datas: data.datas,
        };
    }
    async getFlow(start, end = new Date()) {
        const beginDate = (0, date_fns_1.format)(start, this.FORMAT);
        const endDate = (0, date_fns_1.format)(end, this.FORMAT);
        const url = `${admin_constants_1.QINIU_API}/v6/blob_io?$bucket=${this.qiniuConfig.bucket}&g=day&$ftype=0&begin=${beginDate}&end=${endDate}&$src=origin&select=flow`;
        const accessToken = qiniu.util.generateAccessTokenV2(this.mac, url, 'GET', 'application/x-www-form-urlencoded');
        const { data } = await this.httpService.axiosRef.get(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `${accessToken}`,
            },
        });
        const times = [];
        const datas = [];
        data.forEach((e) => {
            times.push((0, date_fns_1.getDate)((0, date_fns_1.parseISO)(e.time)));
            datas.push(e.values.flow);
        });
        return {
            times,
            datas,
        };
    }
    async getHit(start, end = new Date()) {
        const beginDate = (0, date_fns_1.format)(start, this.FORMAT);
        const endDate = (0, date_fns_1.format)(end, this.FORMAT);
        const url = `${admin_constants_1.QINIU_API}/v6/blob_io?$bucket=${this.qiniuConfig.bucket}&g=day&$ftype=0&begin=${beginDate}&end=${endDate}&$src=origin&$src=inner&select=hit`;
        const accessToken = qiniu.util.generateAccessTokenV2(this.mac, url, 'GET', 'application/x-www-form-urlencoded');
        const { data } = await this.httpService.axiosRef.get(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `${accessToken}`,
            },
        });
        const times = [];
        const datas = [];
        data.forEach((e) => {
            times.push((0, date_fns_1.getDate)((0, date_fns_1.parseISO)(e.time)));
            datas.push(e.values.hit);
        });
        return {
            times,
            datas,
        };
    }
};
NetDiskOverviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(admin_constants_1.QINIU_CONFIG)),
    __metadata("design:paramtypes", [Object, axios_1.HttpService])
], NetDiskOverviewService);
exports.NetDiskOverviewService = NetDiskOverviewService;
//# sourceMappingURL=overview.service.js.map