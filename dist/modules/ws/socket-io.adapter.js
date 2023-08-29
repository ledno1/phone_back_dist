"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class SocketIoAdapter extends platform_socket_io_1.IoAdapter {
    app;
    configService;
    constructor(app, configService) {
        super(app);
        this.app = app;
        this.configService = configService;
    }
    create(port, options) {
        port = this.configService.get('WS_PORT');
        options.path = this.configService.get('WS_PATH');
        options.namespace = '/admin';
        return super.create(port, options);
    }
    createIOServer(port, options) {
        port = this.configService.get('WS_PORT');
        options.path = this.configService.get('WS_PATH');
        options.namespace = '/admin';
        return super.createIOServer(port, options);
    }
}
exports.SocketIoAdapter = SocketIoAdapter;
//# sourceMappingURL=socket-io.adapter.js.map