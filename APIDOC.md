# Reserved Movies API Documentation
The Movies API provides information about the the available movies for reservation along with different features of the movie including rating, budget, box office and wheather the movie is able for reservation

## Get a list of new movies title and the img
**Request Format:** /information/name

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns a JSON object of the img, and name of new movies

**Example Request:** /information/name

**Example Response:**
```
[
  {
    "img": "the-little-mermaid.jpg",
    "name": "The Little Mermaid"
  },
  {
    "img": "fastx.jpg",
    "name": "FastX"
  },
  {
    "img": "guardian-of-the-galaxy-vol.3.jpg",
    "name": "Guardian of The Galaxy Vol.3"
  },
  {
    "img": "super-mario-bros.jpg",
    "name": "Super Mario Bros"
  },
  {
    "img": "about-my-father.jpg",
    "name": "About My Father"
  },
  {
    "img": "the-machine.jpg",
    "name": "The Machine"
  },
  {
    "img": "kandhar.jpg",
    "name": "Kandhar"
  },
  {
    "img": "book-club-the-next-chapter.jpg",
    "name": "Book Club: The Next Chapter"
  }
]
...
```

- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
  `an error has occured in our server please check back again later`

## Checks if user login is valid
**Request Format:** /movie/login

**Request Type:** Post

**Body Parameters:** `username`, `password`

**Returned Data Format**: Text

**Description:** Given a valid username and password runs a query to check if the username and password exist inside the users database.

**Example Request:**: /login-related/login.html

**Example Response:**
```
successful login

```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If did not provide a username/password give message: `Missing either password or username`
  - If the username or password does not exisit in the database give a message: `Invalid username or password`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `an error has occured in our server please check back again later`

## Login
**Request Format:** /movie/login

**Body Parameters:** `username` and `password`

**Request Type**: POST

**Returned Data Format**: text

**Description:** Given a valid `username` and `password` to send, a granted access message will appear if the username and password exist inside the login database. If the login does not exisit an invalid text error will be sent. No specfic requirement of username and passowrd at this momment.

**Example Request:** /hotel/login with POST parameters of `username=madeupUser` and `password=Strongpassword!1`

**Example Response:**
```
[
  'successful login'
]

```

```
[
  'invalid username or password'
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If username does not exist or password: `Invalid username or password`
  - If nothing is typed: `please enter a username and password`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
  `We're Sorry we are dealing with technical diffculties please try again Later`

## Hotel Images

**Request Format:** /movie/latest

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns a list of new movie images to display on webpage main menu.

**Example Request:** /images

**Example Response:**
```
[hotel1.jpeg, hotel2.jpeg, hotel3.jpeg, hotel4.jpeg, hotel5.jpeg]

```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message:
  `server error image cannot be loaded`