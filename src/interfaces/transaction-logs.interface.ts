import { ICore } from "./core";

export interface ITransactionLogs extends ICore {
  businessID: string;
  amount: number;
  status: string;
}
