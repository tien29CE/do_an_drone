// pages/api/socket/start.ts
import axios from "axios";
import { webSocketServer, webSocketClient } from "../../websocket/socket_server";
import { NextResponse } from "next/server";

export default function START() {
  webSocketServer.start();
  webSocketClient.start();
  return NextResponse.json({ message: "Socket server started" });
}