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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguration = void 0;
const qiniu = __importStar(require("qiniu"));
const parseZone = (zone) => {
    switch (zone) {
        case 'Zone_as0':
            return qiniu.zone.Zone_as0;
        case 'Zone_na0':
            return qiniu.zone.Zone_na0;
        case 'Zone_z0':
            return qiniu.zone.Zone_z0;
        case 'Zone_z1':
            return qiniu.zone.Zone_z1;
        case 'Zone_z2':
            return qiniu.zone.Zone_z2;
    }
};
const getConfiguration = () => ({
    rootRoleId: parseInt(process.env.ROOT_ROLE_ID || '1'),
    mailer: {
        host: 'xxx',
        port: 80,
        auth: {
            user: 'xxx',
            pass: 'xxx',
        },
        secure: false,
    },
    amap: {
        key: 'xxx',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '123456',
    },
    database: {
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: Number.parseInt(process.env.MYSQL_PORT, 10),
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '',
        database: process.env.MYSQL_DATABASE,
        entities: ['src/entity/**/*.ts'],
        migrations: ['dist/src/migrations/**/*.js'],
        autoLoadEntities: true,
        synchronize: true,
        logging: ['error'],
        timezone: '+08:00',
        cli: {
            migrationsDir: 'src/migrations',
        },
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB,
    },
    qiniu: {
        accessKey: process.env.QINIU_ACCESSKEY,
        secretKey: process.env.QINIU_SECRETKEY,
        domain: process.env.QINIU_DOMAIN,
        bucket: process.env.QINIU_BUCKET,
        zone: parseZone(process.env.QINIU_ZONE || 'Zone_z2'),
        access: process.env.QINIU_ACCESS_TYPE || 'public',
    },
    logger: {
        timestamp: false,
        dir: process.env.LOGGER_DIR,
        maxFileSize: process.env.LOGGER_MAX_SIZE,
        maxFiles: process.env.LOGGER_MAX_FILES,
        errorLogName: process.env.LOGGER_ERROR_FILENAME,
        appLogName: process.env.LOGGER_APP_FILENAME,
    },
    swagger: {
        enable: process.env.SWAGGER_ENABLE === 'true',
        path: process.env.SWAGGER_PATH,
        title: process.env.SWAGGER_TITLE,
        desc: process.env.SWAGGER_DESC,
        version: process.env.SWAGGER_VERSION,
    },
    WaMir: {
        ADD: process.env.WAMIR_HOST,
        PORT: process.env.WAMIR_PORT,
        WAMIR_WS: process.env.WAMIR_WS,
    },
    resources: {
        host: `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/`,
        masterHost: `http://${process.env.SERVER_HOST}/`,
        uploadDir: process.env.UPLOAD_DIR,
        uploadMaxSize: process.env.UPLOAD_MAX_SIZE,
        resourceDir: process.env.RESOURCE_DIR,
        APP_NAME: process.env.APP_NAME,
    },
});
exports.getConfiguration = getConfiguration;
//# sourceMappingURL=configuration.js.map