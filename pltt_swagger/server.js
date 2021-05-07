require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");

// Get environment variables
const { YAML, PORT, SERVER_URL, SERVER_DESC } = process.env;

// Load swagger doc
const swaggerDoc = yaml.load(`./${YAML}.yaml`);

const app = express();

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.listen(PORT,'0.0.0.0', () => console.log(`${YAML} API Doc listening on port ${PORT}`));