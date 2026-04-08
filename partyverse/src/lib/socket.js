import { io } from "socket.io-client";

const socket = io("https://rv5p3h4n-5000.inc1.devtunnels.ms", {
  withCredentials: true,
});

export default socket;