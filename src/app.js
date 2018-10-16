const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const database = require("./database");
const functions = require("./utils/airtableReturns");

const app = express();
app.set("port", process.env.PORT || 3333);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("/api/history", (req, res) => {
  database("History_Stations")
    .select()
    .firstPage((err, records) => {
      if (err) functions.returnEmptyPayload(res, err);
      else {
        const stations = [];
        records.forEach(record => {
          stations.push(record.get("station_name"));
        });
        functions.returnPopulatedPayload(res, stations);
      }
    });
});

app.get("/api/history/:station", (req, res) => {
  const caseTitles = [];
  database("History_Stations")
    .select({
      fields: ["primary_key"],
      filterByFormula: `({station_name} = '${req.params.station}')`
    })
    .firstPage((err, record) => {
      if (err || record.length === 0) functions.returnEmptyPayload(res, err);
      else {
        database("History_Cases")
          .select({
            fields: ["case_title", "primary_key"],
            filterByFormula: `({station_id} = ${record[0].get("primary_key")})`
          })
          .eachPage(
            (records, fetchNextPage) => {
              records.forEach(record => {
                caseTitles.push({
                  title: record.get("case_title"),
                  id: record.get("primary_key")
                });
              });
              fetchNextPage();
            },
            err => {
              if (err) functions.returnEmptyPayload(res, err);
              functions.returnPopulatedPayload(res, caseTitles);
            }
          );
      }
    });
});

// the airTable query doesn't actually use req.params.station for error checking or validation
// this will cause an extra API call but it might be a nice addition when the amount of data starts to grow
app.get("/api/history/:station/case/:id", (req, res) => {
  database("History_Cases")
    .select({
      fields: ["case_title", "case_details", "mark_scheme_id"],
      filterByFormula: `({primary_key} = '${req.params.id}')`
    })
    .firstPage((err, record) => {
      if (err || record.length === 0)
        functions.returnEmptyPayload(res, err, {});
      else {
        database("Mark_Scheme").find(
          record[0].get("mark_scheme_id"),
          (err, scheme) => {
            if (err || record.length === 0)
              functions.returnEmptyPayload(res, err, {});
            functions.returnPopulatedPayload(res, {
              title: record[0].get("case_title"),
              details: record[0].get("case_details"),
              mark_scheme: [...scheme.fields.mark_scheme.split(", ")]
            });
          }
        );
      }
    });
});

// this serves index.html no matter what the route, so that React routing can take charge of what to display and the server stays out of interval
// if we need active routes (e.g. for database queries), all we'll likely need to do is add those routes above this app.get(), so they'll be hit first
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

module.exports = app;
