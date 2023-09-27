import { Schema, model, PaginateModel } from "mongoose";
import { ITransactionLogs } from "../interfaces/transaction-logs.interface";
import { paginationConfig } from "../config/mongoose";
import paginate from "mongoose-paginate-v2";
import { v4 as uuidv4 } from "uuid";

const transactionLogsSchema = new Schema<ITransactionLogs>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    businessID: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, default: "success" },
  },

  {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
    timestamps: true,
  }
);

transactionLogsSchema.plugin(paginate);
paginationConfig();

export const transactionLogsModel = model<
  ITransactionLogs,
  PaginateModel<ITransactionLogs>
>("Transaction_Logs", transactionLogsSchema, "transaction_logs");
