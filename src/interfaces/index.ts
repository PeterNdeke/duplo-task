export interface validationErrorMessages {
  field: string | number;
  message: string;
}

export interface ITaxData {
  order_id: string;
  platform_code: string;
  order_amount: number;
}
