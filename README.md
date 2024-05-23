# Project Description:
This project consists of two source directories: `fe` (client side) and `be` (server side). The application is designed to generate a chart image based on table data extracted from a user-input URL. Upon entering a URL in the frontend, the data is sent to the backend for analysis. If the page at the specified URL contains a table, the backend extracts the necessary data (including value and name) for visualizing a bar chart. The frontend then receives this data and renders the chart. Additionally, users have the option to save the chart as an image using a button provided on the frontend.

## Description
This file provides instructions on how to start the source code in the `fe` (frontend) and `be` (backend) folders.

## Precondition:
- Node.js version 16.20.2 is used for reference. Ensure you have Node.js and npm installed on your computer before proceeding.
- Before running the applications, make sure you have installed all dependencies using the `npm install` command.
- If you encounter any issues during startup, check the error messages and troubleshoot accordingly.

## Setup
To get started, install the dependencies for both the frontend and backend. Navigate to each respective folder (`fe` or `be`) and run the following commands:

```bash
npm install
npm start
