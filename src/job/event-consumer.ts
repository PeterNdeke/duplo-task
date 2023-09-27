import { CustomEventEmitter } from "../utils/custom-event-emitter";
import { LoggingService } from "../utils/logger";
import { ITaxData } from "../interfaces/index";
import { RemoteGovtTaxService } from "../remote/remote-govt-tax-service";

export const PostToGovtTaskEvent = new CustomEventEmitter<{
  taxData: ITaxData;
}>("POST_TO_GOVT_TAX_OFFICE_508fe78a");

PostToGovtTaskEvent.onDataRecieved(({ taxData }) => {
  RemoteGovtTaxService.postTransactionLogsToTax(taxData).catch((e) =>
    LoggingService.error(e)
  );
});
