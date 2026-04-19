import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint to initialize the first master admin account
 * This should only work if NO admin exists yet
 * Call this once to create your admin account
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if any master admin already exists
    const { data: existingAdmin } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "master_admin")
      .single();

    if (existingAdmin) {
      return res.status(403).json({ 
        error: "A master admin already exists. Only one master admin is allowed." 
      });
    }

    // Create the auth user using Supabase admin client
    // Note: We need to use the service role key for this
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (authError) {
      console.error("Auth creation error:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User creation failed - no user returned");
    }

    console.log("✅ Auth user created:", authData.user.id);

    // Create profile with master_admin role
    // Wait a bit for the trigger to fire, then update the role
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: "master_admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: "id"
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Try to clean up the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    console.log("✅ Master admin profile created");

    return res.status(200).json({
      success: true,
      message: "Master admin account created successfully",
      userId: authData.user.id
    });
  } catch (error: any) {
    console.error("Init admin error:", error);
    return res.status(500).json({
      error: error.message || "Failed to create admin account"
    });
  }
}