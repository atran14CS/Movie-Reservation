"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * init of webpage
   */
  function init() {
    qs("button").addEventListener("click", feedbackRecieve);
    getAverage();
  }

  /**
   * sends a message back to the user that the review was received.
   */
  function feedbackRecieve() {
    let username = localStorage.getItem("username");
    if (username) {
      let selectedRating = qs('input[name="star-rating"]:checked');
      let reviewInput = id('customer-review');
      let rating = selectedRating ? selectedRating.value : null;
      let numericRating = rating ? parseInt(rating) : null;
      if (numericRating !== null) {
        fetchInputFeedBack(numericRating, reviewInput.value);
        selectedRating.checked = false;
        reviewInput.value = '';
      }
    } else {
      let receiveP = gen("p");
      receiveP.textContent = "You need to have an account in order to make a review!";
      id("text-review").appendChild(receiveP);
    }
  }

  /**
   * sends a request to the server to store the input from the user
   * @param {*} stars - the current star the user selected
   * @param {*} review - the in depth review
   */
  function fetchInputFeedBack(stars, review) {
    let formData = new FormData();
    formData.append("stars", stars);
    formData.append("review", review);
    fetch('/input/reviews', {method: "POST", body: formData})
      .then(statusCheck)
      .then(res => res.text())
      .then(receiveInput)
      .catch(console.error);
  }

  /**
   * displaying confrimation or sending an error from inputing review.
   * @param {String} confrimation - msg from the server side about the if the input was recived
   */
  function receiveInput(confrimation) {
    if (confrimation) {
      let receiveP = gen("p");
      receiveP.textContent = "Thank You For Your FeedBack!";
      id("text-review").appendChild(receiveP);
    } else {
      let receiveP = gen("p");
      receiveP.textContent = "Sorry Please try again!";
      id("text-review").appendChild(receiveP);
    }
  }

  /**
   * get the average rating stars from all users
   */
  function getAverage() {
    fetch('/reviews/average')
      .then(statusCheck)
      .then(res => res.json())
      .then(displayAvg)
      .catch(console.error);
  }

  /**
   * Displays the average rating on the webpage.
   * @param {Obejct} reviews - all the stars receive from user.
   */
  function displayAvg(reviews) {
    let sum = 0;
    for (let i = 0; i < reviews.length; i++) {
      sum += reviews[i].stars;
    }
    sum = sum / reviews.length;
    let averageStars = gen("p");
    averageStars.textContent = "Our Average Rating is a " + sum + " star";
    qs("body").appendChild(averageStars);
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
