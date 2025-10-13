import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface License {
    id: string;
    created_at: string;
    chapter_id: string;
    chapter_fee: number;
    member_fee: number;
    nominee_fee: number;
    num_licenses: number;
    chapter_fee_paid: boolean;
    startup_fee: number;
    late_fee: number;
    license_paid: boolean;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        
        let licensesData: License[] = [];
        
        const { data, error } = await supabase
            .from('licenses')
            .select('id, created_at, chapter_id, chapter_fee, member_fee, nominee_fee, num_licenses, chapter_fee_paid, startup_fee, late_fee, license_paid')
            .order('created_at', { ascending: false });
         
        if (error) {
            console.error("Error fetching licenses: ", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        licensesData = data || [];
         
        return NextResponse.json({ licensesData });
    } catch (error) {
        console.error("Error fetching licenses: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}