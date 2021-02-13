const { ClassModel, IndexModel, ModuleInfoModel } = require('../../models');

exports.addIndexId = (classes, indexMap) => {
  classes.map((classInfo) => {
    classInfo.indexId = indexMap.get(classInfo.indexNumber);
    // delete classInfo.indexNumber;
    return classInfo;
  });
  return classes;
};

exports.addModuleCode = (classes, moduleDocument) => {
  classes.map((classInfo) => {
    classInfo.moduleCode = moduleDocument.moduleCode;
    return classInfo;
  });
  return classes;
};

exports.createClass = (classWithId) => {
  classWithId.updated = Date.now();
  return ClassModel.create(classWithId);
};

exports.createClasses = (arrayOfClasses) => {
  const addedClasses = [];
  for (let classInfo of arrayOfClasses) {
    const addedClass = this.createClass(classInfo);
    addedClasses.push(addedClass);
  }
  return addedClasses;
};

exports.doClassesClash = (class1Doc, class2Doc) => {
  const { timeStart: c1s, timeEnd: c1e, day: c1d } = class1Doc;
  const { timeStart: c2s, timeEnd: c2e, day: c2d } = class2Doc;
  if (c1d !== c2d) return false;
  const conflict1 = c2s <= c1s && c1s < c2e;
  const conflict2 = c1s <= c2s && c2s < c1e;
  return conflict1 || conflict2;
};
