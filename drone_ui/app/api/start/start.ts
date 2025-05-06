// pages/api/socket/start.ts
import { NextResponse } from "next/server";
import { webSocketClient } from "../../websocket/socket_client";

export default function START() {
  webSocketClient.start();
  return NextResponse.json({ message: "Socket client started" });
}