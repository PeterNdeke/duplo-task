//import { GenericFriendlyError } from "../utils/errors";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { TransactionLogsRepository } from "../repositories/index";
import { ITransactionLogs } from "../interfaces/transaction-logs.interface";
import { PostToGovtTaskEvent } from "../job/event-consumer";
import { ITaxData } from "../interfaces";
import { PLATFORM_CODE } from "../utils/constants";
import { GenericFriendlyError } from "../utils/errors";

@injectable()
export class TransactionLogsService {
  private transactionLogsRepository: TransactionLogsRepository;

  constructor(
    @inject(TYPES.TransactionLogsRepository)
    transactionLogsRepository: TransactionLogsRepository
  ) {
    this.transactionLogsRepository = transactionLogsRepository;
  }

  async createTransactionLogs(insertData: ITransactionLogs) {
    const result = await this.transactionLogsRepository.create(insertData);
    if (result._id) {
      // post to govt tax office in the background
      const govtTaskData = {
        order_id: result._id,
        platform_code: PLATFORM_CODE,
        order_amount: result.amount,
      } as ITaxData;
      PostToGovtTaskEvent.sendData({ taxData: govtTaskData });
    }
    return result;
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
    return await this.transactionLogsRepository.fetchAllTransactionsLogs({
      page,
      limit,
      businessID,
    });
  }

  async getBusinessCreditScore(businessID: string) {
    // TODO:  validate that businessID exist on the list of all DUPLO'S onboarded businesses

    // check to ensure that provided businessID have a record on our trans log
    const transLogs =
      await this.transactionLogsRepository.fetchAllTransLogsForBusiness(
        businessID
      );
    if (!transLogs?.length) {
      throw GenericFriendlyError.createNotFoundError(
        `No transaction log found for ${businessID}`
      );
    }
    const amountSum =
      await this.transactionLogsRepository.sumAllTransAmountForBusiness(
        businessID
      );
    const numOfTrans = transLogs.length;

    const businessCreditScore = Math.round(
      amountSum / Number(numOfTrans / 100)
    );

    return {
      businessID,
      number_of_transactions: numOfTrans,
      total_amount_paid: Math.round(amountSum),
      credit_score: businessCreditScore,
    };
  }

  async getAllOrderDetailsForBusiness({
    today,
    businessID,
  }: {
    today: boolean | undefined;
    businessID: string;
  }) {
    const transLogs =
      await this.transactionLogsRepository.fetchAllTransLogsForBusiness(
        businessID
      );
    if (!transLogs?.length) {
      throw GenericFriendlyError.createNotFoundError(
        `No transaction log found for ${businessID}`
      );
    }
    const result =
      await this.transactionLogsRepository.fetchAllOrderDetailsForBusiness({
        today,
        businessID,
      });

    if (today) {
      return {
        total_number_of_orders_today: result.today_orders?.length || 0,
        total_amount_of_orders_today:
          Math.round(result.today_total_amount?.amount as number) || 0,
      };
    } else {
      return {
        total_number_of_orders: result.total_orders?.length || 0,
        toatl_amount_of_orders:
          Math.round(result.total_amount?.amount as number) || 0,
      };
    }
  }
}
