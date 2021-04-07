import { GarbageCtrl } from "../components/garbage/garbage.controller";


export const create = (req, res, next) => {
  GarbageCtrl.create(req, res, next);
};

export const updateFieldById = (req, res, next) => {
  GarbageCtrl.updateFieldById(req, res, next);
};

export const getById = (req, res, next) => {
  GarbageCtrl.getById(req, res, next);
};

export const getAll = (req, res, next) => {
  GarbageCtrl.getAll(req, res, next);
};

export const getByLocationRange = (req, res, next) => {
  GarbageCtrl.getByLocationRange(req, res, next);
};

export const getByEmptyDate = (req, res, next) => {
  GarbageCtrl.getByEmptyDate(req, res, next);
};

export const _delete = (req, res, next) => {
  GarbageCtrl._delete(req, res, next);
};

export const createAndFetchTest = (req, res, next) => {
  GarbageCtrl.createAndFetchTest(req, res, next);
};