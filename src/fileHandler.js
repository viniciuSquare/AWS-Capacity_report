const fs = require("fs");

/**
 * @returns array of uncleaned files
 */
async function checkFilesQueue() {
  let rawFilesList = await fs.readdirSync(`${__dirname}/Raw`, "utf-8");
  let cleanedFilesList = await fs.readdirSync(`${__dirname}/Cleaned`, "utf-8");

  const filesToTreat = rawFilesList.filter(
    (fileName) => !cleanedFilesList.includes(fileName)
  );
  console.log("Uncleaned files", filesToTreat);

  return filesToTreat;
}

/**
 * Remove first 4 unused lines and save file to `Cleaned` directory
 * @param fileName string
 */
function processFileData(fileName) {
  fs.readFile(`${__dirname}/Raw/${fileName}`, "utf8", (err, data) => {
    console.log(err, data);

    if (data.startsWith("data:text/csv")) data = removeUnsedHeadFromFile(data);

    return data;
  });
}

function handleHeadLines(fileString) {
  fileString.split('\n').map(getHeaderAndContent)
}

function getHeaderAndContent() {
  const headLineEnd = 4;
  let daraArray= []
  return daraArray.filter(  )

}

function removeUnsedHeadFromFile(fileString) {
  const headLineEnd = 4;
  let dataToAnalysis = [];

  fileString.split("\n").forEach((string, idx) => {
    if (idx >= headLineEnd) {
      dataToAnalysis.push(string);
    }
    return;
  });

  return dataToAnalysis.join(`\n`);
}

function saveCleanedDataToFile(data) {
  fs.writeFileSync(`./Cleaned/${fileName}`, data);
}
// DATA PROCESSING
/**
 * @returns array of uncleaned files
 */
async function filesToTreat() {
  let cleanedFilesList = await fs.readdirSync(`${__dirname}/Cleaned`, "utf-8");
  let treatedFilesList = await fs.readdirSync(`${__dirname}/Treated`, "utf-8");

  const filesToTreat = cleanedFilesList.filter(
    (fileName) => !treatedFilesList.includes(fileName)
  );
  console.log("Untreated files", filesToTreat);

  return filesToTreat;
}

function dataHandler(fileName) {
  const file = XLSX.readFile(`Cleaned/${fileName}`, {
    type: "binary",
    cellDates: true,
  });
  //   TODO - handle data

  //   TODO - Save to EXCEL
}

function dataIntoSheet(sheets) {
  const jsonSheet = XLSX.utils.sheet_to_json(sheets);

  var workbook = XLSX.utils.book_new();
  let worksheet = XLSX.utils.json_to_sheet(formatSheet(jsonSheet));

  XLSX.utils.book_append_sheet(workbook, worksheet, "DIA X");

  var wopts = { bookType: "xlsx", bookSST: false, type: "binary" };

  XLSX.writeFileXLSX(
    workbook,
    `FINISH - ${new Date().getDate()} ${new Date().getMonth()}.xlsx`,
    wopts
  );

  // console.table(jsonSheet.map( row => console.log(formatDate(row.Label))));
}

function formatSheet(sheet) {
  const metricKeys = {
    CPUUtilization: "AppQuiverPro_01",
    CPUUtilization_1: "AppQuiverPro_02",
    CPUUtilization_2: "AppQuiverPro_03",
    CPUUtilization_3: "AppQuiverPro_04",
    CPUUtilization_4: "AppQuiverPro_05",
    CPUUtilization_5: "AppQuiverPro_06",
    CPUUtilization_6: "AppQuiverPro_07",
    CPUUtilization_7: "AppQuiverPro_08",
    CPUUtilization_8: "AppQuiverPro_09",
    CPUUtilization_9: "AppQuiverPro_10",
    CPUUtilization_10: "AppQuiverPro_11",
    CPUUtilization_11: "AppQuiverPro_12",
    CPUUtilization_12: "AppQuiverPro_13",
  };

  return sheet
    .map(convertDateFields)
    .filter((row) => isBusinessDay(row.day))
    .filter((row) => isBusinessHour(row.hour));
}

function convertDateFields(sheetRow) {
  let dateIntoColumns = formatDate(sheetRow.Label);
  delete sheetRow.Label;

  return {
    ...dateIntoColumns,
    ...sheetRow,
  };
}

function formatDate(date) {
  return {
    day: new Date(date).getDay(),
    date: new Date(date).toLocaleDateString(),
    hour: new Date(date).getHours(),
  };
}

function isBusinessDay(day) {
  const weekendDays = [0, 6];
  return !weekendDays.includes(day);
}

function isBusinessHour(hour) {
  const businessHour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  return businessHour.includes(hour);
}

module.exports = {
  checkFilesQueue,
  processFileData,
};
