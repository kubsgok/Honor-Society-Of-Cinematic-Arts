import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { firstName, lastName, school,email, dateOfBirth, gradMonth, gradYear } = userData;
    
    if (!firstName || !lastName || !school || !email || !dateOfBirth || !gradMonth || !gradYear) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    
    //make sure it fits the format of the object needed, if not do invalid data error
    //make the actual user
  } catch (error) {
    
  }
}