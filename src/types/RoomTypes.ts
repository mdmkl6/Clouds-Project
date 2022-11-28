type RoomMap = {
  name: string;
  doors: Array<Door>;
  messages: Array<Message>;
};

type Door = { id: number; name: string };

type Message = { message: string };

type User = {
  id?: number;
  username: string;
  password: string;
};

export type { RoomMap, User, Door, Message };
