const cheerio = require('cheerio');

function getSingleModuleInformation(RAW_TABLE) {
  /*
    Parameters: RAW_TABLE - Expecting _ONE_ HTML <table>...</table> 
    Module information taken from:
    https://wish.wis.ntu.edu.sg/webexe/owa/aus_schedule.main
    https://wish.wis.ntu.edu.sg/webexe/owa/AUS_SCHEDULE.main_display1

    Returns an object containing the following: moduleCode, moduleName,
    moduleNote, academicUnits, additionalInfo
  */
  if (!RAW_TABLE) throw new Error('No HTML received!');
  const $ = cheerio.load(RAW_TABLE);

  if ($('table').length !== 1)
    throw new Error(`Expected 1 table, found ${$('table').length}`);

  const moduleInfoTable = $('table').first();

  // Process module
  const moduleAddInfo = []; // temporary array for appending information row by row
  const moduleBasicInfoRow = $('tbody tr', moduleInfoTable).first();
  const moduleAddInfoRows = moduleBasicInfoRow.nextAll();
  let processingCell = $('td', moduleBasicInfoRow).first();

  // Process basic module information
  const moduleCode = processingCell.text().trim();
  processingCell = processingCell.next();

  const regExModuleName = processingCell
    .text()
    .trim()
    .match(/^(.+[^\*|^\^|^\#])([\*\^\#]*)?$/);
  const moduleName = regExModuleName[1];
  const moduleNote = regExModuleName[2] ? regExModuleName[2] : '';
  processingCell = processingCell.next();

  const regExAcademicUnits = processingCell
    .text()
    .trim()
    .match(/(\d*\.\d)/);
  const academicUnits = regExAcademicUnits[1];

  // Process additional module information, if any.
  moduleAddInfoRows.each((row_no, row) => {
    addInfo = $(row).text().trim();
    // Below line removes empty rows.
    if (addInfo) moduleAddInfo.push(addInfo);
  });

  // Done processing, return.
  const moduleInfo = {
    moduleCode,
    moduleName,
    moduleNote,
    academicUnits,
    moduleAddInfo,
  };

  return moduleInfo;
}

module.exports = getSingleModuleInformation;
