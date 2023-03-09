import express, { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import XLSX from 'xlsx';
import { AWSMetricsController } from './AWSMetricsReportController';
import { AWSMetricsFileHandler } from './handlers/AWSMetricsFileHandler';
import { PROOutputReport } from './models/ProOutputReport';

const app = express();

// Use the fileUpload middleware to handle file uploads
app.use(fileUpload());

// Serve the HTML form on the root path
app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/pro/fromwidget', (req: Request, res: Response) => {
  new PROOutputReport().getMetricsFromWidgetParams()
});

app.get('/pro/cpu/cloudwatch', async (req: Request, res: Response) => {
  res.send(await new PROOutputReport().getCPUMetricsFromCloudWatchParams())
});

// Handle the form submission and file upload
app.post('/upload', async (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file uploaded');
  }

  res.send(req.files);

  const uploadedData: {
    name: string,
    data: any,
    size: number,
    encoding: string
  } = req.files.file as any;

  const controller = new AWSMetricsController();
  
  console.log(uploadedData,"\n\n", typeof uploadedData.data.data);

  const report = await controller.processRawData(
    new AWSMetricsFileHandler(uploadedData.name),
    'upload',
    uploadedData.data
  )

  console.log(report)

  // const sheetsData = uploadedData
  //   .map( data => {
  //     workbook: XLSX.read( data, { type: 'buffer' });
  //     sheetNames: workbook.SheetNames;
  //   } 
  // )

  // const data: { [key: string]: any } = {};

  // sheetNames.forEach((sheetName: string) => {
  //   const sheet = workbook.Sheets[sheetName];
  //   const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  //   data[sheetName] = sheetData;
  // });
  res.send(report.metrics);
});

app.listen(3000, () => console.log('Server started on port 3000'));
