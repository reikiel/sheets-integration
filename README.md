# Github Issues to Google Sheets Integration

## Features

- Initialise new sheet to set headers
- Listens to Github repo webhook for changes in issues
- Sync edits and prevent duplication of edits
- Use of Docker to run application
- Able to clear sheets should you wish to use an existing unrelated sheet, or restart the process

## Technical Documentation

- For API documentation, navigate to public folder and open index.html in your browser
- For flowchart, navigate to public folder and open

## Instructions to run application

1. Enable Google Sheets API from Google Cloud Platform and create service account
2. Enable API keys and get credentials, rename the file to 'credentials.json' and place in folder
3. Using the Google Sheet you want to edit, share the sheet with the service account as an 'Editor'
4. Get the Google Sheet ID, and replace 'spreadsheetID' in config.json with your ID

- enable API from GCP & create service account
- Enable keys and get credentials put in here
- Share sheets with service account
- putting Sheets ID into config file
- $ docker build -t {name} .
- $ docker run -d -p 8080:8080 {name}
- creating webhook on github and using ngrok to test

### Using Docker

```
docker build -t name
```

### Without Docker

## What is incompleted/not working fully

- Did not return JSON response, only returned code and a message
