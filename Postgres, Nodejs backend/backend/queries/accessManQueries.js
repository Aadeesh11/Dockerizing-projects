const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});
const createAccessManTableText = `
CREATE TABLE IF NOT EXISTS accessRecords (
    ID SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(ID),
    dashboard_id INTEGER REFERENCES dashboard(ID),
    settingAccessLevel VARCHAR(10), 
    dataAccessLevel VARCHAR(10), 
    accessManAccessLevel VARCHAR(10)
    );
`;

pool.query(createAccessManTableText);

//a user can give/revoke access to other user on 3 levels: settings, accessMan, and data with access being (read/write/none)
//for eg a user can give another user "read" access to settings and "write" access to data but "none" access to accessMan
const changeAccessLevel = async (request, response) => {
  const { dashBoardID, token, userID, newAccessLevelKey, newAccessLevelData } =
    request.body;

  user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [userID]);

  if (user_id.rows.length == 0) {
    response.status(501).send("User not found");
    return;
  }

  dID = parseInt(dashBoardID);

  if (!dID) {
    response.status(501).send("Invalid DashBoard ID");
    return;
  }

  //check if token(token of the user giving permissions) has access to dashboard accessMan
  let access = await pool.query(
    "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
    [dID, token]
  );

  if (
    access.rows.length == 0 ||
    access.rows[0].accessmanaccesslevel !== "write"
  ) {
    response.status(501).send("User does not have access to this dashboard");
    return;
  }

  //check if accessRecord of the user getting permission exists
  access = await pool.query(
    "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
    [dID, user_id.rows[0].id]
  );

  if (access.rows.length == 0) {
    let query = `INSERT INTO accessRecords (dashboard_id, user_id, ${newAccessLevelKey}) VALUES ($1, $2, $3) RETURNING ${newAccessLevelKey}`;
    pool.query(
      query,
      [dID, user_id.rows[0].id, newAccessLevelData],
      (error, results) => {
        if (error) {
          response.status(501).send(error.toString());
        }
        response.status(201).send({
          success: true,
          message: `${newAccessLevelKey} changed to ${newAccessLevelData} for userID: ${userID}`,
        });
      }
    );
  } else {
    let query = `UPDATE accessRecords SET ${newAccessLevelKey} = $2 WHERE dashboard_id = $1 AND user_id = $3 RETURNING ${newAccessLevelKey}`;
    pool.query(
      query,
      [dashBoardID, newAccessLevelData, userID],
      (error, results) => {
        if (error) {
          response.status(501).send(error.toString());
        }

        response.status(201).send({
          success: true,
          message: `${newAccessLevelKey} changed to ${newAccessLevelData} for userID: ${userID}`,
        });
      }
    );
  }
};

module.exports = {
  changeAccessLevel,
};
