import { RecordModel } from '../models/record.model.js';
import { AppError } from '../utils/errors.js';

export const RecordService = {
  async getAllRecords(filters) {
    return RecordModel.findAll(filters);
  },

  async getRecordById(id) {
    const record = await RecordModel.findById(id);
    if (!record) throw new AppError('Financial record not found', 404);
    return record;
  },

  async createRecord(data, userId) {
    return RecordModel.create({ ...data, user_id: userId });
  },

  async updateRecord(id, fields) {
    const existing = await RecordModel.findById(id);
    if (!existing) throw new AppError('Financial record not found', 404);

    const updated = await RecordModel.update(id, fields);
    if (!updated) throw new AppError('Financial record not found', 404);
    return updated;
  },

  async deleteRecord(id) {
    const existing = await RecordModel.findById(id);
    if (!existing) throw new AppError('Financial record not found', 404);

    await RecordModel.softDelete(id);
  },
};
