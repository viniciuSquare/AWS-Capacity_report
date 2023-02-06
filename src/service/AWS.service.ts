import AWS from 'aws-sdk'
require('dotenv').config();

let credential = {
  accessKeyId: process.env.ACCESS_KEY_ID ? process.env.ACCESS_KEY_ID : "EMPTY",
  secretAccessKey: process.env.SECRET_ACCESS_KEY ? process.env.SECRET_ACCESS_KEY : "EMPTY"
}
const cloudwatch = new AWS.CloudWatch({
  region: 'sa-east-1',
  credentials: new AWS.Credentials(credential)
});

// const params = {
//   MetricDataQueries: [
//     {
//       Id: 'm1',
//       MetricStat: {
//         Metric: {
//           Dimensions: [
//             {
//               Name: 'InstanceId',
//               Value: 'All'
//             },
//             {
//               Name: 'InstanceName',
//               Value: 'All'
//             }
//           ],
//           MetricName: 'CPUUtilization',
//           Namespace: 'AWS/EC2'
//         },
//         Period: 3600,
//         Stat: 'Maximum'
//       }
//     }
//   ],
//   StartTime: new Date('2023-01-01T00:00:00Z'),
//   EndTime: new Date('2023-01-02T00:00:00Z')
// };

// // cloudwatch.getMetricData(params, (err, data) => {
// //   if (err) {
// //     console.log(err, err.stack);
// //   } else {
// //     console.log(data);
// //   }
// // });

const ec2 = new AWS.EC2({
  region: 'sa-east-1',
  credentials: new AWS.Credentials(credential)
});

ec2.describeInstances((err, data) => {

  let instances = data.Reservations?.map(data => data.Instances?.map(mapInstanceData)).flat()
  instances?.map(instance => instance?.Tags);
})

function mapInstanceData(instance: AWS.EC2.Instance) {
  const {
    InstanceId,
    InstanceType,
    KeyName,
    Monitoring,
    Placement,
    Platform,
    PrivateDnsName,
    PrivateIpAddress,
    PublicDnsName,
    PublicIpAddress,
    Tags,
    PlatformDetails,
    State
  } = instance

  const mappedData = {
    Produto: Tags?.find( tag => tag.Key == 'product' )?.Value || undefined,
    Label: Tags?.find( tag => tag.Key == 'Name' )?.Value || undefined,
    State: State?.Name,
    InstanceId,
    InstanceType,
    KeyName,
    Monitoring: Monitoring?.State,
    Region: Placement?.AvailabilityZone,
    Platform,
    PrivateDnsName,
    PrivateIpAddress,
    PublicDnsName,
    PublicIpAddress,
    Tags,
    PlatformDetails ,
  }

  return mappedData;
}

// const params = {
//   MetricDataQueries: [
//     {
//       Id: 'm1',
//       ReturnData: true,
//       MetricStat: {
//         Metric: {
//           Namespace: 'AWS/EC2',
//           MetricName: 'CPUUtilization',
//         },
//         Period: 3600,
//         Stat: 'Maximum'
//       },
//     },
//   ],
//   StartTime: new Date('2022-01-01T00:00:00Z'),
//   EndTime: new Date('2022-01-02T00:00:00Z'),
// };

// cloudwatch.getMetricData(params).promise()
//   .then(async data => {
//     const metricData = data.MetricDataResults[0];
//     const instanceName = await getInstanceName(metricData.Dimensions[0].Value);
//     console.log(`InstanceName: ${instanceName} | Maximum CPU Utilization: ${metricData.Values[0]}`);
//   })
//   .catch(err => {
//     console.error(err);
//   });
