"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * init of webpage
   */
  function init() {
    checkLogin();
    if (window.localStorage.getItem("username") !== null) {
      let logUsername = id("username");
      logUsername.value = window.localStorage.getItem("username");
      let resPic = localStorage.getItem("resPic");
      let resTitle = localStorage.getItem("resTitle");
      prepareReserve(resPic, resTitle);
    }
    id("new-acc").addEventListener("click", createNewUser);
  }

  /**
   * Turns input params into arrays.
   * @param {String} resPic - string array of movie imgaes.
   * @param {String} resTitle - string array of movie title.
   */
  function prepareReserve(resPic, resTitle) {
    let picArr = JSON.parse(resPic);
    let titleArr = JSON.parse(resTitle);
    displayLogedReserve(picArr, titleArr);
  }

  /**
   * Displays the login user reserve movies
   * @param {Object} resPic - object containing the pic of the reserve movie.
   * @param {Object} resTitle - object containing the title of the reserve movie.
   */
  function displayLogedReserve(resPic, resTitle) {
    id("reserved-movies").innterHTML = "";
    hideLogin();
    let reservedSection = gen("section");
    for (let i = 0; i < resPic.length; i++) {
      let movieSection = gen("section");
      let title = titleHelper(resTitle[i]);
      let img = imgHelper(resPic[i]);
      movieSection.append(title);
      movieSection.append(img);
      reservedSection.append(movieSection);
      id("reserved-movies").appendChild(movieSection);
    }
  }

  /**
   * displays the form to create another account
   */
  function createNewUser() {
    id("new-account-form").classList.remove("hidden");
    id("login").classList.add("hidden");
    let button = id("new-account-form");
    let username = id("new-username");
    let password = id("new-password");
    button.addEventListener("submit", function(event) {
      event.preventDefault();
      fetchMakeNewUser(username.value, password.value);
    });
  }

  /**
   * makes a request to the server to create a new user with the provided new user information.
   * @param {String} username - username of the new user.
   * @param {String} password - password of the new user.
   */
  function fetchMakeNewUser(username, password) {
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    fetch('/create/new/user', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.text())
      .then(displayNewAcc)
      .catch(console.error);
  }

  /**
   * displays the success message upon succesful user creation.
   * @param {String} msg - message from the server displaying succesful creation.
   */
  function displayNewAcc(msg) {
    let feedback = gen("p");
    feedback.textContent = msg;
    qs("body").appendChild(feedback);
  }

  /**
   * checks if the provided login is correct
   */
  function checkLogin() {
    let userName = id("username");
    let userPassword = id("password");
    let loginBtn = id("account-form");
    loginBtn.addEventListener("submit", function(event) {
      event.preventDefault();
      fetchLogin(userName.value, userPassword.value);
    });
  }

  /**
   * sends a request to the server to check the login information
   * @param {String} username - log in username
   * @param {String} password - log in password
   */
  function fetchLogin(username, password) {
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    let formData = new FormData;
    formData.append('username', username);
    formData.append('password', password);
    fetch('/movie/login', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.text())
      .then(function() {
        // loadLikes(username);
        loadReserved(username);
      })
      .catch(console.error);
  }

  // /**
  //  * Sends a request to the server to get the likes for a user.
  //  * @param {String} username - the username of the current user.
  //  */
  // function loadLikes(username) {
  //   let formData = new FormData;
  //   formData.append('username', username);
  //   fetch('/likes', {method: "POST", body: formData})
  //     .then(statusCheck)
  //     .then(res => res.json())
  //     .then(displayLikes)
  //     .catch(console.error);
  // }

  /**
   * helper function to hide the login page.
   */
  function hideLogin() {
    id("login").classList.add("hidden");
    id("liked-movies").classList.remove("hidden");
    id("reserved-movies").classList.remove("hidden");
  }

  // /**
  //  * display the like movies
  //  * @param {Object} likeMovies - the array object containing the like user movies.
  //  */
  // function displayLikes(likeMovies) {
  //   id("liked-movies").innterHTML = "";
  //   hideLogin();
  //   let movieName = [];
  //   let moviePic = [];
  //   let likeSection = gen("section");
  //   for (let i = 0; i < likeMovies.length; i++) {
  //     let movieSection = gen("section");
  //     let title = titleHelper(likeMovies[i].likes);
  //     let img = imgHelper(likeMovies[i].likeimg);
  //     movieSection.append(title);
  //     movieSection.append(img);
  //     likeSection.append(movieSection);
  //     movieName.push(likeMovies[i].likes);
  //     moviePic.push(likeMovies[i].likeimg);
  //   }
  //   localStorage.setItem("title", JSON.stringify(movieName));
  //   localStorage.setItem("img", JSON.stringify(moviePic));
  //   id("liked-movies").append(likeSection);
  // }

  /**
   * Helper function to generate the title
   * @param {String} movieName - the current movie title
   * @returns {Object} p tag of the movietitle.
   */
  function titleHelper(movieName) {
    let movieTitle = gen("p");
    movieTitle.textContent = movieName;
    return movieTitle;
  }

  /**
   * Helper function to generate the movie img
   * @param {String} movieImg - the current movie
   * @returns {Object} the current movie img src.
   */
  function imgHelper(movieImg) {
    let moviePic = gen("img");
    moviePic.src = movieImg;
    return moviePic;
  }

  /**
   * sends a request back to get the user reserve movies.
   * @param {String} username - the user username
   */
  function loadReserved(username) {
    id("liked-movies").innterHTML = "";
    let formData = new FormData;
    formData.append('username', username);
    fetch('/reserved', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.json())
      .then(displayReserved)
      .catch(console.error);
  }

  /**
   * displays the user reserve movies and also stores it in local storage incase the user leaves
   * and returns the reserve movies will still appear.
   * @param {Object} reservedMovies - Object containing the users reserve imgs
   */
  function displayReserved(reservedMovies) {
    id("reserved-movies").innterHTML = "";
    hideLogin();
    let resTitle = [];
    let resPic = [];
    let reservedSection = gen("section");
    for (let i = 0; i < reservedMovies.length; i++) {
      let movieSection = gen("section");
      let title = titleHelper(reservedMovies[i].reserved);
      let img = imgHelper(reservedMovies[i].resimg);
      movieSection.append(title);
      movieSection.append(img);
      reservedSection.append(movieSection);
      resTitle.push(reservedMovies[i].reserved);
      resPic.push(reservedMovies[i].resimg);
    }
    localStorage.setItem("resTitle", JSON.stringify(resTitle));
    localStorage.setItem("resPic", JSON.stringify(resPic));
    id("reserved-movies").append(reservedSection);
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Note: You may use these in your code, but remember that your code should not have
   * unused functions. Remove this comment in your own code.
   */

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();
