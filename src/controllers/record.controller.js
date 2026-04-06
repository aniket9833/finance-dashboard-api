import { RecordService } from '../services/record.service.js';
import { asyncHandler } from '../utils/errors.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPagination,
} from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

export const getAllRecords = asyncHandler(async (req, res) => {
  const query = req.parsedQuery || req.query;
  const { page, limit, offset } = parsePagination(query);
  const { type, category, date_from, date_to, search, sort_by, order } = query;

  const { rows, total } = await RecordService.getAllRecords({
    limit,
    offset,
    type,
    category,
    date_from,
    date_to,
    search,
    sort_by,
    order,
  });

  sendPaginated(res, rows, buildPagination(page, limit, total));
});

export const getRecordById = asyncHandler(async (req, res) => {
  const record = await RecordService.getRecordById(req.params.id);
  sendSuccess(res, { record });
});

export const createRecord = asyncHandler(async (req, res) => {
  const record = await RecordService.createRecord(req.body, req.user.id);
  sendCreated(res, { record }, 'Financial record created successfully');
});

export const updateRecord = asyncHandler(async (req, res) => {
  const record = await RecordService.updateRecord(req.params.id, req.body);
  sendSuccess(res, { record }, 'Financial record updated successfully');
});

export const deleteRecord = asyncHandler(async (req, res) => {
  await RecordService.deleteRecord(req.params.id);
  sendSuccess(res, null, 'Financial record deleted successfully');
});
