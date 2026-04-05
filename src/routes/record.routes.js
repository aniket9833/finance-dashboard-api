import { Router } from 'express';
import {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/record.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  validate,
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
} from '../validators/index.js';
import { PERMISSIONS } from '../config/constants.js';

const router = Router();

router.use(authenticate);

/**
 * @route  GET /api/records
 * @desc   List all records with filters, search, and pagination
 * @access Viewer, Analyst, Admin
 */
router.get(
  '/',
  authorize(PERMISSIONS.VIEW_RECORDS),
  validate(recordFilterSchema, 'query'),
  getAllRecords,
);

/**
 * @route  GET /api/records/:id
 * @desc   Get a single financial record
 * @access Viewer, Analyst, Admin
 */
router.get('/:id', authorize(PERMISSIONS.VIEW_RECORDS), getRecordById);

/**
 * @route  POST /api/records
 * @desc   Create a new financial record
 * @access Admin only
 */
router.post(
  '/',
  authorize(PERMISSIONS.CREATE_RECORD),
  validate(createRecordSchema),
  createRecord,
);

/**
 * @route  PATCH /api/records/:id
 * @desc   Update a financial record
 * @access Admin only
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.UPDATE_RECORD),
  validate(updateRecordSchema),
  updateRecord,
);

/**
 * @route  DELETE /api/records/:id
 * @desc   Soft-delete a financial record
 * @access Admin only
 */
router.delete('/:id', authorize(PERMISSIONS.DELETE_RECORD), deleteRecord);

export default router;
