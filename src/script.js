const XLSX = require("xlsx");
const fs = require("fs");
const { filesToClean, processFileData } = require("./fileHandler");

// Clean files to handle data
filesToClean()
    .then((file) => file.forEach(processFileData));


    // 

function generateReport() {
  checkFilesQueue().forEach( file => {
    processFileData(fileName)
  } )
}

/**
 * @returns array of files on queue to process 
 * */ 
function checkFilesQueue() {
  // Get uncleaned files to process

  return []
}