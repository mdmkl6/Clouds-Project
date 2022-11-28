import neo4j, { Driver } from "neo4j-driver";
import { User, RoomMap } from "../types/RoomTypes";

export default class DBcontroller {
  driver: Driver;
  constructor() {
    const uri = "neo4j+s://1dad9e13.databases.neo4j.io";
    const user = "neo4j";
    const password = "wXXhr6pTiQhPJbVgYPSavSoSXhnc-t8Otozqj4ZH-d8";

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async createRoom(userID: number, roomName: string): Promise<boolean | null> {
    const session = this.driver.session({ database: "neo4j" });

    try {
      const Query = `MATCH (u:User) WHERE ID(u)=$userID
      MATCH (u)-[i:IN]->(r1:Room)
      DELETE i
      MERGE (r2:Room {name: $roomName})
      MERGE (r2)-[:Door]->(r1)
      MERGE (r1)-[:Door]->(r2)
      MERGE (u)-[:IN]->(r2)
      Return ID(r2) as id`;

      const result = await session.executeWrite((tx) => tx.run(Query, { userID, roomName }));
      await session.close();
      if (result.records.length > 0) return true;
      else return false;
    } catch (error) {
      console.error(error);
      await session.close();
      return null;
    }
  }

  async createMessage(userID: number, message: string): Promise<boolean | null> {
    const session = this.driver.session({ database: "neo4j" });

    try {
      const Query = `MATCH (u:User) WHERE ID(u)=$userID
      MATCH (u)-[:IN]->(r:Room)
      MERGE (m:Message {message: $message})
      MERGE (m)-[:InRoom]->(r)
      Return ID(m) as id`;

      const result = await session.executeWrite((tx) => tx.run(Query, { userID, message }));
      await session.close();
      if (result.records.length > 0) return true;
      else return false;
    } catch (error) {
      console.error(error);
      await session.close();
      return null;
    }
  }

  async moveToRoom(userID: number, roomID: number): Promise<boolean | null> {
    const session = this.driver.session({ database: "neo4j" });

    try {
      const Query = `MATCH (u:User) WHERE ID(u)=$userID
      MATCH (u)-[i:IN]->(r1:Room)
      MATCH (r1)-[:Door]->(r2:Room) WHERE ID(r2)=$roomID
      DELETE i
      MERGE (u)-[:IN]->(r2)
      return ID(r2) as id`;

      const result = await session.executeWrite((tx) => tx.run(Query, { userID, roomID }));
      await session.close();
      if (result.records.length > 0) return true;
      else return false;
    } catch (error) {
      console.error(error);
      await session.close();
      return null;
    }
  }

  async getNeighborRooms(userID: number): Promise<RoomMap | null> {
    const session = this.driver.session({ database: "neo4j" });

    try {
      const Query1 = `MATCH (u:User)-[:IN]->(r1:Room) WHERE ID(u)=$userID
      MATCH (r1)-[:Door]->(r2:Room)
      RETURN r1.name, r2.name, ID(r2) as id;`;
      const Query2 = `MATCH (u:User)-[:IN]->(r1:Room) WHERE ID(u)=$userID
      MATCH (m:Message)-[:InRoom]->(r1:Room)
      RETURN m.message`;

      let result = await session.executeWrite((tx) => tx.run(Query1, { userID }));
      const rooms: RoomMap = { name: result.records[0].get("r1.name"), doors: [], messages: [] };
      rooms.doors = result.records.map((door) => {
        return { id: door.get("id").getLowBits(), name: door.get("r2.name") };
      });

      result = await session.executeWrite((tx) => tx.run(Query2, { userID }));
      rooms.messages = result.records.map((door) => {
        return { message: door.get("m.message") };
      });

      await session.close();
      return rooms;
    } catch (error) {
      console.error(error);
      await session.close();
      return null;
    }
  }

  async create_user(user: User): Promise<User | null> {
    const session = this.driver.session({ database: "neo4j" });
    try {
      const Query = `MATCH (r:Room) Where ID(r)=0
      MERGE (u:User { username: $username, password: $password }) 
      MERGE (u)-[:IN]->(r)
      Return ID(u) as id`;

      const result = await session.executeWrite((tx) =>
        tx.run(Query, { username: user.username, password: user.password })
      );
      await session.close();
      if (result.records[0]) {
        user.id = result.records[0].get("id").getLowBits();
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      await session.close();
      return null;
    }
  }

  async get_user(user: User): Promise<User | null> {
    const session = this.driver.session({ database: "neo4j" });
    try {
      const Query = "MATCH (u:User { username: $username}) RETURN u.password, ID(u) as id";

      const result = await session.executeRead((tx) => tx.run(Query, { username: user.username }));
      await session.close();
      if (result.records[0]) {
        user.id = result.records[0].get("id").getLowBits();
        user.password = result.records[0].get("u.password");
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      session.close();
      return null;
    }
  }
}

export type { User };
