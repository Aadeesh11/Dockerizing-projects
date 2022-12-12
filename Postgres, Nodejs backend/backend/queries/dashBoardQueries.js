const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const createDashBoardTableText = `
CREATE TABLE IF NOT EXISTS dashboard (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    user_id INTEGER REFERENCES users(ID),
    settings VARCHAR(100),
    accessMan VARCHAR(100),
    data VARCHAR(100)
    );
`;

pool.query(createDashBoardTableText);

//createDashBoard
const createDashBoard = async (request, response) => {
  const { name, token } = request.body;

  id = parseInt(token);
  if (!id) {
    response.status(501).send("Invalid token");
    return;
  }

  user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [id]);

  if (user_id.rows.length == 0) {
    response.status(501).send("User not found");
    return;
  }

  pool.query(
    "INSERT INTO dashboard (name, user_id, settings, accessMan, data) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      name,
      user_id.rows[0].id,
      "DefaultSettings",
      "DefaultAccessMan",
      "DefaultData",
    ],
    (error, results) => {
      if (error) {
        response.status(501).send(error.toString());
      }

      //set this user as admin of the dashboard;
      pool.query(
        "INSERT INTO accessRecords (dashboard_id, user_id, settingAccessLevel, dataAccessLevel, accessManAccessLevel) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [results.rows[0].id, user_id.rows[0].id, "write", "write", "write"],
        (error, res) => {
          if (error) {
            response.status(501).send(error.toString());
          }
          response.status(201).send({
            success: true,
            dashBoard: results.rows[0],
            accessMan: res.rows[0],
          });
        }
      );
    }
  );
};

//Read DashBoard settings.
const getDashBoardSettings = async (request, response) => {
  try {
    const { dashBoardID, token } = request.body;
    user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

    if (user_id.rows.length == 0) {
      response.status(501).send("User not found");
      return;
    }

    dID = parseInt(dashBoardID);

    if (!dID) {
      response.status(501).send("Invalid DashBoard ID");
      return;
    }

    //check if user has access to dashboard settings
    access = await pool.query(
      "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
      [dID, user_id.rows[0].id]
    );

    if (
      access.rows.length == 0 ||
      (access.rows[0].settingaccesslevel !== "write" &&
        access.rows[0].settingaccesslevel !== "read")
    ) {
      response.status(501).send("User does not have access to this dashboard");
      return;
    }

    pool.query(
      "SELECT settings FROM dashboard WHERE ID = $1",
      [dID],
      (error, results) => {
        if (error) {
          response.status(501).send(error.toString());
        }
        response
          .status(201)
          .send({ success: true, settings: results.rows[0].settings });
      }
    );
  } catch (error) {
    response.status(501).send(e.toString());
  }
};

//Read DashBoard AccessMan.
const getDashBoardAccessMan = async (request, response) => {
  try {
    const { dashBoardID, token } = request.body;
    user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

    if (user_id.rows.length == 0) {
      response.status(501).send("User not found");
      return;
    }

    dID = parseInt(dashBoardID);

    if (!dID) {
      response.status(501).send("Invalid DashBoard ID");
      return;
    }

    //check if user has access to dashboard accessMan
    access = await pool.query(
      "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
      [dID, user_id.rows[0].id]
    );

    if (
      access.rows.length == 0 ||
      (access.rows[0].accessmanaccesslevel != "write" &&
        access.rows[0].accessmanaccesslevel != "read")
    ) {
      response.status(501).send("User does not have access to this dashboard");
      return;
    }

    pool.query(
      "SELECT accessMan FROM dashboard WHERE ID = $1",
      [dID],
      (error, results) => {
        if (error) {
          response.status(501).send(error.toString());
        }
        response
          .status(201)
          .send({ success: true, accessMan: results.rows[0].accessman });
      }
    );
  } catch (e) {
    response.status(501).send(e.toString());
  }
};

