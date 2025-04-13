// pages/api/socket/start.ts
import { webSocketServer } from "../../websocket/socket_server";
import { NextResponse } from "next/server";
import { webSocketClient } from "../../websocket/socket_client";

export default function START() {
  webSocketServer.start();
  webSocketClient.start();
  return NextResponse.json({ message: "Socket server started" });
}