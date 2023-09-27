import { CustomLabels, PaginateOptions } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { perPage } from "../utils/constants";

const customPaginationLabels: CustomLabels = {
  totalDocs: "totalRecords",
  docs: "records",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "totalPages",
  meta: "pagination",
};

export function paginationConfig(): PaginateOptions {
  return (mongoosePaginate.paginate.options = {
    limit: perPage,
    customLabels: customPaginationLabels,
  });
}
