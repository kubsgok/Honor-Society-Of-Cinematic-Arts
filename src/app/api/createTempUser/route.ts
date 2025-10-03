import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userData = await request.json();
    // console.log('Received user data:', userData);
    
    const { firstName, lastName, email, dob, gradMonth, gradYear, school } = userData;
    
    // console.log('Extracted fields:', { firstName, lastName, email, dob, gradMonth, gradYear, school });
    
    if (!firstName || !lastName || !email || !dob || !gradMonth || !gradYear || !school) {
    //   console.log('Validation failed - missing fields:', {
    //     firstName: !!firstName,
    //     lastName: !!lastName,
    //     email: !!email,
    //     dob: !!dob,
    //     gradMonth: !!gradMonth,
    //     gradYear: !!gradYear,
    //     school: !!school
    //   });
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    const {error} = await supabase.from('temp_users').insert({
        full_name: `${firstName} ${lastName}`,
        email: email,
        dob: dob,
        grad_month: gradMonth,
        grad_year: gradYear,
        school: school,
    })

    if (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create temp user" }, { status: 500 });
    }

    return NextResponse.json({ message: "Temp user created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}