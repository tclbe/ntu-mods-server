const { ClassModel, IndexModel, ModuleInfoModel } = require('../models');
const moduleMethods = require('./methods/moduleMethods');
const indexMethods = require('./methods/indexMethods');
const classMethods = require('./methods/classMethods');
const combinedMethods = require('./methods/combinedMethods');
const webscraper = require('../webscraper');

exports.get_modules = async (req, res) => {
  // Getting a single module needs getting all related indexes and classes.
  const { year, sem: semester, moduleCodes } = req.query;
  const allModules = [];
  const invalidModules = [];
  const clashingIndexes = [];

  for (let moduleCode of moduleCodes) {
    // First, search for the module. If doesn't exist, returns null (or some falsy value).
    const moduleInfo = await ModuleInfoModel.findOne({
      moduleCode,
      year,
      semester,
    });
    if (moduleInfo) {
      // Module exists in database.
      const { indexes, classes } = await combinedMethods.getIndexesAndClasses(
        moduleInfo
      );
      allModules.push({ moduleInfo, indexes, classes });
    } else {
      // Module doesn't exist, so create one.
      // Assume that if the module doesn't exist, neither do the index nor classes.
      console.log(
        `Module ${year}/${semester}/${moduleCode} not found on MongoDB.`
      );
      console.log('Pinging NTU.');
      const response = await webscraper.requestModule(
        year,
        semester,
        moduleCode
      );
      if (!response.status === 200) {
        res
          .status(500)
          .send(
            `Error pinging NTU, error code ${response.status}: ${response.statusText}`
          );
      } else {
        console.log('Response received.');
        const createdModule = await combinedMethods.createModulesIndexesClasses(
          response,
          year,
          semester
        );
        createdModule.modules.length > 0
          ? allModules.push(createdModule)
          : invalidModules.push(moduleCode);
      }
    }
  }
  if (invalidModules.length > 0) {
    res
      .status(500)
      .send(
        `Info for ${invalidModules.join(
          ', '
        )} not found on NTU. Was everything correct?`
      );
  } else {
    res.send(allModules);
  }
};
