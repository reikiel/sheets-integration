const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
var config = require("./config.json");
let sheetName = "Sheet1";

const app = express();
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // create client instance for auth
    const client = await auth.getClient();

    // instance of sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });

    // get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId: config.spreadsheetID,
    });

    // read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId: config.spreadsheetID,
      range: `${sheetName}`, // filter column eg Sheet1!A:A
    });

    // Write headers to spreadsheet on initialisation
    await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId: config.spreadsheetID,
      range: `${sheetName}!A:E`,
      valueInputOption: "USER_ENTERED", // other option is RAW
      resource: {
        values: [["number", "title", "url", "userName", "state"]],
      },
    });

    res.status(200).send("Sheets initialised with headers");
  } catch (e) {
    res.status(500).send(e);
  }
});

// webhook api
app.post("/issue", async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // create client instance for auth
    const client = await auth.getClient();

    // instance of sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });

    // console.log(req.body);
    let action = req.body.action; // edited, closed, reopened, opened
    let title = req.body.issue.title;
    let url = req.body.issue.url;
    let id = req.body.issue.id;
    let number = req.body.issue.number;
    let userName = req.body.issue.user.login;
    let state = req.body.issue.state;

    switch (action) {
      // Case 1: New issue
      case "opened":
        await googleSheets.spreadsheets.values.append({
          auth,
          spreadsheetId: config.spreadsheetID,
          range: `${sheetName}!A:E`,
          valueInputOption: "USER_ENTERED",
          resource: {
            values: [[number, title, url, userName, state]],
          },
        });
        break;
      // Case 2: Edited title - if no matching issue, then insert new
      // Case 3: Open/Close issue - if no matching issue, insert new
      case "edited":
      case "closed":
      case "reopened":
        // read rows from spreadsheet
        let getRows = await googleSheets.spreadsheets.values.get({
          auth,
          spreadsheetId: config.spreadsheetID,
          range: `${sheetName}`, // filter column eg Sheet1!A:A
        });
        let rows = getRows.data.values;

        // search rows to see if number matches
        let match = false;
        let rowToUpdate;
        for (let i = 0; i < rows.length; i++) {
          if (parseInt(rows[i][0]) === number) {
            match = true;
            rowToUpdate = i + 1;
            break;
          }
        }

        // if no match then insert into docs
        // else if have match then update the row
        if (!match) {
          await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId: config.spreadsheetID,
            range: `${sheetName}!A:E`,
            valueInputOption: "USER_ENTERED",
            resource: {
              values: [[number, title, url, userName, state]],
            },
          });
        } else {
          await googleSheets.spreadsheets.values.update({
            auth,
            spreadsheetId: config.spreadsheetID,
            range: `${sheetName}!A${rowToUpdate}:E${rowToUpdate}`,
            valueInputOption: "USER_ENTERED",
            resource: {
              values: [[number, title, url, userName, state]],
            },
          });
        }
        break;
      default:
        console.log("Unconfigured action");
        break;
    }

    res.status(200).send("Sheets successfully updated");
  } catch (e) {
    console.log(e);
    res.status(500).send("error");
  }
});

// endpoint for clearing sheets? just for fun or if needed (sheet has some unrelated data for some reason)
app.delete("/issue", async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // create client instance for auth
  const client = await auth.getClient();

  // instance of sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  // clear whatever is on the sheets - move to another endpoint
  try {
    await googleSheets.spreadsheets.values.clear({
      spreadsheetId: config.spreadsheetID,
      range: "Sheet1",
    });
    console.log("Sheet cleared");
    res.status(200).send("Sheets successfully cleared");
  } catch (e) {
    console.log(e);
    res.status(500).send("error");
  }
});

app.listen(8080, (req, res) => console.log("Running on 8080"));
