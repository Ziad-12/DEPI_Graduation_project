const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./db");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Show all stored routes
app.get("/routes", (req, res) => {
  // console.log("routes working ");
  
  db.all("SELECT * FROM urls", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

    // console.log(rows);
    res.render("routes.ejs", { links: rows });
  });
});


// Handle URL submission
app.post("/short", (req, res) => {
  const { url } = req.body;

  
  if (!url) return res.status(400).send("Missing URL");

  const shortCode = Math.random().toString(36).substring(2, 8);

  db.run(
    "INSERT INTO urls (source_url, result_url) VALUES (?, ?)",
    [url, shortCode],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Failed to save");
      }
      res.redirect("/routes");
    }
  );
});

// Redirect from short URL
app.get("/short/:code", (req, res) => {
  const { code } = req.params;
  db.get(
    "SELECT source_url FROM urls WHERE result_url = ?",
    [code],
    (err, row) => {
      if (err) return res.status(500).send("Database error");
      if (!row) return res.status(404).send("Not found");
      res.redirect(row.source_url);
    }
  );
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
