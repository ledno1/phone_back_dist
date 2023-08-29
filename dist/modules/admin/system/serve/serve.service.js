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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysServeService = void 0;
const common_1 = require("@nestjs/common");
const si = __importStar(require("systeminformation"));
const serve_class_1 = require("./serve.class");
let SysServeService = class SysServeService {
    async getServeStat() {
        const versions = await si.versions('node, npm');
        const osinfo = await si.osInfo();
        const cpuinfo = await si.cpu();
        const currentLoadinfo = await si.currentLoad();
        const diskListInfo = await si.fsSize();
        const diskinfo = new serve_class_1.Disk();
        diskinfo.size = diskListInfo[0].size;
        diskinfo.available = diskListInfo[0].available;
        diskinfo.used = 0;
        diskListInfo.forEach((d) => {
            diskinfo.used += d.used;
        });
        const meminfo = await si.mem();
        return {
            runtime: {
                npmVersion: versions.npm,
                nodeVersion: versions.node,
                os: osinfo.platform,
                arch: osinfo.arch,
            },
            cpu: {
                manufacturer: cpuinfo.manufacturer,
                brand: cpuinfo.brand,
                physicalCores: cpuinfo.physicalCores,
                model: cpuinfo.model,
                speed: cpuinfo.speed,
                rawCurrentLoad: currentLoadinfo.rawCurrentLoad,
                rawCurrentLoadIdle: currentLoadinfo.rawCurrentLoadIdle,
                coresLoad: currentLoadinfo.cpus.map((e) => {
                    return {
                        rawLoad: e.rawLoad,
                        rawLoadIdle: e.rawLoadIdle,
                    };
                }),
            },
            disk: diskinfo,
            memory: {
                total: meminfo.total,
                available: meminfo.available,
            },
        };
    }
};
SysServeService = __decorate([
    (0, common_1.Injectable)()
], SysServeService);
exports.SysServeService = SysServeService;
//# sourceMappingURL=serve.service.js.map