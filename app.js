'use strict';

const express = require("express");
const app = express();
const multer = require("multer");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const fs = require("fs").promises;

/**
 * finds the top movie information.
 */
app.post('/top', async (req, res) => {
  let movieName = req.body.topMovie;
  try {
    res.type("json");
    let data = await fs.readFile("top-movie-info.json", "utf8");
    let parsedData = JSON.parse(data); // Parse the JSON string
    let clickedMovie = getSelected(parsedData, movieName);
    if (clickedMovie === "error") {
      res.status(400);
      res.type('text');
      res.send('Top movie not found');
    } else {
      res.send(clickedMovie);
    }
  } catch (error) {
    res.status(500);
    res.type('text');
    res.send('Error on the server side');
  }
});

/**
 * Helper function that finds the top selected movie information
 * @param {object} data - all top movie data
 * @param {string} movieName - selected movie name
 * @returns {object or string} the selected movie data or a error string signling top movie
 * could not be found.
 */
function getSelected(data, movieName) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].alt === movieName) {
      return data[i];
    }
  }
  return "error";
}

/**
 * Returns the 8 lastest movies order by id.
 */
app.get('/information/name', async (req, res) => {
  try {
    let query = "SELECT img, name FROM NewMovies ORDER BY id ASC LIMIT 8";
    let db = await getDBConnection();
    let result = await db.all(query);
    res.json(result);
    await db.close();
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send('an error has occured in our server please check back again later');
  }
});

/**
 * Checks to see if the username and password exist in the database.
 */
app.post('/movie/login', async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      res.status(400);
      res.type('text');
      res.send("Missing either password or username");
    } else {
      let db = await getDBConnection();
      let username = req.body.username;
      let password = req.body.password;
      let query = "SELECT username FROM Users WHERE username = ? and password = ?";
      let result = await db.get(query, [username, password]);
      if (result) {
        res.type('text').send("successful login");
      } else {
        res.status(400);
        res.type('text');
        res.send("Invalid username or password");
      }
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send('an error has occured in our server please check back again later');
  }
});

/**
 * displays the like movies for a user
 */
