//This file was broken down into queries folder.

// const Pool = require("pg").Pool;

// const pool = new Pool({
//   user: "me",
//   host: "localhost",
//   database: "api",
//   password: "pass",
//   port: 5432,
// });

// // create our tables
// const createUserTableText = `
// CREATE TABLE IF NOT EXISTS users (
//   ID SERIAL PRIMARY KEY,
//   name VARCHAR(100),
//   email VARCHAR(100),
//   pass VARCHAR(100)
// );
// `;
// pool.query(createUserTableText);

// const createDashBoardTableText = `
// CREATE TABLE IF NOT EXISTS dashboard (
//     ID SERIAL PRIMARY KEY,
//     name VARCHAR(100),
//     user_id INTEGER REFERENCES users(ID),
//     settings VARCHAR(100),
//     accessMan VARCHAR(100),
//     data VARCHAR(100)
//     );
// `;

// pool.query(createDashBoardTableText);

// const createAccessManTableText = `
// CREATE TABLE IF NOT EXISTS accessRecords (
//     ID SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(ID),
//     dashboard_id INTEGER REFERENCES dashboard(ID),
//     settingAccessLevel VARCHAR(10),
//     dataAccessLevel VARCHAR(10),
//     accessManAccessLevel VARCHAR(10)
//     );
// `;

// pool.query(createAccessManTableText);

// var bcrypt = require("bcryptjs");
// var salt = bcrypt.genSaltSync(10);

// //signup
// const createUser = (request, response) => {
//   const { name, email, password } = request.body;

//   if (password.length > 100) {
//     response.status(501).send("Password too long");
//     return;
//   }

//   pass = bcrypt.hashSync(password, salt);

//   pool.query(
//     "INSERT INTO users (name, email, pass) VALUES ($1, $2, $3) RETURNING *",
//     [name, email, pass],
//     (error, results) => {
//       if (error) {
//         response.status(501).send(error.toString());
//       }
//       response.status(201).send(`User added with ID: ${results.rows[0].id}`);
//     }
//   );
// };

// //login
// const loginUser = (request, response) => {
//   const { email, password } = request.body;

//   pass = bcrypt.hashSync(password, salt);
//   pool.query(
//     "SELECT * FROM users WHERE email = $1 AND pass = $2",
//     [email, pass],
//     (error, results) => {
//       if (error) {
//         response.status(501).send(error.toString());
//       }
//       if (results.rows.length == 0) {
//         response.status(501).send("User not found");
//       } else {
//         response.status(201).send({
//           "user logged in": true,
//           token: results.rows[0].id.toString(),
//         });
//       }
//     }
//   );
// };

// //createDashBoard
// const createDashBoard = async (request, response) => {
//   const { name, token } = request.body;

//   id = parseInt(token);
//   if (!id) {
//     response.status(501).send("Invalid token");
//     return;
//   }

//   user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [id]);

//   if (user_id.rows.length == 0) {
//     response.status(501).send("User not found");
//     return;
//   }

//   pool.query(
//     "INSERT INTO dashboard (name, user_id, settings, accessMan, data) VALUES ($1, $2, $3, $4, $5) RETURNING *",
//     [
//       name,
//       user_id.rows[0].id,
//       "DefaultSettings",
//       "DefaultAccessMan",
//       "DefaultData",
//     ],
//     (error, results) => {
//       if (error) {
//         response.status(501).send(error.toString());
//       }

//       //set this user as admin of the dashboard;
//       pool.query(
//         "INSERT INTO accessRecords (dashboard_id, user_id, settingAccessLevel, dataAccessLevel, accessManAccessLevel) VALUES ($1, $2, $3, $4, $5) RETURNING *",
//         [results.rows[0].id, user_id.rows[0].id, "write", "write", "write"],
//         (error, res) => {
//           if (error) {
//             response.status(501).send(error.toString());
//           }
//           response.status(201).send({
//             success: true,
//             dashBoard: results.rows[0],
//             accessMan: res.rows[0],
//           });
//         }
//       );
//     }
//   );
// };

// //Read DashBoard settings.
// const getDashBoardSettings = async (request, response) => {
//   try {
//     const { dashBoardID, token } = request.body;
//     user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

//     if (user_id.rows.length == 0) {
//       response.status(501).send("User not found");
//       return;
//     }

//     dID = parseInt(dashBoardID);

//     if (!dID) {
//       response.status(501).send("Invalid DashBoard ID");
//       return;
//     }

//     //check if user has access to dashboard settings
//     access = await pool.query(
//       "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//       [dID, user_id.rows[0].id]
//     );

