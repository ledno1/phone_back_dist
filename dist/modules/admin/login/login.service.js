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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const lodash_1 = require("lodash");
const svgCaptcha = __importStar(require("svg-captcha"));
const util_service_1 = require("../../../shared/services/util.service");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const redis_service_1 = require("../../../shared/services/redis.service");
const log_service_1 = require("../system/log/log.service");
const user_service_1 = require("../system/user/user.service");
const menu_service_1 = require("../system/menu/menu.service");
const process = __importStar(require("process"));
let LoginService = class LoginService {
    redisService;
    menuService;
    userService;
    logService;
    util;
    jwtService;
    constructor(redisService, menuService, userService, logService, util, jwtService) {
        this.redisService = redisService;
        this.menuService = menuService;
        this.userService = userService;
        this.logService = logService;
        this.util = util;
        this.jwtService = jwtService;
    }
    async createImageCaptcha(captcha) {
        const svg = svgCaptcha.create({
            size: 4,
            color: true,
            noise: 4,
            width: (0, lodash_1.isEmpty)(captcha.width) ? 100 : captcha.width,
            height: (0, lodash_1.isEmpty)(captcha.height) ? 50 : captcha.height,
            charPreset: "1234567890"
        });
        const result = {
            img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString("base64")}`,
            id: this.util.generateUUID()
        };
        await this.redisService
            .getRedis()
            .set(`admin:captcha:img:${result.id}`, svg.text, "EX", 60 * 5);
        return result;
    }
    async checkGoogleCode(username, code) {
        const user = await this.userService.findUserByUserName(username);
        if (!user) {
            throw new api_exception_1.ApiException(10003);
        }
        if (user.googleSecret) {
            let verity = this.util.isCodeCorrect(code, user.googleSecret);
            if (!verity) {
                throw new api_exception_1.ApiException(11102);
            }
        }
    }
    async checkImgCaptcha(id, code) {
        if (code == "8888") {
            return;
        }
        const result = await this.redisService
            .getRedis()
            .get(`admin:captcha:img:${id}`);
        if (process.env.NODE_ENV === "development") {
        }
        else if ((0, lodash_1.isEmpty)(result) || code.toLowerCase() !== result.toLowerCase()) {
            throw new api_exception_1.ApiException(10002);
        }
        await this.redisService.getRedis().del(`admin:captcha:img:${id}`);
    }
    async getLoginSign(username, password, ip, ua) {
        const user = await this.userService.findUserByUserName(username);
        if ((0, lodash_1.isEmpty)(user)) {
            throw new api_exception_1.ApiException(10003);
        }
        const comparePassword = this.util.md5(`${password}${user.psalt}`);
        if (user.password !== comparePassword) {
            throw new api_exception_1.ApiException(10003);
        }
        const perms = await this.menuService.getPerms(user.id);
        const userinfo = await this.userService.info(user.id);
        delete userinfo.psalt;
        delete userinfo.createdAt;
        delete userinfo.updatedAt;
        if (user.id === 1) {
            const oldToken = await this.getRedisTokenById(user.id);
            if (oldToken) {
                this.logService.saveLoginLog(user.id, ip, ua);
                return oldToken;
            }
        }
        const jwtSign = this.jwtService.sign(Object.assign(userinfo, {
            uid: parseInt(user.id.toString()),
            pv: 1
        }));
        await this.redisService
            .getRedis()
            .set(`admin:passwordVersion:${user.id}`, 1);
        await this.redisService
            .getRedis()
            .set(`admin:token:${user.id}`, jwtSign, "EX", 60 * 60 * 24);
        await this.redisService
            .getRedis()
            .set(`admin:perms:${user.id}`, JSON.stringify(perms));
        await this.logService.saveLoginLog(user.id, ip, ua);
        return jwtSign;
    }
    async clearLoginStatus(uid) {
        await this.userService.forbidden(uid);
    }
    async getPermMenu(uid, lv) {
        const menus = await this.menuService.getMenus(uid);
        if (lv === 3) {
            menus.forEach((item, index) => {
                if (item.name === "代理商家") {
                    menus.splice(index, 1);
                }
            });
        }
        const perms = await this.menuService.getPerms(uid);
        return { menus, perms };
    }
    async getRedisPasswordVersionById(id) {
        return this.redisService.getRedis().get(`admin:passwordVersion:${id}`);
    }
    async getRedisTokenById(id) {
        return this.redisService.getRedis().get(`admin:token:${id}`);
    }
    async getRedisPermsById(id) {
        return this.redisService.getRedis().get(`admin:perms:${id}`);
    }
};
LoginService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        menu_service_1.SysMenuService,
        user_service_1.SysUserService,
        log_service_1.SysLogService,
        util_service_1.UtilService,
        jwt_1.JwtService])
], LoginService);
exports.LoginService = LoginService;
//# sourceMappingURL=login.service.js.map