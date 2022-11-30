import { Door, RoomMap, Message } from "../types/RoomTypes";

get_dors(init);

function init(): void {
  const create_room_btn = document.getElementById("create_room_btn");
  const create_message_btn = document.getElementById("create_message_btn");
  if (create_room_btn && create_message_btn) {
    create_room_btn.onclick = new_door;
    create_message_btn.onclick = new_message;
  } else set_info("Error in initialization please refresh site");
}

function get_dors(next?: () => void): void {
  fetch("/game/get_neighbor_rooms", { method: "POST", redirect: "follow" })
    .then((response) => response.json())
    .then((data: RoomMap) => {
      if (data) {
        create_dors(data);
        clear_info();
      } else "Do not found dors";
      if (next) next();
    });
}

function move_to(roomid: number): void {
  fetch("/game/move_to_room", {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomid: roomid }),
  })
    .then((response) => response.json())
    .then((data: RoomMap) => {
      if (data) {
        create_dors(data);
        clear_info();
      } else set_info("Do not found chosen dors");
    });
}

function new_door(): void {
  const roomname = document.getElementById("newroomname") as HTMLInputElement;
  if (roomname && roomname.value.length > 0) {
    fetch("/game/create_room", {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomname: roomname.value }),
    })
      .then((response) => response.json())
      .then((data: RoomMap) => {
        roomname.value = "";
        if (data) {
          create_dors(data);
          clear_info();
        } else set_info("Error creating dors");
      });
  } else set_info("Please set new dors name");
}

function new_message(): void {
  const newmessage = document.getElementById("newmessage") as HTMLInputElement;
  if (newmessage && newmessage.value.length > 0) {
    fetch("/game/create_message", {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newmessage.value }),
    })
      .then((response) => response.json())
      .then((data: RoomMap) => {
        const doors_div = document.getElementById("doors");
        if (data && doors_div) {
          const div = document.createElement("div");
          div.classList.add("message");
          div.innerHTML = `<p>${newmessage.value}</p>`;
          doors_div.appendChild(div);
          clear_info();
        } else set_info("Error creating message");
        newmessage.value = "";
      });
  } else set_info("Please type in your message first");
}

function create_dors(room: RoomMap): void {
  const roomname_div = document.getElementById("roomname");
  if (roomname_div) roomname_div.innerHTML = room.name;

  const doors_div = document.getElementById("doors");
  if (doors_div) {
    doors_div.innerHTML = "";
    room.doors.forEach((door: Door) => {
      const div = document.createElement("div");
      div.onclick = () => move_to(door.id);
      div.classList.add("door");
      div.innerHTML = `<img src="Door.jpg" alt="Door" width="250" height="300"><h2>${door.name}</h2>`;
      doors_div.appendChild(div);
    });
    room.messages.forEach((message: Message) => {
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `<p>${message.message}</p>`;
      doors_div.appendChild(div);
    });
  }
}

function set_info(text: string) {
  const info = document.getElementById("info");
  if (info) info.innerHTML = text;
}

function clear_info() {
  const info = document.getElementById("info");
  if (info) info.innerHTML = "";
}