app.post('/likes', async (req, res) => {
  try {
    if (!req.body.username) {
      res.status(400);
      res.type('text');
      res.send("username");
    } else {
      let db = await getDBConnection();
      let username = req.body.username;
      let query = "SELECT likes, likeimg FROM Users WHERE username = ?";
      let result = await db.all(query, username);
      res.send(result);
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * Sends back the reserve movie img for the user to display.
 */
app.post('/reserved', async (req, res) => {
  try {
    if (!req.body.username) {
      res.status(400);
      res.type('text');
      res.send("username");
    } else {
      let db = await getDBConnection();
      let username = req.body.username;
      let query = "SELECT DISTINCT reserved, resimg FROM Users WHERE username = ?";
      let result = await db.all(query, username);
      res.send(result);
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * gets the information on the search movie.
 */
app.post('/movie/information', async (req, res) => {
  try {
    if (!req.body.movieName) {
      res.status(400);
      res.type('text');
      res.send("Movie Infromation Cannot be Found");
    } else {
      let db = await getDBConnection();
      let movieName = req.body.movieName;
      let query = "SELECT rating, budget, boxoffice, resid FROM Information WHERE name = ?";
      let result = await db.all(query, movieName);
      res.send(result);
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * finds the information on the search movie.
 */
app.post('/search/movie/name', async (req, res) => {
  try {
    if (!req.body.searchMovie) {
      res.status(400);
      res.type('text');
      res.send("Movie was not found in our database");
    } else {
      let db = await getDBConnection();
      let searchMovie = req.body.searchMovie;
      let query = "SELECT name, rating, budget, boxoffice, resid FROM Information WHERE name = ?";
      let result = await db.all(query, searchMovie);
      res.send(result);
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * checks if the resid exist in the movie database.
 */
app.post('/search/movie/reservation', async (req, res) => {
  try {
    if (!req.body.resid) {
      res.status(400);
      res.type('text');
      res.send("Movie was not found in our database");
    } else {
      let db = await getDBConnection();
      let resid = req.body.resid;
      let query = "SELECT r.DateReserved FROM Information as i, Reserved as r WHERE i.resid = r.id and i.resid = ?";
      let result = await db.all(query, resid);
      if (result.length === 0) {
        res.send("Available");
      } else {
        res.send(result);
      }
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * checks the database to see if any reserve movie contains the
 * provided resid from the user
 */
app.post('/check/unique/resid', async (req, res) => {
  try {
    if (!req.body.resid) {
      res.status(400);
      res.type('text');
      res.send("no resid provided");
    } else {
      let db = await getDBConnection();
      let resid = req.body.resid;
      let query = "SELECT id FROM Reserved WHERE id = ?";
      let result = await db.all(query, resid);
      if (result.length === 0) {
        res.send(resid);
      } else {
        res.send("failed");
      }
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * creates a new user in the user database
 */
app.post('/create/new/user', async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      res.status(400);
      res.type('text');
      res.send("no password or username provided");
    } else {
      let db = await getDBConnection();
      let username = req.body.username;
      let password = req.body.password;
      let query = "SELECT username password FROM Users WHERE username = ? and password = ?";
      let result = await db.all(query, username, password);
      if (result.length === 0) {
        res.send("Account Created!");
        let addQuery = "INSERT INTO Users (username, password) VALUES (?, ?)";
        await db.run(addQuery, username, password);
      } else {
        res.send("username/password has already been taken!");
      }
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * Updates the Reserved and Information table for the reserved movie.
 */
app.post('/update/reserve/table', async (req, res) => {
  try {
    if (!req.body.id) {
      res.status(400);
      res.type('text');
      res.send("no resid provided");
    } else {
      let db = await getDBConnection();
      let id = req.body.id;
      let movieName = req.body.movieName;
      let query = "INSERT INTO RESERVED (id, MovieName) VALUES(?,  ?)";
      await db.all(query, id, movieName);
      let query2 = "UPDATE Information SET resid = ? WHERE name = ?";
      await db.all(query2, id, movieName);
      res.send("succesful reservation made");
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * updates the users database with the newly reserved movie.
 */
app.post('/update/users/table', async (req, res) => {
  try {
    if (!req.body.username || !req.body.password || !req.body.movieName || !req.body.resimg) {
      res.status(400);
      res.type('text');
      res.send("invalid params provided");
    } else {
      let db = await getDBConnection();
      let username = req.body.username;
      let password = req.body.password;
      let movieName = req.body.movieName;
      let resimg = req.body.resimg;
      let query = "INSERT INTO USERS (username, password, reserved, resimg) VALUES(?, ?, ?, ?)";
      await db.run(query, username, password, movieName, resimg);
      res.send("updated table");
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * Stores the user client review side into the reviews database.
 */
app.post('/input/reviews', async (req, res) => {
  try {
    if (!req.body.stars || !req.body.review) {
      res.status(400);
      res.type('text');
      res.send("invalid params provided");
    } else {
      let db = await getDBConnection();
      let stars = parseInt(req.body.stars);
      let review = req.body.review;
      let query = "INSERT INTO reviews (stars, review) VALUES(?, ?)";
      await db.run(query, stars, review);
      res.send("updated review table");
      await db.close();
    }
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send("an error has occured in our server please try again later");
  }
});

/**
 * gets the total number of stars and sends it back to the client side.
 */
app.get('/reviews/average', async (req, res) => {
  try {
    let query = "SELECT stars FROM reviews";
    let db = await getDBConnection();
    let result = await db.all(query);
    await db.close();
    res.json(result);
  } catch (err) {
    res.status(500);
    res.type('text');
    res.send('an error has occured in our server please check back again later');
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "hotel.db",
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);
