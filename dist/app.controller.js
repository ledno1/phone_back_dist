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
exports.AppController = exports.SelfFile = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const auth_service_1 = require("./modules/ws/auth.service");
const authorize_decorator_1 = require("./modules/admin/core/decorators/authorize.decorator");
const util_service_1 = require("./shared/services/util.service");
const api_exception_1 = require("./common/exceptions/api.exception");
const admin_user_decorator_1 = require("./modules/admin/core/decorators/admin-user.decorator");
const permission_optional_decorator_1 = require("./modules/admin/core/decorators/permission-optional.decorator");
const param_config_service_1 = require("./modules/admin/system/param-config/param-config.service");
const zh_service_1 = require("./modules/resource/zh/zh.service");
class SelfFile {
    fieldname;
    originalname;
    encoding;
    mimetype;
    buffer;
    size;
}
exports.SelfFile = SelfFile;
let AppController = class AppController {
    configService;
    paramConfigService;
    zhService;
    authService;
    util;
    constructor(configService, paramConfigService, zhService, authService, util) {
        this.configService = configService;
        this.paramConfigService = paramConfigService;
        this.zhService = zhService;
        this.authService = authService;
        this.util = util;
        let t = this.configService.get("resources").uploadMaxSize;
        let tarr = t.split("*");
        this.fileSizeMax =
            parseInt(tarr[0]) * parseInt(tarr[1]) * parseInt(tarr[2]);
        this.fileTempPath = this.configService.get("resources").uploadDir;
        this.fileSavePath = this.configService.get("resources").resourceDir;
        this.Host = this.configService.get("resources").masterHost;
        if (!fs_1.default.existsSync(this.fileSavePath)) {
            fs_1.default.mkdirSync(this.fileSavePath);
        }
        if (!fs_1.default.existsSync(this.fileTempPath)) {
            fs_1.default.mkdirSync(this.fileTempPath);
        }
        if (!fs_1.default.existsSync((0, path_1.join)(this.fileSavePath, "cookie"))) {
            fs_1.default.mkdirSync((0, path_1.join)(this.fileSavePath, "cookie"));
        }
    }
    fileSizeMax = null;
    fileTempPath = null;
    fileSavePath = null;
    Host = null;
    async upFile(body, req, file) {
        console.log(file);
        console.log(file.mimetype);
        let { action } = req.headers;
        let userinfo = await this.authService.checkAdminAuthToken(req.headers.token);
        console.log(userinfo);
        let whiteList = await this.paramConfigService.findValueByKey("whiteList");
        if (userinfo.id != 1) {
            if (whiteList.indexOf(userinfo.id) == -1) {
                throw new api_exception_1.ApiException(11003);
            }
        }
        if (Math.floor(this.util.getNowTimestamp() - userinfo.iat) > 86400) {
            throw new api_exception_1.ApiException(11002);
        }
        let fileName = this.util.generateRandomValue(32) + "." + file.mimetype.split("/")[1];
        try {
            let filePath = (0, path_1.join)((0, path_1.join)(this.fileSavePath, action), fileName);
            fs_1.default.writeFileSync(filePath, file.buffer);
            this.zhService.addByFile(filePath, userinfo);
        }
        catch (e) {
            console.error("文件保存失败", e);
            throw new common_1.HttpException("文件保存失败", 500);
        }
        if (action == "icon") {
            return this.Host + "resources/icon/" + fileName;
        }
    }
    async winversion(query, user) {
        return {
            version: "1.0.4",
            path: ""
        };
    }
};
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/upfile"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, SelfFile]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "upFile", null);
__decorate([
    (0, permission_optional_decorator_1.PermissionOptional)(),
    (0, common_1.Get)("/winversion"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "winversion", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        param_config_service_1.SysParamConfigService,
        zh_service_1.ZhService,
        auth_service_1.AuthService,
        util_service_1.UtilService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map