const express = require("express");
const cors = require("cors");
const earthquakes = require("./earthquakes");
const tornadoes = require("./tornadoes");
const hurricanes = require("./hurricanes");
const planes = require("./planes");
const wildfires = require("./wildfires");

const app = express();
app.use(cors());

app.get("/api/earthquakes", earthquakes);
app.get("/api/tornadoes", tornadoes);
app.get("/api/hurricanes", hurricanes);
app.get("/api/planes", planes);
app.get("/api/wildfires", wildfires);

const PORT = 5000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
