const express = require('express');
const router = express.Router();
const timetableControllers = require('../controllers/timetableController');
const moduleControllers = require('../controllers/moduleController');

const moduleMethods = require('../controllers/methods/moduleMethods');
const { ClassModel, IndexModel, ModuleInfoModel } = require('../models');

router.use('/timetable', (req, res, next) => {
  const moduleCodes = req.query.moduleCodes;
  let invalid = '';
  for (let moduleCode of moduleCodes) {
    if (!moduleMethods.moduleFormatCorrect(moduleCode)) {
      invalid = moduleCode;
      break;
    }
  }
  invalid
    ? res.send(
        `Unrecognised module format found in ${invalid}, expected 2 uppercase letters followed by 4 numbers.`
      )
    : next();
});

router.get('/timetable', timetableControllers.get_modules);

router.use('/modules/:year/:semester/:moduleCode', (req, res, next) => {
  const moduleCode = req.params.moduleCode;
  const valid = moduleMethods.moduleFormatCorrect(moduleCode);
  if (valid) {
    next();
  } else {
    res
      .status(500)
      .send(
        `Unrecognised module format found in ${moduleCode}, expected 2 uppercase letters followed by 4 numbers.`
      );
  }
});
router.get(
  '/modules/:year/:semester/:moduleCode',
  moduleControllers.get_single_module_by_code
);
router.get('/modules/reset', async (req, res) => {
  await ClassModel.remove({});
  await IndexModel.remove({});
  await ModuleInfoModel.remove({});
  res.send('All entries deleted from MongoDB.');
});

module.exports = router;
