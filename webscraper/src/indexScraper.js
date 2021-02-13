const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');
// htmlparser2 is more lenient with markup, allows <tr>s, <td>s, etc without <table>, <tbody>.
const getSingleClassInformation = require('./classScraper');

function getAllIndexesInformation(RAW_TABLE) {
  /*
    Parameters: RAW_TABLE - Expecting _ONE_ HTML <table>...</table> 
    Module information taken from:
    https://wish.wis.ntu.edu.sg/webexe/owa/aus_schedule.main
    https://wish.wis.ntu.edu.sg/webexe/owa/AUS_SCHEDULE.main_display1

    Returns an array of objects in the form {indexNumber, classes}
  */
  if (!RAW_TABLE) throw new Error('No HTML received!');
  const dom = htmlparser2.parseDOM(RAW_TABLE);
  const $ = cheerio.load(dom);

  if ($('table').length !== 1)
    throw new Error(`Expected 1 row, found ${$('table').length}`);

  // .next skips processing the table header row
  let processingRow = $('tr').next();

  if (processingRow.length === 0)
    throw new Error(`No indexes or classes found!`);

  //

  // temp arrays for appending
  const indexes = [];
  let currentClasses = [];

  // Processing
  let currentIndexNumber;
  let classInfo;
  processingRow.each((row_no, row) => {
    rowIndexNumber = $('td', row).first().text().trim();
    if (rowIndexNumber === '') {
      //continuation of previous index
      classInfo = getSingleClassInformation($.html(row));
      currentClasses.push(classInfo);
    } else {
      //new index
      // push previous information, if exists.
      // mainly because when it encounters the first row, it will attempt to push.
      // but nothing to push.
      if (currentIndexNumber) {
        indexes.push({
          indexNumber: currentIndexNumber,
          classes: currentClasses,
        });
      }
      // start new
      currentIndexNumber = rowIndexNumber;
      currentClasses = [];
      classInfo = getSingleClassInformation($.html(row));
      currentClasses.push(classInfo);
    }
  });
  // push final index which wasn't captured because there was no new index
  if (currentIndexNumber) {
    indexes.push({
      indexNumber: currentIndexNumber,
      classes: currentClasses,
    });
  }

  return indexes;
}

module.exports = getAllIndexesInformation;
