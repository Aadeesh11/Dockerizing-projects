const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const createUserTableText = `
CREATE TABLE IF NOT EXISTS users (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  pass VARCHAR(100)
);
`;
pool.query(createUserTableText);

var bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);

//signup
const createUser = (request, response) => {
  const { name, email, password } = request.body;

  if (password.length > 100) {
    response.status(501).send("Password too long");
    return;
  }

  pass = bcrypt.hashSync(password, salt);

  pool.query(
    "INSERT INTO users (name, email, pass) VALUES ($1, $2, $3) RETURNING *",
    [name, email, pass],
    (error, results) => {
      if (error) {
        response.status(501).send(error.toString());
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`);
    }
  );
};

//login
const loginUser = (request, response) => {
  const { email, password } = request.body;

  pass = bcrypt.hashSync(password, salt);
  pool.query(
    "SELECT * FROM users WHERE email = $1 AND pass = $2",
    [email, pass],
    (error, results) => {
      if (error) {
        response.status(501).send(error.toString());
      }
      if (results.rows.length == 0) {
        response.status(501).send("User not found");
      } else {
        response.status(201).send({
          "user logged in": true,
          token: results.rows[0].id.toString(),
        });
      }
    }
  );
};

module.exports = {
  loginUser,
  createUser,
};
