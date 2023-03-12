import { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { AWSMetricsController } from '../AWSMetricsReportController';
import { AWSMetricsFileHandler } from '../handlers/AWSMetricsFileHandler';
import { MetricsXLSXReportService } from '../service/MetricsXSLXReportService';

export class FileController {
  // public uploadFile(req: Request, res: Response) {
  //   if (!req.file) {
  //     return res.status(400).send('No files were uploaded.');
  //   }

  //   if (req.files.length > 1) {
  //     return res.status(400).send('Only one file is allowed.');
  //   }

  //   return res.send('File uploaded successfully.');
  // }

  async uploadSingleFile(req: Request, res: Response) {
    req.setEncoding(`utf-8`);
    
    if (!req.files || !req.files.file) {
      return res.status(400).send('No file uploaded');
    }
    
    const files = req.files.file as fileUpload.UploadedFile[]
    // console.log(typeof files[0])
    
    if(files.length > 1) {
      const promises = files.map( uploadedFileXslxReport )

      await Promise.all(promises).finally(() => console.log("Promises fullfiled"))
    } else {
      await uploadedFileXslxReport(files[0])
    }

    // // res.send(report.metrics);
    // res.send(req)
  }
}

async function uploadedFileXslxReport(file: fileUpload.UploadedFile) {
  const uploadedData: {
    name: string,
    data: any,
    size: number,
    encoding: string
  } = file;

  const controller = new AWSMetricsController();

  const fixedFilename = handleUTFFileNames(uploadedData.name)

  const report = await controller.processRawData(
    new AWSMetricsFileHandler(fixedFilename),
    'upload',
    uploadedData.data
  )

  return await new MetricsXLSXReportService(report).buildExcel().then(() => {
    console.log(report.fileName = " report saved successfully")

  });
}

function handleUTFFileNames( nameFromRequest: string ) {
  const charsMap = {
    'oÌ\x81': 'ó',
    "cÌ§aÌo": 'ção',
  }

  let result = nameFromRequest;

  for (const [key, value] of Object.entries(charsMap)) {
    const regex = new RegExp(key, 'g');
    while (result.match(regex)) {
      result = result.replace(regex, value);
    }
  }
  console.log("Fixed filename ", result)

  return result;
}