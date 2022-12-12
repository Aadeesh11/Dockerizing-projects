const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

require("dotenv").config();

const users = require("./queries/userQueries");
const dashboards = require("./queries/dashBoardQueries");
const accessRecords = require("./queries/accessManQueries");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.post("/users", users.createUser);
app.post("/login", users.loginUser);
app.post("/dashboard", dashboards.createDashBoard);

app.get("/dashboard/settings", dashboards.getDashBoardSettings);
app.get("/dashboard/am", dashboards.getDashBoardAccessMan);
app.get("/dashboard/data", dashboards.getDashBoardData);

app.put("/dashboard/settings", dashboards.updateDashBoardSettings);
app.put("/dashboard/am", dashboards.updateDashBoardAccessMan);
app.put("/dashboard/data", dashboards.updateDashBoardData);

app.post("/accessMan", accessRecords.changeAccessLevel);

app.listen(port, () => {
  console.log(`server listening on port ${port}.`);
});
