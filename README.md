# Getting Started with Create React App and Git

This project is built using [Create React App](https://github.com/facebook/create-react-app) with the Ant Design library for UI components.

## Available Scripts

In the project directory, you can run various scripts using npm. These scripts help you develop, test, build, and manage your React application.

### `npm start`

Runs the app in development mode. The application will be available at [http://localhost:3000](http://localhost:3000) in your web browser.

The development server will automatically reload the page whenever you make edits to your code. Any lint errors will be displayed in the console.

### `npm test`

Launches the test runner in interactive watch mode. You can write and run tests to ensure your application works as expected. Learn more about testing in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/running-tests).

### `npm run build`

Builds the app for production, generating optimized production-ready code in the `build` folder. This code is minified and includes hashed filenames for caching.

Your application is now ready to be deployed to a web server or a hosting service. Refer to the [deployment documentation](https://facebook.github.io/create-react-app/docs/deployment) for more details on how to deploy your React app.

### `npm run eject`

**Note: Ejecting is a one-way operation. Be cautious!**

If you find yourself needing more control over the build tool and configuration choices, you can eject from Create React App. Ejecting allows you to customize the build and configuration files, giving you full control over dependencies like Webpack, Babel, ESLint, and more.

Once you've ejected, you can't go back, so use this feature with care. However, it can be useful if you need to make extensive customizations to your project's build process.

### Git Operations

When working with a Git repository for your Create React App project, you can follow these common Git operations:

- **Clone the Repository:** To get a copy of the project on your local machine, use the following command:

  ```bash
  git clone <repository-url>
  ```

- **Commit Changes:** After making changes to your code, commit them with a meaningful message:

  ```bash
  git add .
  git commit -m "Your commit message here"
  ```

- **Push Changes:** Push your committed changes to the remote repository:

  ```bash
  git push
  ```

- **Pull Changes:** To update your local repository with changes from the remote repository:

  ```bash
  git pull
  ```

- **Create a New Branch:** If you're working on a new feature or fixing a bug, it's a good practice to create a new branch:

  ```bash
  git checkout -b feature/your-feature-name
  ```

- **Switch Branches:** To switch between branches:

  ```bash
  git checkout branch-name
  ```

- **Merge Branches:** After completing your feature or fix, you can merge your branch into the main branch:

  ```bash
  git checkout main
  git merge feature/your-feature-name
  ```

These Git operations are essential for collaborative development and version control. Always ensure that your code changes are well-documented with commit messages and pushed to the remote repository regularly.

## Learn More

You can learn more about Create React App in the [official documentation](https://facebook.github.io/create-react-app/docs/getting-started). Additionally, if you're new to React, check out the [React documentation](https://reactjs.org/) to learn more about building web applications with React.
