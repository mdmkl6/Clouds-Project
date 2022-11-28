import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "./DBController";
import { db } from "./server";

const Authrouter = express.Router();

const secret = "RpHoiKR3MFQuf4uiH9yN";

function authenticate(req, res, next) {
  const token = req.cookies.JWT;

  if (!token) return res.redirect("/auth");

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.redirect("/auth");
    req.id = user.id;
    next();
  });
}

Authrouter.post("/register", async (req, res) => {
  let user: User = req.body;
  if (!(await db.get_user(user))) {
    bcrypt.hash(user.password, 10).then(async (hash) => {
      user.password = hash;
      user = (await db.create_user(user)) as User;
      if (user) {
        const accessToken = jwt.sign({ id: user.id }, secret, { expiresIn: 120000 });
        res.cookie("JWT", accessToken, { maxAge: 86400000 });
        res.redirect("/");
      } else {
        res.redirect("/register?message=" + encodeURIComponent("Registration error"));
      }
    });
  } else {
    res.redirect("/register?message=" + encodeURIComponent("Account with that Login arleady exist"));
  }
});

Authrouter.post("/login", async (req, res) => {
  let user: User = JSON.parse(JSON.stringify(req.body));
  user = (await db.get_user(user)) as User;
  if (user) {
    await bcrypt.compare(req.body.password, user.password).then((match) => {
      if (match) {
        const accessToken = jwt.sign({ id: user.id }, secret, { expiresIn: 120000 });
        res.cookie("JWT", accessToken, { maxAge: 86400000 });
        res.redirect("/");
      } else {
        res.redirect("/Login?message=" + encodeURIComponent("Wrong password"));
      }
    });
  } else {
    res.redirect("/Login?message=" + encodeURIComponent("User not exist"));
  }
});

Authrouter.get("/logout", authenticate, (req, res) => {
  res.clearCookie("JWT", { path: "/", domain: "localhost" });
  res.redirect("/auth");
});

export { Authrouter, authenticate };
