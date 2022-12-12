--users table with schema: for login we use token which for now is the id of the user itself.
CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  pass VARCHAR(100)
);

CREATE TABLE dashboard (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(100),
  user_id INTEGER REFERENCES users(ID)
--for simplicity, we will store the dashboard data,settings,accessMan as a string, and then access is defined as being able to read and/or write to the string.
  settings VARCHAR(100),
  accessMan VARCHAR(100),
  data VARCHAR(100)
);


-- access level of user to dashboard is stored.
CREATE TABLE accessRecords (
  ID SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(ID),
  dashboard_id INTEGER REFERENCES dashboard(ID),
  settingAccessLevel VARCHAR(10), -- read, write, none
  dataAccessLevel VARCHAR(10), -- read, write, none
  accessManAccessLevel VARCHAR(10) -- read, write, none
);


