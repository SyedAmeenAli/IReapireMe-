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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var RepairStatus;
(function (RepairStatus) {
    RepairStatus["PENDING"] = "PENDING";
    RepairStatus["DIAGNOSING"] = "DIAGNOSING";
    RepairStatus["IN_PROGRESS"] = "IN_PROGRESS";
    RepairStatus["WAITING_FOR_PARTS"] = "WAITING_FOR_PARTS";
    RepairStatus["COMPLETED"] = "COMPLETED";
    RepairStatus["DELIVERED"] = "DELIVERED";
})(RepairStatus || (exports.RepairStatus = RepairStatus = {}));
const RepairTicketSchema = new mongoose_1.Schema({
    ticketId: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    deviceType: { type: String, required: true },
    brand: { type: String, required: true },
    deviceModel: { type: String, required: true },
    issueDescription: { type: String, required: true },
    status: { type: String, enum: Object.values(RepairStatus), default: RepairStatus.PENDING },
    estimatedCost: { type: Number, required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('RepairTicket', RepairTicketSchema);
//# sourceMappingURL=RepairTicket.js.map