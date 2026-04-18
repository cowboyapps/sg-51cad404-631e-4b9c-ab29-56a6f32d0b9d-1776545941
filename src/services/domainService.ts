import { supabase } from "@/integrations/supabase/client";

/**
 * Domain Service - Handles domain registration and management via Namecheap API
 * Currently configured for sandbox/test mode
 */

// Namecheap API configuration (sandbox)
const NAMECHEAP_API_USER = process.env.NEXT_PUBLIC_NAMECHEAP_API_USER || "testuser";
const NAMECHEAP_API_KEY = process.env.NEXT_PUBLIC_NAMECHEAP_API_KEY || "test_key";
const NAMECHEAP_USERNAME = process.env.NEXT_PUBLIC_NAMECHEAP_USERNAME || "testuser";
const NAMECHEAP_API_ENDPOINT = "https://api.sandbox.namecheap.com/xml.response";

// Pricing configuration
const DOMAIN_WHOLESALE_PRICE = 12.00; // Simulated wholesale cost
const DOMAIN_RETAIL_PRICE = 25.00;    // Customer-facing price
const DOMAIN_PROFIT_MARGIN = DOMAIN_RETAIL_PRICE - DOMAIN_WHOLESALE_PRICE;

interface DomainAvailability {
  domain: string;
  available: boolean;
  price: number;
  premium: boolean;
}

interface DomainPurchaseResult {
  success: boolean;
  domain: string;
  registrarId?: string;
  expirationDate?: string;
  error?: string;
}

export const domainService = {
  /**
   * Search for domain availability across common TLDs
   */
  async searchDomain(searchTerm: string): Promise<DomainAvailability[]> {
    const cleanTerm = searchTerm.toLowerCase().replace(/\s+/g, "").replace(/^(https?:\/\/)?(www\.)?/, "");
    const baseDomain = cleanTerm.split(".")[0];
    
    // Check multiple TLDs
    const tlds = [".com", ".net", ".org", ".io", ".co"];
    const domains = tlds.map(tld => baseDomain + tld);

    // Simulate API call to Namecheap
    // In production, this would call: domains.check API command
    const results: DomainAvailability[] = domains.map(domain => ({
      domain,
      available: Math.random() > 0.5, // Simulated availability
      price: DOMAIN_RETAIL_PRICE,
      premium: false,
    }));

    // In production, uncomment this:
    /*
    try {
      const response = await fetch(
        `${NAMECHEAP_API_ENDPOINT}?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_USERNAME}&Command=namecheap.domains.check&ClientIp=YOUR_IP&DomainList=${domains.join(",")}`
      );
      const data = await response.text();
      // Parse XML response and return availability
    } catch (error) {
      console.error("Domain search error:", error);
      throw error;
    }
    */

    return results;
  },

  /**
   * Purchase domain and automatically configure DNS
   */
  async purchaseDomain(
    businessId: string,
    domain: string,
    contactInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    }
  ): Promise<DomainPurchaseResult> {
    try {
      // Step 1: Purchase domain via Namecheap API
      // In production, this calls: domains.create API command
      const registrarId = `NC${Date.now()}`; // Simulated order ID
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      // Simulated purchase - in production, uncomment this:
      /*
      const purchaseResponse = await fetch(
        `${NAMECHEAP_API_ENDPOINT}?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_USERNAME}&Command=namecheap.domains.create&ClientIp=YOUR_IP&DomainName=${domain}&Years=1&...contact_params`
      );
      */

      // Step 2: Get business details for DNS setup
      const { data: business } = await supabase
        .from("businesses")
        .select("slug")
        .eq("id", businessId)
        .single();

      if (!business) throw new Error("Business not found");

      // Step 3: Automatically configure DNS records
      await this.configureDNS(domain, business.slug);

      // Step 4: Update business record with domain info
      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          custom_domain: domain,
          email_domain: `mg.${domain}`,
          email_domain_verified: true, // Auto-verified for platform-managed domains
          domain_managed_by_platform: true,
          domain_registration_expires: expirationDate.toISOString(),
          domain_auto_renew: true,
          domain_registrar_id: registrarId,
          domain_purchase_price: DOMAIN_RETAIL_PRICE,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId);

      if (updateError) throw updateError;

      return {
        success: true,
        domain,
        registrarId,
        expirationDate: expirationDate.toISOString(),
      };
    } catch (error) {
      console.error("Domain purchase error:", error);
      return {
        success: false,
        domain,
        error: error instanceof Error ? error.message : "Purchase failed",
      };
    }
  },

  /**
   * Automatically configure DNS records for purchased domain
   */
  async configureDNS(domain: string, businessSlug: string): Promise<void> {
    // In production, this calls: namecheap.domains.dns.setHosts API command
    
    const dnsRecords = [
      // CNAME for custom domain routing
      {
        type: "CNAME",
        host: "@",
        value: "cname.vercel-dns.com", // Platform's hosting
        ttl: 1800,
      },
      // CNAME for www subdomain
      {
        type: "CNAME",
        host: "www",
        value: "cname.vercel-dns.com",
        ttl: 1800,
      },
      // SPF record for email authentication
      {
        type: "TXT",
        host: `mg.${domain}`,
        value: "v=spf1 include:mailgun.org ~all",
        ttl: 1800,
      },
      // DKIM record for email authentication
      {
        type: "TXT",
        host: `mx._domainkey.mg.${domain}`,
        value: "k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
        ttl: 1800,
      },
    ];

    console.log("Configuring DNS records for:", domain, dnsRecords);
    
    // In production, uncomment this to set DNS via API:
    /*
    const response = await fetch(
      `${NAMECHEAP_API_ENDPOINT}?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_USERNAME}&Command=namecheap.domains.dns.setHosts&ClientIp=YOUR_IP&SLD=${domain.split('.')[0]}&TLD=${domain.split('.')[1]}&HostName1=@&RecordType1=CNAME&Address1=cname.vercel-dns.com&TTL1=1800&...`
    );
    */
  },

  /**
   * Renew domain registration
   */
  async renewDomain(businessId: string): Promise<boolean> {
    try {
      const { data: business } = await supabase
        .from("businesses")
        .select("custom_domain, domain_registrar_id")
        .eq("id", businessId)
        .single();

      if (!business?.custom_domain) throw new Error("No domain to renew");

      // Call Namecheap renew API
      // namecheap.domains.renew command

      const newExpiration = new Date();
      newExpiration.setFullYear(newExpiration.getFullYear() + 1);

      const { error } = await supabase
        .from("businesses")
        .update({
          domain_registration_expires: newExpiration.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Domain renewal error:", error);
      return false;
    }
  },

  /**
   * Toggle auto-renewal setting
   */
  async setAutoRenew(businessId: string, autoRenew: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          domain_auto_renew: autoRenew,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Auto-renew update error:", error);
      return false;
    }
  },

  /**
   * Get domain info for a business
   */
  async getDomainInfo(businessId: string) {
    const { data, error } = await supabase
      .from("businesses")
      .select("custom_domain, email_domain, domain_managed_by_platform, domain_registration_expires, domain_auto_renew, domain_purchase_price")
      .eq("id", businessId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get pricing information
   */
  getPricing() {
    return {
      wholesale: DOMAIN_WHOLESALE_PRICE,
      retail: DOMAIN_RETAIL_PRICE,
      profit: DOMAIN_PROFIT_MARGIN,
    };
  },
};