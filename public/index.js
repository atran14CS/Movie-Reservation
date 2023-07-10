"use strict";
(function() {

  window.addEventListener("load", init);
  let currentTitle = "";
  let logedIn = false;

  /**
   * init of webpage
   */
  function init() {
    if (window.localStorage.getItem("username") !== null &&
    window.localStorage.getItem("password") !== null) {
      logedIn = true;
      id("log-out").addEventListener("click", logOut);
      id("log-out").classList.remove("hidden");
      id("log-in").textContent = "Reserved";
    }
    qs("h1").addEventListener("click", changeHome);
    id("change-view").addEventListener("click", changeView);
    loadNew();
    filterSearch();
    let topMoviesGrid = qsa(".grid-item");
    let topMoviesList = qsa(".list-item");
    for (let i = 0; i < topMoviesGrid.length; i++) {
      topMoviesGrid[i].addEventListener("click", fetchTopInfo);
      topMoviesList[i].addEventListener("click", fetchTopInfo);
    }
  }

  /**
   * fetches the top movie information for the clicked movie
   * @param {String} topName - the movie alt clicked on in the top movie section.
   */
  function fetchTopInfo(topName) {
    let clickedMovie = topName.currentTarget.alt;
    let formData = new FormData();
    formData.append("topMovie", clickedMovie);
    fetch('/top', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.json())
      .then(displayTopMovies)
      .catch(console.error());
  }

  /**
   * display the infromation from the top selected movie.
   * @param {Object} movieInformaion - contains the infromation about the top selected movie.
   */
  function displayTopMovies(movieInformaion) {
    id("top-info").innerHTML = "";
    clearPageHelper();
    let movieImg = gen("img");
    movieImg.classList.add("grid-item");
    movieImg.classList.add("list-item");
    movieImg.src = "img/" + movieInformaion.alt + ".jpg";
    let movieInfo = gen("section");
    let movie = helperGenP(movieInformaion.movie);
    let rating = helperGenP(movieInformaion.rating);
    let synopsis = helperGenP(movieInformaion.synopsis);
    let actors = helperGenP(movieInformaion.actors);
    let director = helperGenP(movieInformaion.director);
    let budget = helperGenP(movieInformaion.budget);
    let boxoffice = helperGenP(movieInformaion.boxoffice);
    movieInfo.appendChild(movie);
    movieInfo.appendChild(rating);
    movieInfo.appendChild(synopsis);
    movieInfo.appendChild(actors);
    movieInfo.appendChild(director);
    movieInfo.appendChild(budget);
    movieInfo.appendChild(boxoffice);
    id("top-info").classList.remove("hidden");
    id("top-info").appendChild(movieImg);
    id("top-info").appendChild(movieInfo);
  }

  /**
   * creates a ptag with the content being the movie information.
   * @param {String} content - information about the movie
   * @returns {Object} - ptag with the textcontent being the content
   */
  function helperGenP(content) {
    let ptag = gen("p");
    ptag.textContent = content;
    return ptag;
  }

  /**
   * Logs out the current user.
   */
  function logOut() {
    id("log-out").classList.add("hidden");
    localStorage.clear();
  }

  /**
   * Fetch the latest movies.
   */
  function loadNew() {
    fetch('/information/name')
      .then(statusCheck)
      .then(res => res.json())
      .then(displayNew)
      .catch(console.error);
  }

  /**
   * Displays the latest movies
   * @param {Object} newData - contains lastest new movies
   */
  function displayNew(newData) {
    let sectionGrid = gen("section");
    sectionGrid.classList.add("img-grid");
    for (let i = 0; i < newData.length; i++) {
      let movieImg = gen("img");
      movieImg.classList.add("grid-item");
      movieImg.src = "new/" + newData[i].img;
      movieImg.alt = newData[i].name;
      movieImg.addEventListener("click", clearPage);
      sectionGrid.appendChild(movieImg);
      id("new").appendChild(sectionGrid);
    }
  }

  /**
   * clears the page to prep for showing the clicked movie.
   * @param {String} movieName - the movie title clicked on.
   */
  function clearPage(movieName) {
    id("clicked-movie").innerHTML = "";
    if (id("clicked-movie").classList.contains("hidden")) {
      id("clicked-movie").classList.remove("hidden");
    }
    currentTitle = movieName.currentTarget.alt;
    getMovieInfo(currentTitle);
  }

  /**
   * Sends a request to the server side to get information on the selected movie
   * @param {String} movieName - the current movie title.
   */
  function getMovieInfo(movieName) {
    let formData = new FormData();
    formData.append("movieName", movieName);
    clearPageHelper();
    fetch('/movie/information', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.json())
      .then(showMovieInfo)
      .then(function(res) {
        getReservationStatus(res, currentTitle);
      })
      .catch(console.error);
  }

  /**
   * helper functon to clear the main page.
   */
  function clearPageHelper() {
    let gridView = id("grid-view");
    let listView = id("list-view");
    let newMovies = id("new");
    let changeBtn = id("change-view");
    let login = id("login-page");
    let topInfo = id("top-info");
    gridView.classList.add("hidden");
    listView.classList.add("hidden");
    newMovies.classList.add("hidden");
    changeBtn.classList.add("hidden");
    login.classList.add("hidden");
    topInfo.classList.add("hidden");
  }

  /**
   * Sends a request to the server side to figure out if the the movie is
   * reserved.
   * @param {Object} movieInfo - information about the current movie
   * @param {String} movieName - name of the current movie
   */
  function getReservationStatus(movieInfo, movieName) {
    let resid = movieInfo[0].resid;
    let formData = new FormData();
    formData.append("resid", resid);
    fetch('/search/movie/reservation', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.text())
      .then(function(res) {
        displayReservationOption(res, movieName);
      })
      .catch(console.error);
  }

  /**
   * Displays if the movie is reserved or not and checks if the user is able to reserve the movie.
   * @param {String} reservations - message from the server side telling if the movie is avialble
   * to be reserved
   * @param {String} movieName - the current movie title
   */
  function displayReservationOption(reservations, movieName) {
    if (reservations === "Available") {
      let form = residGenFrom();
      qs(".info-section").appendChild(form);
      id("make-resid").classList.remove("hidden");
      let resButton = id("make-resid");
      if (logedIn === true) {
        resButton.addEventListener("submit", function(event) {
          event.preventDefault();
          let resid = id("resid");
          createUniqueResId(resid.value, movieName);
        });
      } else {
        let errorMsg = gen("p");
        errorMsg.textContent = "not loged in";
        id("make-resid").appendChild(errorMsg);
      }
    } else {
      let reservationDate = gen("p");
      reservationDate.textContent = reservations;
      qs(".info-section").appendChild(reservationDate);
    }
  }

  /**
   * Helper function to generate a forms for the user to reserve the movie.
   * @returns{Object} form  to reserve the movie
   */
  function residGenFrom() {
    let resButton = gen("button");
    resButton.classList.add("res-button");
    resButton.textContent = "reserve";
    let form = gen("form");
    form.id = "make-resid";
    form.classList.add("hidden");
    let label = gen("label");
    label.htmlFor = "resid";
    label.textContent = "Make a Reservation ID";
    let input = gen("input");
    input.type = "text";
    input.id = "resid";
    input.name = "resid";
    input.placeholder = "resid";
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(resButton);
    return form;
  }

  /**
   * preps the fetch request to see if the resid is unique.
   * @param {String} resid - the resid the user provided
   * @param {String} movieName - the current movie name;
   */
  function createUniqueResId(resid, movieName) {
    if (resid === "") {
      let errorMsg = gen("p");
      errorMsg.textContent = "no resid provided";
      id("make-resid").appendChild(errorMsg);
    } else {
      checkUniqueResId(resid, movieName);
    }
  }

  /**
   * sends a request to the server to see if the resid is unique
   * @param {String} resid - the resid the user provided
   * @param {String} movieName - the current movie name
   */
  function checkUniqueResId(resid, movieName) {
    let formData = new FormData();
    formData.append("resid", resid);
    fetch('/check/unique/resid', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.text())
      .then(function(res) {
        updateReserveMovie(res, resid, movieName);
      })
      .catch(console.error);
  }

  /**
   * sends a request back to update the reserve table or display that the movie is reserved.
   * @param {String} msg - message from the server side to say if the resid was unique
   * @param {String} resid - the resid provided from the user
   * @param {String} movieName - the current movie name
   */
  function updateReserveMovie(msg, resid, movieName) {
    if (msg !== "failed") {
      updateReserveTable(resid, movieName);
    } else {
      let errorMsg = gen("p");
      errorMsg.textContent("movie is already reserved");
      id("clicked-movie").appendChild(errorMsg);
    }
  }

  /**
   * sends a request to the server to update the reserve database table.
   * @param {String} id - the resid
   * @param {String} movieName - the current movie title
   */
  function updateReserveTable(id, movieName) {
    let formData = new FormData();
    formData.append("movieName", movieName);
    formData.append("id", id);
    fetch('/update/reserve/table', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.text())
      .then(function(res) {
        showSuccess(res, movieName);
      })
      .catch(console.error);
  }

  /**
   * displays a successful msg to ther client side reservation.
   * @param {String} msg - message from the server side indicating success
   * @param {String} movieName - the current movie name
   */
  function showSuccess(msg, movieName) {
    let success = gen("p");
    success.textContent = msg;
    id("make-resid").appendChild(success);
    updateUsersReserves(movieName);
  }

  /**
   * sends request to the server side to update the user database.
   * @param {String} movieName - the current movie title
   */
  function updateUsersReserves(movieName) {
    let formData = new FormData();
    let username = localStorage.getItem("username");
    let password = localStorage.getItem("password");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("movieName", movieName);
    let imgSrc = movieName.replaceAll(" ", "-");
    imgSrc += ".jpg";
    imgSrc = "../new/" + imgSrc.toLowerCase();
    formData.append("resimg", imgSrc);
    fetch('/update/users/table', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.text())
      .catch(console.error);
  }

  /**
   * generate the information about the selected movie.
   * @param {Object} movieInfo - the infromation about the selected movie
   * @returns {Object} information about the movie
   */
  function showMovieInfo(movieInfo) {
    let imgSrc = currentTitle.replaceAll(" ", "-");
    imgSrc += ".jpg";
    imgSrc = "new/" + imgSrc.toLowerCase();
    let movieImg = gen("img");
    movieImg.classList.add("clicked-img");
    movieImg.src = imgSrc;
    let rating = movieInfo[0].rating;
    let budget = movieInfo[0].budget;
    let boxoffice = movieInfo[0].boxoffice;
    let infoSection = makeInfoParagraph(rating, budget, boxoffice);
    id("clicked-movie").appendChild(movieImg);
    id("clicked-movie").appendChild(infoSection);
    return movieInfo;
  }

  /**
   * helper function to generate clicked movie section
   * @param {Number} rating - the rating for the movie
   * @param {String} budget - the budget for the movie
   * @param {String} boxoffice - the boxoffice for the movie.
   * @returns {object} returns a section containing these movie infromation.
   */
  function makeInfoParagraph(rating, budget, boxoffice) {
    let infoSection = gen("section");
    infoSection.classList.add("info-section");
    let ratingP = gen("p");
    ratingP.textContent = "The rating for this movie was: " + rating;
    let budgetP = gen("p");
    budgetP.textContent = "The budget for this movie was: " + budget;
    let boxofficeP = gen("p");
    boxofficeP.textContent = "The box office for this movie was: " + boxoffice;
    infoSection.appendChild(ratingP);
    infoSection.appendChild(budgetP);
    infoSection.appendChild(boxofficeP);
    return infoSection;
  }

  /**
   * This method add the list-view class for the items on the page
   */
  function changeView() {
    let listView = id("list-view");
    let gridView = id("grid-view");
    if (listView.classList.contains("hidden")) {
      listView.classList.remove("hidden");
      gridView.classList.add("hidden");
    } else {
      listView.classList.add("hidden");
      gridView.classList.remove("hidden");
    }
  }

  /**
   * changes view back to home menu
   */
  function changeHome() {
    id("change-view").classList.remove("hidden");
    id("grid-view").classList.remove("hidden");
    id("new").classList.remove("hidden");
    id("clicked-movie").classList.add("hidden");
    id("login-page").classList.add("hidden");
    id("top-info").classList.add("hidden");
  }

  /**
   * finds out what is searched on the search bar
   */
  function filterSearch() {
    let form = qs(".search-bar");
    let searchValue = id("search");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      fetchResults(searchValue.value);
    });
  }

  /**
   * sends a request to the server side to fetch the search movie information.
   * @param {*} searchMovie - the search movie in the search bar
   */
  function fetchResults(searchMovie) {
    let formData = new FormData;
    formData.append("searchMovie", searchMovie);
    fetch('/search/movie/name', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.json())
      .then(showSearch)
      .catch(console.error);
  }

  /**
   * Displays the search movie info ont the main page.
   * @param {*} searchMovie - the search movie in the search bar
   */
  function showSearch(searchMovie) {
    if (id("clicked-movie").classList.contains("hidden")) {
      id("clicked-movie").classList.remove("hidden");
    }
    id("clicked-movie").innerHTML = "";
    clearPageHelper();
    currentTitle = searchMovie[0].name;
    getMovieInfo(searchMovie[0].name);
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

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();
