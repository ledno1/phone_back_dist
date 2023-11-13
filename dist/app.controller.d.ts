/// <reference types="node" />
import { ConfigService } from "@nestjs/config";
import { ConfigurationKeyPaths } from "@/config/configuration";
import { AuthService } from "@/modules/ws/auth.service";
import { UtilService } from "@/shared/services/util.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ZhService } from "@/modules/resource/zh/zh.service";
export declare class SelfFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export declare class AppController {
    private readonly configService;
    private paramConfigService;
    private zhService;
    private authService;
    private util;
    constructor(configService: ConfigService<ConfigurationKeyPaths>, paramConfigService: SysParamConfigService, zhService: ZhService, authService: AuthService, util: UtilService);
    fileSizeMax: number;
    fileTempPath: string;
    fileSavePath: string;
    Host: string;
    private upFile;
    private winversion;
}
