import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "new_ticket" | "new_reply" | "status_change";
  ticket_id: string;
  recipient_email: string;
  recipient_name: string;
  ticket_subject: string;
  business_name: string;
  message?: string;
  status?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, ticket_id, recipient_email, recipient_name, ticket_subject, business_name, message, status } =
      await req.json() as NotificationRequest;

    let emailSubject = "";
    let emailBody = "";

    switch (type) {
      case "new_ticket":
        emailSubject = `New Support Ticket: ${ticket_subject}`;
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #06B6D4;">New Support Ticket Received</h2>
            <p>Hi ${recipient_name},</p>
            <p>A new support ticket has been created in your ${business_name} dashboard.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Ticket Details</h3>
              <p><strong>Subject:</strong> ${ticket_subject}</p>
              ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ""}
            </div>

            <p>
              <a href="${Deno.env.get("SITE_URL")}/business/support" 
                 style="background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Ticket
              </a>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This is an automated notification from your IPTV Platform.
            </p>
          </div>
        `;
        break;

      case "new_reply":
        emailSubject = `New Reply: ${ticket_subject}`;
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #06B6D4;">New Reply on Your Ticket</h2>
            <p>Hi ${recipient_name},</p>
            <p>There's a new reply on your support ticket.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Ticket: ${ticket_subject}</h3>
              ${message ? `<p>${message}</p>` : ""}
            </div>

            <p>
              <a href="${Deno.env.get("SITE_URL")}/customer/support" 
                 style="background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Ticket
              </a>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This is an automated notification from ${business_name}.
            </p>
          </div>
        `;
        break;

      case "status_change":
        emailSubject = `Ticket Status Updated: ${ticket_subject}`;
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #06B6D4;">Ticket Status Updated</h2>
            <p>Hi ${recipient_name},</p>
            <p>The status of your support ticket has been updated.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Ticket: ${ticket_subject}</h3>
              <p><strong>New Status:</strong> <span style="text-transform: capitalize;">${status}</span></p>
            </div>

            <p>
              <a href="${Deno.env.get("SITE_URL")}/customer/support" 
                 style="background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Ticket
              </a>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This is an automated notification from ${business_name}.
            </p>
          </div>
        `;
        break;
    }

    // In production, integrate with your email service (SendGrid, Resend, etc.)
    // For now, we'll log the email details
    console.log("Email notification:", {
      to: recipient_email,
      subject: emailSubject,
      html: emailBody,
    });

    // TODO: Integrate with email service provider
    // Example with Resend:
    // const resendApiKey = Deno.env.get("RESEND_API_KEY");
    // await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${resendApiKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     from: "support@yourplatform.com",
    //     to: recipient_email,
    //     subject: emailSubject,
    //     html: emailBody,
    //   }),
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification logged (integrate email provider to send)" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});