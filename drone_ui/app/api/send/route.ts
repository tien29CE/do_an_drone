// pages/api/socket/send.ts
import { webSocketClient, webSocketServer } from "../../websocket/socket_server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const data = await req.json()
    const { mode, markers, polygonPoints } = data;
    webSocketClient.sendData(mode, markers, polygonPoints);

    return NextResponse.json({})
}