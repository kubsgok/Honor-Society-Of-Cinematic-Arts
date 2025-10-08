import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const chapterData = await request.json();
    
    const { schoolName, street, city, state, country, schoolFirstMonth, schoolGradMonth} = chapterData;
    if (!schoolName || !street || !city || !state || !country || !schoolFirstMonth || !schoolGradMonth) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
        /**const [schoolName, setSchoolName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [schoolFirstMonth, setSchoolFirstMonth] = useState("");
  const [schoolGradMonth, setSchoolGradMonth] = useState(""); */

  const {error} = await supabase.from('chapters').insert({
        chapter_number: 302,
        school_name: schoolName,
        street: street,
        city: city,
        state: state,
        country: country,
        first_school_month: schoolFirstMonth,
        grad_month: schoolGradMonth,
    })
    if (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create a chapter" }, { status: 500 });
    }

    return NextResponse.json({ message: "Temp user created successfully" }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}