# PSI

Projeto de Sistemas de Informação
(Software Engineering Project)

Faculty of Sciences of the University of Lisbon

Teacher: Carlos Duarte

Final Grade: 20/20


---

![Google Cloud Run](https://github.com/tiagomiguel29/PSI/actions/workflows/google-cloudrun-docker.yml/badge.svg)
![Prettier Format](https://github.com/tiagomiguel29/PSI/actions/workflows/prettier.yml/badge.svg)

---

## :warning: Use Pre-commit Hooks

Before any commit, make sure to run the pre-commit hooks.

## Installing Pre-commit

To install `pre-commit` on your machine, follow these steps:

1. **Install `pre-commit`:**
   Open your terminal and run the following command:

   ```
   pip install pre-commit
   ```

2. **Install the Git hook scripts:**
   Run the following command in your project directory:
   ```
   pre-commit install
   ```

This will set up `pre-commit` to run automatically before each commit.

### Manually Running Hooks

You can manually run all configured hooks against all files in the project with the following command:

```
pre-commit run --all-files
```

# Project Structure

The project is composed of a Node.js Express API and an Angular frontend. The project structure is as follows:

```bash
psi/
├── client/ # Angular frontend
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
├── config/ # Configuration files
├── controllers/ # Express controllers
├── models/ # Mongoose models
├── routes/ # Express routes
├── services/ # Services like database
├── utils/ # Utility functions
├── app.js # Node.js entry point
├── .gitignore
├── package.json
├── README.md
└── ...
```

The `client` directory contains the Angular frontend, while the Express API is in the root directory.

# Running the Project

To run the project, follow these steps:

1. **Install the dependencies:**
   Navigate to the root directory and run:

   ```
   npm install
   ```

2. **Start the server:**
   Run the following command:

   ```
   npm start
   ```

   The server will start on `http://localhost:PORT`, where `PORT` is the port defined in the `.env` file.

3. **Start the Angular frontend:**
   Navigate to the `client` directory and run:
   ```
   npm start
   ```
   The Angular frontend will start on `http://localhost:PORT`, where `PORT` is the port defined in the `.env` file. By default, the Angular frontend runs on port 4200.

## Environment Variables

The project uses environment variables for configuration of the backend and frontend. The environment can be set in the `.env` file in the root directory for the backend and in the `client/.env` file for the frontend.
The necessary environment variables are:

```env
# .env
PORT=
MONGODB_URI=
```

```env
# client/.env
API_URL=
PORT=
```
