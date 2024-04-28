const express = require("express");
require('dotenv').config();
const mysql = require("mysql2");
const cors = require("cors");

const bcrypt = require("bcrypt"); // https://www.npmjs.com/package/bcrypt npm i bcrypt
var jwt = require("jsonwebtoken"); //https://github.com/auth0/node-jsonwebtoken npm install jsonwebtoken

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());




const con = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
});


// Connect to MySQL database
con.connect(function (err) {
  if (err) {
    console.log("Error in Connection");
    throw err; // Exit the application if connection fails
  } else {
    console.log("Connected to MySQL");

    // Database and table creation queries
    con.query("CREATE DATABASE IF NOT EXISTS employeeDB", (err) => {
      if (err) throw err;
      console.log("Database 'employeeDB' created or already exists");

      // Switch to the employeeDB database
      con.changeUser({ database: process.env.DB_DATABASE }, (err) => {
        if (err) throw err;

        // Create 'employee' table if it doesn't exist
        con.query(`CREATE TABLE IF NOT EXISTS employee (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          address VARCHAR(255),
          salary DECIMAL(10, 2) NOT NULL
        )`, (err) => {
          if (err) throw err;
          console.log("Table 'employee' created or already exists");

          // Create 'users' table if it doesn't exist
          con.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
          )`, (err) => {
            if (err) throw err;
            console.log("Table 'users' created or already exists");

            // Start the Express server after database setup
            app.listen(port, () => {
              console.log(`Server is running on port ${port}`);
            });
          });
        });
      });
    });
  }
});



app.get("/getEmployee", (req, res) => {
  const sql = "SELECT * FROM employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get employee error in sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/get/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee where id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Error: "Get employee error in sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.put("/update/:id", (req, res) => {
  const userId = req.params.id;
  const q =
    "UPDATE employee SET `name`= ?, `email`= ?, `salary`= ?, `address`= ? WHERE id = ?";

  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
  ];

  con.query(q, [...values, userId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
    //return res.json({Status: "Success"})
  });
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "Delete FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Error: "delete employee error in sql" });
    return res.json({ Status: "Success" });
  });
});

app.get("/adminCount", (req, res) => {
  const sql = "Select count(id) as admin from users";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Error in runnig query" });
    return res.json(result);
  });
});

app.get("/employeeCount", (req, res) => {
  const sql = "Select count(id) as employee from employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Error in runnig query" });
    return res.json(result);
  });
});

app.get("/salary", (req, res) => {
  const sql = "Select sum(salary) as sumOfSalary from employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Error in runnig query" });
    return res.json(result);
  });
});

app.post("/create", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const address = req.body.address;
  const salary = req.body.salary;

  con.query(
    "INSERT INTO employee (name, email, address, salary) VALUES (?, ?, ?, ?)",
    [name, email, address, salary],
    (err, result) => {
      if (result) {
        res.send(result);
      } else {
        res.send({ message: "ENTER CORRECT DETAILS!" });
      }
    }
  );
});

app.get("/hash", (req, res) => {
  bcrypt.hash("123456", 10, (err, hash) => {
    if (err) return res.json({ Error: "Error in hashing password" });
    const values = [hash];
    return res.json({ result: hash });
  });
});

app.post("/login", (req, res) => {
  const sql = "SELECT * FROM users Where email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Error in runnig query" });
    if (result.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        result[0].password,
        (err, response) => {
          if (err) return res.json({ Error: "password error" });
          if (response) {
            const token = jwt.sign({ role: "admin" }, "jwt-secret-key", {
              expiresIn: "1d",
            });
            return res.json({ Status: "Success", Token: token });
          } else {
            return res.json({
              Status: "Error",
              Error: "Wrong Email or Password",
            });
          }
        }
      );
    } else {
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }
  });
});

app.post("/register", (req, res) => {
  const sql = "INSERT INTO users (`name`,`email`,`password`) VALUES (?)";
  bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
    if (err) return res.json({ Error: "Error in hashing password" });
    const values = [req.body.name, req.body.email, hash];
    con.query(sql, [values], (err, result) => {
      if (err) return res.json({ Error: "Error query" });
      return res.json({ Status: "Success" });
    });
  });
});

