const { Server } = require("socket.io");

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Admin Socket connected successfully. ID:", socket.id);

    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    socket.on("disconnect", () => {
      console.log("Admin socket disconnected:", socket.id);
    });
  });
}

module.exports = {
  initSocket,
  get io() {
    return io;
  }
};
