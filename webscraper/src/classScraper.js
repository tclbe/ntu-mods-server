const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');
// htmlparser2 is more lenient with markup, allows <tr>s, <td>s, etc without <table>, <tbody>.

function getSingleClassInformation(RAW_TR) {
  /*
    Parameters: RAW_TR - Expecting _ONE_ HTML <tr>...</tr> 
    Module information taken from:
    https://wish.wis.ntu.edu.sg/webexe/owa/aus_schedule.main
    https://wish.wis.ntu.edu.sg/webexe/owa/AUS_SCHEDULE.main_display1

    Returns an object containing the following: moduleCode, moduleName,
    moduleNote, academicUnits, additionalInfo
  */
  if (!RAW_TR) throw new Error('No HTML received!');
  const dom = htmlparser2.parseDOM(RAW_TR);
  const $ = cheerio.load(dom);

  if ($('tr').length !== 1)
    throw new Error(`Expected 1 row, found ${$('tr').length}`);

  // .next skips the index cell
  let processingCell = $('td').next();

  // Process class information
  const type = processingCell.first().text().trim();
  processingCell = processingCell.next();

  const group = processingCell.first().text().trim();
  processingCell = processingCell.next();

  const day = processingCell.first().text().trim();
  processingCell = processingCell.next();

  const regExTime = processingCell
    .first()
    .text()
    .trim()
    .match(/(\d{4})-(\d{4})/);
  const timeStart = regExTime ? regExTime[1] : '';
  const timeEnd = regExTime ? regExTime[2] : '';
  processingCell = processingCell.next();

  const venue = processingCell.first().text().trim();
  processingCell = processingCell.next();

  const remark = processingCell.first().text().trim();

  // Done processing, return.
  return {
    type,
    group,
    day,
    timeStart,
    timeEnd,
    venue,
    remark,
  };
}

module.exports = getSingleClassInformation;
