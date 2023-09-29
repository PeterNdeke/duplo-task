import { injectable } from "inversify";
import { ITransactionLogs } from "../interfaces/transaction-logs.interface";
import { transactionLogsModel } from "../models/transaction-logs.model";
import { perPage } from "../utils/constants";
import { DateService } from "../utils/date-service";

@injectable()
export class TransactionLogsRepository {
  constructor() {}

  async create(data: ITransactionLogs): Promise<ITransactionLogs> {
    return transactionLogsModel.create(data);
  }

  async fetchAllTransactionsLogs({
    page,
    limit,
    businessID,
  }: {
    page?: number;
    limit?: number;
    businessID?: string;
  }) {
    if (businessID) {
      const pageNumber = page || 1;
      limit = limit || perPage;
      const transLogs = await transactionLogsModel.paginate(
        { businessID },
        { page: pageNumber, limit }
      );

      return transLogs;
    } else {
      const pageNumber = page || 1;
      limit = limit || perPage;
      const transLogs = await transactionLogsModel.paginate(
        {},
        { page: pageNumber, limit }
      );

      return transLogs;
    }
  }

  async fetchAllTransLogsForBusiness(businessID: string) {
    return await transactionLogsModel.find({ businessID }).exec();
  }
  async sumAllTransAmountForBusiness(businessID: string) {
    const sum = await transactionLogsModel.aggregate([
      { $match: { businessID: businessID } },

      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]);
    return (await sum[0].amount) as number;
  }

  async fetchAllOrderDetailsForBusiness({
    today,
    businessID,
  }: {
    today?: boolean | undefined;
    businessID: string;
  }) {
    if (today) {
      const startOfTheDay = DateService.getStartOfTheDay(new Date());
      const todayOrders = await transactionLogsModel
        .find({ businessID, createdAt: { $gte: startOfTheDay } })
        .exec();
      const todayTotalAmount = await transactionLogsModel.aggregate([
        {
          $match: {
            businessID: businessID,
            createdAt: { $gte: startOfTheDay },
          },
        },

        { $group: { _id: null, amount: { $sum: "$amount" } } },
      ]);
      console.log(todayTotalAmount);
      return {
        today_orders: todayOrders,
        today_total_amount: await todayTotalAmount[0],
      };
    }

    const orders = await transactionLogsModel.find({ businessID }).exec();
    const totalAmount = await transactionLogsModel.aggregate([
      { $match: { businessID: businessID } },

      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]);
    return {
      total_orders: orders,
      total_amount: await totalAmount[0],
    };
  }
}
