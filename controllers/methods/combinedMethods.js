const classMethods = require('./classMethods');
const indexMethods = require('./indexMethods');
const moduleMethods = require('./moduleMethods');
const webscraper = require('../../webscraper');
const { ClassModel, IndexModel, ModuleInfoModel } = require('../../models');

exports.getIndexesAndClasses = async (moduleDocument) => {
  const indexes = await IndexModel.find({ moduleId: moduleDocument._id });
  let classes = await Promise.all(
    indexes.map((doc) => ClassModel.find({ indexId: doc._id }))
  );
  classes = classes.flat(1);
  return { indexes, classes };
};

exports.createModulesIndexesClasses = async (axiosResponse, year, semester) => {
  // Returns the created documents.

  const createdDocuments = { modules: [], indexes: [], classes: [] };
  const scrapedModules = webscraper.scrapeAll(axiosResponse.data);

  // If no module is found, scrapedModules.length === 0, so nothing will be pushed.
  for (let scrapedModule of scrapedModules) {
    const {
      module,
      indexes,
      classes,
    } = await this.createOneModulesIndexesClasses(
      scrapedModule,
      year,
      semester
    );
    createdDocuments.modules.push(module);
    createdDocuments.indexes.push(indexes);
    createdDocuments.classes.push(classes);
  }
  return createdDocuments;
};

exports.createOneModulesIndexesClasses = async (
  webscraperOut,
  year,
  semester
) => {
  // Returns the created documents.
  const moduleInfo = await moduleMethods.createModule(
    year,
    semester,
    webscraperOut.moduleInfo
  );

  const parsedIndexes = webscraper.parseIndexes(webscraperOut.indexes);
  const indexes = await Promise.all(
    indexMethods.createIndexes(parsedIndexes, moduleInfo._id)
  );

  const parsedClasses = webscraper.parseClasses(webscraperOut.indexes);
  const indexMap = indexMethods.createIndexMap(indexes);
  let classes = classMethods.addIndexId(parsedClasses, indexMap);
  classes = classMethods.addModuleCode(classes, moduleInfo);
  classes = await Promise.all(classMethods.createClasses(classes));

  return { moduleInfo, indexes, classes };
};

exports.checkModulesClash = async (allModules) => {
  const clashingIndexes = [];
  console.log('Testing indexes, may take a while.');
  for (let i = 0; i < allModules.length; i++) {
    for (let j = i + 1; j < allModules.length; j++) {
      console.log(
        `Testing module ${allModules[i].moduleInfo.moduleCode} against ${allModules[j].moduleInfo.moduleCode}`
      );
      const i1arr = allModules[i]['indexes'];
      const i2arr = allModules[j]['indexes'];
      for (let i1doc of i1arr) {
        for (let i2doc of i2arr) {
          if (await indexMethods.doIndexesClash(i1doc, i2doc)) {
            clashingIndexes.push([i1doc, i2doc]);
          }
        }
      }
    }
  }
  return clashingIndexes;
};
