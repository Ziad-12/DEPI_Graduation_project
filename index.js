const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./db");
const client = require("prom-client"); //change
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000; // port 8000
const host = process.env.HOST || "localhost"


const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Counter: URLs successfully shortened
const urlsShortenedTotal = new client.Counter({
  name: "webservice_urls_shortened_total",
  help: "Total number of URLs successfully shortened",
});

// Counter: Successful redirects
const redirectsTotal = new client.Counter({
  name: "webservice_redirects_total",
  help: "Total number of successful redirects",
});

// Counter: Failed lookups (404s)
const failedLookupsTotal = new client.Counter({
  name: "webservice_failed_lookups_total",
  help: "Total number of failed lookups (404 errors)",
});

// Histogram: Request latency
const requestLatency = new client.Histogram({
  name: "webservice_request_latency_seconds",
  help: "Request latency in seconds",
  labelNames: ["method", "route"],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

// Add Mertics
register.registerMetric(urlsShortenedTotal);
register.registerMetric(redirectsTotal);
register.registerMetric(failedLookupsTotal);
register.registerMetric(requestLatency);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.render("index.ejs");
});


app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Show all stored routes
app.get("/routes", (req, res) => {
  db.all("SELECT * FROM urls", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.render("routes.ejs", { links: rows,host:host,port:port });
  });
});

// Handle URL submission
app.post("/short", (req, res) => {
  
  const end = requestLatency.startTimer({ method: "POST", route: "/short" });
  const { url } = req.body;

  if (!url) {
    end(); 
    return res.status(400).send("Missing URL");
  }

  const shortCode = Math.random().toString(36).substring(2, 8);

  db.run(
    "INSERT INTO urls (source_url, result_url) VALUES (?, ?)",
    [url, shortCode],
    function (err) {
      if (err) {
        console.error(err);
        end(); 
        return res.status(500).send("Failed to save");
      }
      
      urlsShortenedTotal.inc();
      end(); 
      res.redirect("/routes");
    }
  );
});

// Redirect from short URL
app.get("/short/:code", (req, res) => {

  const end = requestLatency.startTimer({ method: "GET", route: "/short/:code" });
  const { code } = req.params;

  db.get(
    "SELECT source_url FROM urls WHERE result_url = ?",
    [code],
    (err, row) => {
      if (err) {
        end(); 
        return res.status(500).send("Database error");
      }
      if (!row) {

        failedLookupsTotal.inc();
        end(); 
        return res.status(404).send("Not found");
      }
      
      redirectsTotal.inc();
      end(); 
      res.redirect(row.source_url);
    }
  );
});

app.listen(port, () => {
  console.log(`http://${host|| "localhost"}:${port}`);
});