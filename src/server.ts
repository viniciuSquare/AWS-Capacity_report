import express, { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { InstancesMetadataHelper } from './handlers/InstancesMap';
import { PROOutputReport } from './models/ProOutputReport';
import multer from 'multer';
import path from 'path';
import { FileController } from './Controllers/FileController';

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

app.get('/plus/instances', async (req: Request, res: Response) => {
  const instancesMapper = new InstancesMetadataHelper({ region: 'sa-east-1' }, 'PLUS')
  res.send(await instancesMapper.feedInstancesData())
})

// Uploading files
const uploadDir = './Treated/Upload';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage: storage
});

// Handle the form submission and file upload
app.post('/upload', new FileController().uploadSingleFile);

app.listen(3000, () => console.log('Server started on port 3000'));