//     if (
//       access.rows.length == 0 ||
//       (access.rows[0].settingaccesslevel !== "write" &&
//         access.rows[0].settingaccesslevel !== "read")
//     ) {
//       response.status(501).send("User does not have access to this dashboard");
//       return;
//     }

//     pool.query(
//       "SELECT settings FROM dashboard WHERE ID = $1",
//       [dID],
//       (error, results) => {
//         if (error) {
//           response.status(501).send(error.toString());
//         }
//         response
//           .status(201)
//           .send({ success: true, settings: results.rows[0].settings });
//       }
//     );
//   } catch (error) {
//     response.status(501).send(e.toString());
//   }
// };

// //Read DashBoard AccessMan.
// const getDashBoardAccessMan = async (request, response) => {
//   try {
//     const { dashBoardID, token } = request.body;
//     user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

//     if (user_id.rows.length == 0) {
//       response.status(501).send("User not found");
//       return;
//     }

//     dID = parseInt(dashBoardID);

//     if (!dID) {
//       response.status(501).send("Invalid DashBoard ID");
//       return;
//     }

//     //check if user has access to dashboard accessMan
//     access = await pool.query(
//       "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//       [dID, user_id.rows[0].id]
//     );

//     if (
//       access.rows.length == 0 ||
//       (access.rows[0].accessmanaccesslevel != "write" &&
//         access.rows[0].accessmanaccesslevel != "read")
//     ) {
//       response.status(501).send("User does not have access to this dashboard");
//       return;
//     }

//     pool.query(
//       "SELECT accessMan FROM dashboard WHERE ID = $1",
//       [dID],
//       (error, results) => {
//         if (error) {
//           response.status(501).send(error.toString());
//         }
//         response
//           .status(201)
//           .send({ success: true, accessMan: results.rows[0].accessman });
//       }
//     );
//   } catch (e) {
//     response.status(501).send(e.toString());
//   }
// };

// //Read Dashboard data.
// const getDashBoardData = async (request, response) => {
//   try {
//     const { dashBoardID, token } = request.body;
//     user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

//     if (user_id.rows.length == 0) {
//       response.status(501).send("User not found");
//       return;
//     }

//     dID = parseInt(dashBoardID);

//     if (!dID) {
//       response.status(501).send("Invalid DashBoard ID");
//       return;
//     }

//     //check if user has access to dashboard data
//     access = await pool.query(
//       "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//       [dID, user_id.rows[0].id]
//     );

//     if (
//       access.rows.length == 0 ||
//       (access.rows[0].dataaccesslevel != "write" &&
//         access.rows[0].dataaccesslevel != "read")
//     ) {
//       response.status(501).send("User does not have access to this dashboard");
//       return;
//     }

//     pool.query(
//       "SELECT data FROM dashboard WHERE ID = $1",
//       [dID],
//       (error, results) => {
//         if (error) {
//           response.status(501).send(error.toString());
//         }
//         response
//           .status(201)
//           .send({ success: true, data: results.rows[0].data });
//       }
//     );
//   } catch (e) {
//     response.status(501).send(e.toString());
//   }
// };

// //Update DashBoard parts.
// const updateDashBoardSettings = async (request, response) => {
//   const { dashBoardID, token, newSettings } = request.body;

//   user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

//   if (user_id.rows.length == 0) {
//     response.status(501).send("User not found");
//     return;
//   }

//   dID = parseInt(dashBoardID);

//   if (!dID) {
//     response.status(501).send("Invalid DashBoard ID");
//     return;
//   }

//   //check if user has access to dashboard settings
//   access = await pool.query(
//     "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//     [dID, user_id.rows[0].id]
//   );

//   if (
//     access.rows.length == 0 ||
//     access.rows[0].settingaccesslevel !== "write"
//   ) {
//     response.status(501).send("User does not have access to this dashboard");
//     return;
//   }
//   pool.query(
//     "UPDATE dashboard SET settings = $2 WHERE ID = $1 RETURNING settings",
//     [dashBoardID, newSettings],
//     (error, results) => {
//       if (error) {
//         response.status(501).send(error.toString());
//       }

//       response
//         .status(201)
//         .send({ success: true, newSettings: results.rows[0].settings });
//     }
//   );
// };

// const updateDashBoardAccessMan = async (request, response) => {
//   const { dashBoardID, token, newAccessMan } = request.body;

//   user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

//   if (user_id.rows.length == 0) {
//     response.status(501).send("User not found");
//     return;
//   }

//   dID = parseInt(dashBoardID);

