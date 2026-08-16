import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join", (incidentID) => {
      socket.join(`incident:${incidentID}`);
    });
  });
  return io;
};

export const getIO = () => {
  return io;
};
