import { NextResponse } from "next/server";

export async function GET(request: Request) {
    return NextResponse.json({
        message: "Hello from the Caixa API!",
        method: request.method,
        url: request.url,
    });
}