//   if (!dID) {
//     response.status(501).send("Invalid DashBoard ID");
//     return;
//   }

//   //check if user has access to dashboard accessMan
//   access = await pool.query(
//     "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//     [dID, user_id.rows[0].id]
//   );

//   if (
//     access.rows.length == 0 ||
//     access.rows[0].accessmanaccesslevel !== "write"
//   ) {
//     response.status(501).send("User does not have access to this dashboard");
//     return;
//   }
//   pool.query(
//     "UPDATE dashboard SET accessMan = $2 WHERE ID = $1 RETURNING accessMan",
//     [dashBoardID, newAccessMan],
//     (error, results) => {
//       if (error) {
//         response.status(501).send(error.toString());
//       }

//       response
//         .status(201)
//         .send({ success: true, newAccessMan: results.rows[0].accessman });
//     }
//   );
// };

// const updateDashBoardData = async (request, response) => {
//   const { dashBoardID, token, newData } = request.body;

//   user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

//   if (user_id.rows.length == 0) {
//     response.status(501).send("User not found");
//     return;
//   }

//   dID = parseInt(dashBoardID);

//   if (!dID) {
//     response.status(501).send("Invalid DashBoard ID");
//     return;
//   }

//   //check if user has access to dashboard data
//   access = await pool.query(
//     "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//     [dID, user_id.rows[0].id]
//   );

//   if (access.rows.length == 0 || access.rows[0].dataaccesslevel !== "write") {
//     response.status(501).send("User does not have access to this dashboard");
//     return;
//   }
//   pool.query(
//     "UPDATE dashboard SET data = $2 WHERE ID = $1 RETURNING data",
//     [dashBoardID, newData],
//     (error, results) => {
//       if (error) {
//         response.status(501).send(error.toString());
//       }

//       response
//         .status(201)
//         .send({ success: true, newData: results.rows[0].data });
//     }
//   );
// };

//Change Access Level
//a user can give/revoke access to other user on 3 levels: settings, accessMan, and data with access being (read/write/none)
//for eg a user can give another user "read" access to settings and "write" access to data but "none" access to accessMan
// const changeAccessLevel = async (request, response) => {
//   const { dashBoardID, token, userID, newAccessLevelKey, newAccessLevelData } =
//     request.body;

//   user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [userID]);

//   if (user_id.rows.length == 0) {
//     response.status(501).send("User not found");
//     return;
//   }

//   dID = parseInt(dashBoardID);

//   if (!dID) {
//     response.status(501).send("Invalid DashBoard ID");
//     return;
//   }

//   //check if token(token of the user giving permissions) has access to dashboard accessMan
//   let access = await pool.query(
//     "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//     [dID, token]
//   );

//   if (
//     access.rows.length == 0 ||
//     access.rows[0].accessmanaccesslevel !== "write"
//   ) {
//     response.status(501).send("User does not have access to this dashboard");
//     return;
//   }

//   //check if accessRecord of the user getting permission exists
//   access = await pool.query(
//     "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
//     [dID, user_id.rows[0].id]
//   );

//   if (access.rows.length == 0) {
//     let query = `INSERT INTO accessRecords (dashboard_id, user_id, ${newAccessLevelKey}) VALUES ($1, $2, $3) RETURNING ${newAccessLevelKey}`;
//     pool.query(
//       query,
//       [dID, user_id.rows[0].id, newAccessLevelData],
//       (error, results) => {
//         if (error) {
//           response.status(501).send(error.toString());
//         }
//         response.status(201).send({
//           success: true,
//           message: `${newAccessLevelKey} Changed to ${newAccessLevelData} for user ${userID}`,
//         });
//       }
//     );
//   } else {
//     let query = `UPDATE accessRecords SET ${newAccessLevelKey} = $2 WHERE dashboard_id = $1 AND user_id = $3 RETURNING ${newAccessLevelKey}`;
//     pool.query(
//       query,
//       [dashBoardID, newAccessLevelData, userID],
//       (error, results) => {
//         if (error) {
//           response.status(501).send(error.toString());
//         }

//         response.status(201).send({
//           success: true,
//           newAccessLevelKey: results.rows[0][newAccessLevelKey.toLowerCase()],
//         });
//       }
//     );
//   }
// };

// module.exports = {
//   createUser,
//   loginUser,
//   createDashBoard,
//   getDashBoardSettings,
//   getDashBoardAccessMan,
//   getDashBoardData,
//   updateDashBoardSettings,
//   updateDashBoardAccessMan,
//   updateDashBoardData,
//   changeAccessLevel,
// };
