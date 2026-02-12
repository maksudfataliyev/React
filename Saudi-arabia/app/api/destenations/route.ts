import { NextResponse } from "next/server";
import { destinations } from "@/data/destenations";

export async function GET() {
    return NextResponse.json(destinations);  // localhost:3000/api/destenations
}