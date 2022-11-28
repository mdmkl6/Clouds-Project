import express from "express";
import path from "path";
import cookieparser from "cookie-parser";
import pug from "pug";
import DB from "./DBController";
import { Authrouter, authenticate } from "./AuthRouter";
import { Gamerouter } from "./GameRouter";

const app = express();
const port = 3000;
const templates_location = path.resolve(__dirname, "../dist/templates");
const client_location = path.resolve(__dirname, "../dist/client");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieparser());

const db = new DB();
app.use("/auth", Authrouter);
app.use("/game", Gamerouter);

app.get("/", authenticate, (req, res) => {
  res.sendFile(path.join(client_location, "/index.html"));
});

app.get("/auth", (req, res) => {
  const template = pug.compileFile(path.join(templates_location, "/auth.pug"));
  if (req.query.message) res.send(template({ message: req.query.message }));
  else res.send(template({ message: "" }));
});

app.get("/login", (req, res) => {
  const template = pug.compileFile(path.join(templates_location, "/login.pug"));
  if (req.query.message) res.send(template({ message: req.query.message }));
  else res.send(template({ message: "" }));
});

app.get("/register", (req, res) => {
  const template = pug.compileFile(path.join(templates_location, "/register.pug"));
  if (req.query.message) res.send(template({ message: req.query.message }));
  else res.send(template({ message: "" }));
});

app.get("/client.js", authenticate, (req, res) => {
  res.sendFile(path.join(client_location, "/client.js"));
});

app.get("/Door.jpg", authenticate, (req, res) => {
  res.sendFile(path.join(client_location, "/Door.jpg"));
});

app.listen(port, () => {
  console.log("running");
});

export { db };
