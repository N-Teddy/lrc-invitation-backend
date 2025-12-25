"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const mongoose_1 = require("mongoose");
let ResponseInterceptor = class ResponseInterceptor {
    intercept(_context, next) {
        return next.handle().pipe((0, rxjs_1.map)((data) => ({
            success: true,
            data: this.normalize(data),
        })));
    }
    normalize(value) {
        if (Array.isArray(value)) {
            return value.map((item) => this.normalize(item));
        }
        if (value instanceof mongoose_1.Types.ObjectId) {
            return String(value);
        }
        if (value instanceof Date) {
            return value;
        }
        if (value && typeof value === 'object') {
            const plain = typeof value.toObject === 'function' ? value.toObject() : value;
            const out = {};
            for (const [k, v] of Object.entries(plain)) {
                if (k === '_id')
                    continue;
                out[k] = this.normalize(v);
            }
            const idSource = plain._id ?? plain.id;
            if (idSource !== undefined) {
                out.id = this.normalize(idSource);
            }
            return out;
        }
        return value;
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map