//Read Dashboard data.
const getDashBoardData = async (request, response) => {
  try {
    const { dashBoardID, token } = request.body;
    user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

    if (user_id.rows.length == 0) {
      response.status(501).send("User not found");
      return;
    }

    dID = parseInt(dashBoardID);

    if (!dID) {
      response.status(501).send("Invalid DashBoard ID");
      return;
    }

    //check if user has access to dashboard data
    access = await pool.query(
      "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
      [dID, user_id.rows[0].id]
    );

    if (
      access.rows.length == 0 ||
      (access.rows[0].dataaccesslevel != "write" &&
        access.rows[0].dataaccesslevel != "read")
    ) {
      response.status(501).send("User does not have access to this dashboard");
      return;
    }

    pool.query(
      "SELECT data FROM dashboard WHERE ID = $1",
      [dID],
      (error, results) => {
        if (error) {
          response.status(501).send(error.toString());
        }
        response
          .status(201)
          .send({ success: true, data: results.rows[0].data });
      }
    );
  } catch (e) {
    response.status(501).send(e.toString());
  }
};

//Update DashBoard parts.
const updateDashBoardSettings = async (request, response) => {
  const { dashBoardID, token, newSettings } = request.body;

  user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

  if (user_id.rows.length == 0) {
    response.status(501).send("User not found");
    return;
  }

  dID = parseInt(dashBoardID);

  if (!dID) {
    response.status(501).send("Invalid DashBoard ID");
    return;
  }

  //check if user has access to dashboard settings
  access = await pool.query(
    "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
    [dID, user_id.rows[0].id]
  );

  if (
    access.rows.length == 0 ||
    access.rows[0].settingaccesslevel !== "write"
  ) {
    response.status(501).send("User does not have access to this dashboard");
    return;
  }
  pool.query(
    "UPDATE dashboard SET settings = $2 WHERE ID = $1 RETURNING settings",
    [dashBoardID, newSettings],
    (error, results) => {
      if (error) {
        response.status(501).send(error.toString());
      }

      response
        .status(201)
        .send({ success: true, newSettings: results.rows[0].settings });
    }
  );
};

const updateDashBoardAccessMan = async (request, response) => {
  const { dashBoardID, token, newAccessMan } = request.body;

  user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

  if (user_id.rows.length == 0) {
    response.status(501).send("User not found");
    return;
  }

  dID = parseInt(dashBoardID);

  if (!dID) {
    response.status(501).send("Invalid DashBoard ID");
    return;
  }

  //check if user has access to dashboard accessMan
  access = await pool.query(
    "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
    [dID, user_id.rows[0].id]
  );

  if (
    access.rows.length == 0 ||
    access.rows[0].accessmanaccesslevel !== "write"
  ) {
    response.status(501).send("User does not have access to this dashboard");
    return;
  }
  pool.query(
    "UPDATE dashboard SET accessMan = $2 WHERE ID = $1 RETURNING accessMan",
    [dashBoardID, newAccessMan],
    (error, results) => {
      if (error) {
        response.status(501).send(error.toString());
      }

      response
        .status(201)
        .send({ success: true, newAccessMan: results.rows[0].accessman });
    }
  );
};

const updateDashBoardData = async (request, response) => {
  const { dashBoardID, token, newData } = request.body;

  user_id = await pool.query("SELECT ID FROM users WHERE ID = $1", [token]);

  if (user_id.rows.length == 0) {
    response.status(501).send("User not found");
    return;
  }

  dID = parseInt(dashBoardID);

  if (!dID) {
    response.status(501).send("Invalid DashBoard ID");
    return;
  }

  //check if user has access to dashboard data
  access = await pool.query(
    "SELECT * FROM accessRecords WHERE dashboard_id = $1 AND user_id = $2",
    [dID, user_id.rows[0].id]
  );

  if (access.rows.length == 0 || access.rows[0].dataaccesslevel !== "write") {
    response.status(501).send("User does not have access to this dashboard");
    return;
  }
  pool.query(
    "UPDATE dashboard SET data = $2 WHERE ID = $1 RETURNING data",
    [dashBoardID, newData],
    (error, results) => {
      if (error) {
        response.status(501).send(error.toString());
      }

      response
        .status(201)
        .send({ success: true, newData: results.rows[0].data });
    }
  );
};

module.exports = {
  createDashBoard,
  getDashBoardSettings,
  getDashBoardAccessMan,
  getDashBoardData,
  updateDashBoardSettings,
  updateDashBoardAccessMan,
  updateDashBoardData,
};
