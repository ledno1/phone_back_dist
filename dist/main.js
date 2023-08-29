"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const api_exception_filter_1 = require("./common/filters/api-exception.filter");
const api_transform_interceptor_1 = require("./common/interceptors/api-transform.interceptor");
const setup_swagger_1 = require("./setup-swagger");
const logger_service_1 = require("./shared/logger/logger.service");
const socket_io_adapter_1 = require("./modules/ws/socket-io.adapter");
const platform_express_1 = require("@nestjs/platform-express");
const process_1 = __importDefault(require("process"));
const SERVER_PORT = process_1.default.env.SERVER_PORT;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(), {
        bufferLogs: true
    });
    app.enableCors();
    app.useLogger(app.get(logger_service_1.LoggerService));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        exceptionFactory: (errors) => {
            return new common_1.UnprocessableEntityException(errors
                .filter((item) => !!item.constraints)
                .flatMap((item) => Object.values(item.constraints))
                .join("; "));
        }
    }));
    app.useGlobalFilters(new api_exception_filter_1.ApiExceptionFilter(app.get(logger_service_1.LoggerService)));
    app.useGlobalInterceptors(new api_transform_interceptor_1.ApiTransformInterceptor(new core_1.Reflector()));
    app.useWebSocketAdapter(new socket_io_adapter_1.SocketIoAdapter(app, app.get(config_1.ConfigService)));
    if (process_1.default.env.NODE_ENV == "development") {
        (0, setup_swagger_1.setupSwagger)(app);
    }
    await app.listen(SERVER_PORT, "0.0.0.0");
    const serverUrl = await app.getUrl();
    console.log(new Date().toLocaleTimeString() + "服务器启动");
    common_1.Logger.log(`api服务已经启动,请访问: ${serverUrl}`);
    common_1.Logger.log(`API文档已生成,请访问: ${serverUrl}/${process_1.default.env.SWAGGER_PATH}/`);
    common_1.Logger.log(`ws服务已经启动,请访问: http://localhost:${process_1.default.env.WS_PORT}${process_1.default.env.WS_PATH}`);
}
bootstrap();
//# sourceMappingURL=main.js.map