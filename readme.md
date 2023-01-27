# AWS Capacity Report handler
This tool must help AWS metrics reports generation to performance analysis.

####**Nowdays** is done daily and manually, day-by-day. 
With data extracted - CSV report -, it is formatted: numbers fixed and business period filtered. So data is pasted into model sheet with instances label as header, after all days of the week is completed, week report is compilated with day's data.

It process CPU and Memory metrics from CSV reports generated from AWS dashboard. 

**Data structure**

| Class | Functionally |
| ---   |     ---      | 
Queue | Reads raw files directory to get files queue. |
AWS File helper | Process data from CSV and format into treated data to report generation. |
| AWS Metrics Controller | Controls the workflow: **Files on queue** > Get **environment Metadata** > **Process and format CSV** to get metrics data > **Build/update XLSX reports**
    
# Running the script
With **nodeJS** installed, execute the commands:
- To install dependencies `` npm install ``
- Then run with `` npm start `` after set 
## Change Log
####**→ 27 Jan 2023**
► Created `readme.md` with project details and **change logs**.


####**→ 26 Jan 2023**
► Improving data structures, isolating types. 
► Mapped dashboards name and its specificities. 
► Fixed instances metadata handling.

####**→ 25 Jan 2023**

Async data was fixed, improving formatted data and  data structures. 
To fix some technical debts from data fetching Promises.
► Creating remote repository

---
####**→ 23 Jan 2023**
Created **AWS Metrics Report Controller** which basically is instantiated by main script and runs the workflows: 
→ Map metrics from files on queue and generate reports from grouped data    

►  Created `InstancesMetadataHelper` → Attempts to fetch AWS instances details with AWS SDK because instances IDs on CSV files doesn’t match with XLSX . 

►  Struggling to handle async on workflow

Trying to improve its call on workflow, so metrics data can be mapped with instances label.

►  `AWSFileHandler` → Getters to header, region and content from raw data.

---
####**→ 20 Jan 2023**
Refactoring structures to isolate responsibilities. Treating async calls error and types conflicts.

► Created **Classes diagram** and **Data structures** to ease visualization.

---
####**→ 18 Jan 2023**

Some CSV file handling was abstracted and `MetricsCSVFile` is `AWSFileHandler`, handling data and formatting day props. Improved methods typing.

►  Attempts to fetch AWS metrics details with AWS SDK

►  Working on AWS instances metadata getter. It will be used to identify metric specificity. Attempting to map instances from XLSM report given.

---
####**→ 17 Jan 2023**

Converted elements to a rough class, intend to clean **process work** from **data structures.** Having trouble with async request to read raw CSV report. When `Metric` is passed to report generation, it still doesn’t have data to be formatted.

---
####**→ 16 Jan 2023**

Converting code to typescript usage to use type hints and study more about its usage. 

Create `Queue` & `Report` handlers, and `MetricsCSVFile` to read, process and return formatted data.
