const cheerio = require('cheerio');
const querystring = require('querystring');
const htmlparser2 = require('htmlparser2');
const getSingleModuleInformation = require('./src/moduleScraper');
const getAllIndexesInformation = require('./src/indexScraper');
const { ntuAxiosInstance, NTU_URL } = require('./src/ntuAxiosInstance');

const scrapeOne = (RAW_HTML_TABLES) => {
  /*
    Expects two HTML tables - i.e. <table>...</table><table>...</table>
    containing the module information and the indexes.
    Will return an object containing { moduleInfo, indexes }
    module will contain moduleCode, moduleName, etc.
    indexes will contain an array of the indexes.
  */
  const dom = htmlparser2.parseDOM(RAW_HTML_TABLES);
  const $ = cheerio.load(dom);
  const moduleInfoTable = $('table').first();
  const indexInfoTable = $('table').last();
  const moduleInfo = getSingleModuleInformation($.html(moduleInfoTable));
  const indexes = getAllIndexesInformation($.html(indexInfoTable));
  return { moduleInfo, indexes };
};

exports.scrapeAll = (RAW_HTML_PAGE) => {
  /*
    Expects a full HTML page.
    Returns an array of objects, {moduleInfo, indexes}
    Return is structured this way because two tables are received.
    Each return is the output of each table.
  */
  const dom = htmlparser2.parseDOM(RAW_HTML_PAGE);
  const $ = cheerio.load(dom);
  // initiate <hr> separators - modules are separated by hr tags
  let hrs = $('hr');
  let startHr = hrs.first();
  let endHr = startHr.nextAll('hr');

  // array to push on each module
  const modulesAndIndexes = [];
  while (endHr.length >= 1) {
    const moduleAndIndexTables = startHr.nextUntil(endHr, 'table');
    const moduleAndIndexInfo = scrapeOne($.html(moduleAndIndexTables));
    modulesAndIndexes.push(moduleAndIndexInfo);
    startHr = endHr.first();
    endHr = endHr.nextAll('hr');
  }
  return modulesAndIndexes;
};

exports.requestModule = (year, semester, moduleCode) => {
  // Returns a promise, make sure to resolve with async/await or .then()
  if (!['1', '2'].includes(semester))
    throw new Error('Semester should be 1 or 2.');
  const options = {
    r_course_yr: '',
    r_subj_code: `${moduleCode}`,
    r_search_type: 'F',
    boption: 'Search',
    acadsem: `${year};${semester}`,
    staff_access: 'false',
  };
  return ntuAxiosInstance.post(NTU_URL, querystring.stringify(options));
};

exports.parseIndexes = (indexesInfo) => {
  /*
    indexesInfo should be the output from webscraper.
    webscraper returns in format {moduleInfo, indexes}
    indexes = {indexNumber, classes[]}.
    This function returns the list of indexNumbers.
  */
  const indexNumbers = indexesInfo.map((indexInfo) => indexInfo.indexNumber);
  return indexNumbers;
};

exports.parseClasses = (indexesInfo) => {
  /*
    indexesInfo should be the output from webscraper.
    webscraper returns in format {moduleInfo, indexes}
    indexes = {indexNumber, classes[]}.
    This function returns a list of classes with an indexNumber associated.
  */
  const classesInfo = indexesInfo.flatMap((indexInfo) => {
    const classInfo = indexInfo.classes.map((classes) => {
      classes.indexNumber = indexInfo.indexNumber;
      return classes;
    });
    return classInfo;
  });
  return classesInfo;
};
