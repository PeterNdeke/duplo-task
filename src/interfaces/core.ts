export interface ICore<T = string> {
  _id?: string;
  id: T;
  createdAt: Date | string;
  updatedAt?: Date | string;
}
