const { ClassModel, IndexModel, ModuleInfoModel } = require('../../models');

exports.createModule = (year, semester, moduleInfo) => {
  moduleInfo.year = year;
  moduleInfo.semester = semester;
  moduleInfo.updated = Date.now();
  return ModuleInfoModel.create(moduleInfo);
};

exports.moduleFormatCorrect = (moduleCode) => {
  return /[A-Z]{2}[0-9]{4}/.test(moduleCode);
};
