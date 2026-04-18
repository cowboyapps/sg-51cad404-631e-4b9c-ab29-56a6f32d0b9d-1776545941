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
    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "master_admin")
      .limit(1);

    if (checkError) throw checkError;

    if (existingAdmins && existingAdmins.length > 0) {
      return res.status(400).json({
        error: "Master admin already exists",
        admin_email: existingAdmins[0].email,
        message: "Login with the existing admin credentials"
      });
    }

    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Create the admin user via Supabase Auth (as admin)
    // Note: This uses the service role key from environment
    const adminClient = supabase;

    const { data: authData, error: authError } = await adminClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "Platform Administrator",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // Update the profile to set role as master_admin
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        role: "master_admin",
        full_name: fullName || "Platform Administrator",
      })
      .eq("id", authData.user.id);

    if (profileError) throw profileError;

    return res.status(200).json({
      success: true,
      message: "Master admin created successfully",
      email: authData.user.email,
      user_id: authData.user.id,
      next_step: "Login at /login with your credentials"
    });

  } catch (error: any) {
    console.error("Error creating admin:", error);
    return res.status(500).json({
      error: error.message || "Failed to create admin account"
    });
  }
}