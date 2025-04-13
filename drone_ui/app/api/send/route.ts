// pages/api/socket/send.ts
import { webSocketServer } from "../../websocket/socket_server";
import { NextResponse } from "next/server";
import { webSocketClient } from "../../websocket/socket_client";

export async function POST(req: Request) {
    const data = await req.json()
    const { mode, markers, polygonPoints } = data;
    webSocketClient.sendData(mode, markers, polygonPoints);

    return NextResponse.json({})
}