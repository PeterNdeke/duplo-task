import Joi from "joi";

export const TransactionLogsCreationSchema = Joi.object({
  businessID: Joi.string().required(),
  amount: Joi.number().required(),
});
