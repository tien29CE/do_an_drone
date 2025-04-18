// pages/api/socket/send.ts
import { NextResponse } from "next/server";
import { webSocketClient } from "../../websocket/socket_client";

export async function POST(req: Request) {
    const data = await req.json()
    const {command, mode, markers, polygonPoints } = data;
    webSocketClient.sendData(command, mode, markers, polygonPoints);

    return NextResponse.json({})
}