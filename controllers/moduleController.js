const { ClassModel, IndexModel, ModuleInfoModel } = require('../models');
const combinedMethods = require('./methods/combinedMethods');
const webscraper = require('../webscraper');

exports.get_single_module_by_code = async (req, res) => {
  // getting a single module needs getting all related indexes and classes.
  const { year, semester, moduleCode } = req.params;
  let allInfo = {};

  // First, search for the module. If doesn't exist, returns null (or some falsy value).
  allInfo.moduleInfo = await ModuleInfoModel.findOne({
    moduleCode,
    year,
    semester,
  });

  if (!allInfo.moduleInfo) {
    // module doesn't exist, so create one.
    // assume that if the module doesn't exist, neither do the index nor classes.
    console.log(`Module ${year}/${semester}/${moduleCode} not found.`);
    const response = await webscraper.requestModule(year, semester, moduleCode);
    if (!response.status === 200)
      res.send(
        `Error pinging NTU, error code ${response.status}: ${response.statusText}`
      );
    else {
      const scrapedModules = webscraper.scrapeAll(response.data);

      // If no module is found, scrapedModules.length === 0, so nothing will be pushed.
      for (let scrapedModule of scrapedModules) {
        allInfo = await combinedMethods.createOneModulesIndexesClasses(
          scrapedModule,
          year,
          semester
        );
      }
    }
  } else {
    // Module exists, find indexes and classes.
    const { indexes, classes } = await combinedMethods.getIndexesAndClasses(
      allInfo.moduleInfo
    );
    allInfo.indexes = indexes;
    allInfo.classes = classes;
  }
  if (!allInfo.moduleInfo) {
    res
      .status(500)
      .send(
        `Module code ${moduleCode} not found on NTU. Was everything correct?`
      );
  } else {
    res.send(allInfo);
  }
};
