# Plant Parenthood Planner – Frontend

This is the **frontend** of the Plant Parenthood Planner, a full-stack application built with **React**.  
The app helps plant lovers track their plants, species details, and care events.

---

## Features
- Dashboard to view all plants
- Add, edit, and delete plants
- Track plant care events (watering, fertilizing, etc)
- Integrated with Flask backend API

---

## Tech Stack
- [React]
- [React Router]
- [Formik] – form handling & validation
- [Yup] – schema validation
- Fetch API – connect to Flask backend
- Tailwind for styling

---

## Project Structure
client/
├── public/
│ ├── assets/ # static images (e.g., delete.png, icons)
│ └── index.html
├── src/
│ ├── components/ # Reusable UI components (PlantCard, Navbar, etc.)
│ ├── pages/ # Page components (DashboardPage, AddPlantPage, NotFoundPage)
│ ├── App.js # Main React app
│ ├── index.js # Entry point
└── package.json


---

## Setup & Installation

1. Navigate to the `client` folder:
   ```bash
   cd client

##  Install Idependencies:

    npm install

##  Start the development server:

    npm start 

---


## License

MIT License

Copyright &copy; 2025 Tiffany Mwikali 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---
