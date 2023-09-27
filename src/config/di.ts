import "reflect-metadata";
import { Container } from "inversify";
import { HealthController } from "../controllers/HealthController";

import { TYPES } from "./types";
import { TransactionLogsService } from "../services/transaction-logs-Service";
import { TransactionLogsRepository } from "../repositories";
import { TransactionLogsController } from "../controllers/TransactionLogsController";

const container = new Container();

// controllers
container
  .bind<HealthController>(TYPES.HealthController)
  .to(HealthController)
  .inSingletonScope();

container
  .bind<TransactionLogsController>(TYPES.TransactionLogsController)
  .to(TransactionLogsController)
  .inSingletonScope();

// services
container
  .bind<TransactionLogsService>(TYPES.TransactionLogsService)
  .to(TransactionLogsService)
  .inSingletonScope();
// repositories
container
  .bind<TransactionLogsRepository>(TYPES.TransactionLogsRepository)
  .to(TransactionLogsRepository)
  .inSingletonScope();
export default container;

export const transactionServiceApi = container.get<TransactionLogsService>(
  TYPES.TransactionLogsService
);
