import { HttpService } from "../utils/http-service";
import { Env } from "../config/env";
import { LoggingService } from "../utils/logger";
import { GenericFriendlyError } from "../utils/errors";
import { ITaxData } from "../interfaces";

class GovtTaxServiceBase {
  private getVariables() {
    const { GOVT_TAX_URL } = Env.all();
    if (!GOVT_TAX_URL) {
      throw new GenericFriendlyError("GOVT_TAX_URL env varaiable not found");
    }
    return {
      base_url: GOVT_TAX_URL,
    };
  }

  public async postTransactionLogsToTax(dataToPost: ITaxData) {
    try {
      LoggingService.info(dataToPost);
      const { base_url } = this.getVariables();
      return await HttpService.post({
        data: dataToPost,
        url: `${base_url}/log-tax`,
      });
    } catch (error) {
      LoggingService.error(error);
    }
  }
}

export const RemoteGovtTaxService = new GovtTaxServiceBase();
