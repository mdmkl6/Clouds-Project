import express from "express";
import { authenticate } from "./AuthRouter";
import { db } from "./server";

const Gamerouter = express.Router();

Gamerouter.post("/create_room", authenticate, async (req: any, res) => {
  if (await db.createRoom(req.id, req.body.roomname)) res.json(await db.getNeighborRooms(req.id));
  else res.json(null);
});

Gamerouter.post("/create_message", authenticate, async (req: any, res) => {
  if (await db.createMessage(req.id, req.body.message)) res.json(true);
  else res.json(null);
});

Gamerouter.post("/move_to_room", authenticate, async (req: any, res) => {
  if (await db.moveToRoom(req.id, req.body.roomid)) res.json(await db.getNeighborRooms(req.id));
  else res.json(null);
});

Gamerouter.post("/get_neighbor_rooms", authenticate, async (req: any, res) => {
  res.json(await db.getNeighborRooms(req.id));
});

export { Gamerouter };
