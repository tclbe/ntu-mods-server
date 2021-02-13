const { ClassModel, IndexModel, ModuleInfoModel } = require('../../models');

exports.createIndexMap = (indexDocuments) => {
  const indexMap = new Map();
  for (let doc of indexDocuments) {
    indexMap.set(doc.indexNumber, doc._id);
  }
  return indexMap;
};

exports.createIndex = (indexNumber, moduleId) => {
  const indexInfo = {};
  indexInfo.indexNumber = indexNumber;
  indexInfo.updated = Date.now();
  indexInfo.moduleId = moduleId;
  return IndexModel.create(indexInfo);
};

exports.createIndexes = (arrayOfIndexNumbers, moduleId) => {
  const createdIndexes = [];
  for (let indexNumber of arrayOfIndexNumbers) {
    const createdIndex = this.createIndex(indexNumber, moduleId);
    createdIndexes.push(createdIndex);
  }
  return createdIndexes;
};

exports.doIndexesClash = async (index1Doc, index2Doc) => {
  // Two indexes should be from different modules.
  // Otherwise lecture classes will likely clash.
  const i1classes = await ClassModel.find({ indexId: index1Doc._id });
  const i2classes = await ClassModel.find({ indexId: index2Doc._id });
  for (let class1Doc of i1classes) {
    for (let class2Doc of i2classes) {
      if (require('./classMethods').doClassesClash(class1Doc, class2Doc)) {
        return true;
      }
    }
  }
  return false;
};
