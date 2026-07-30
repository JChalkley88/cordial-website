import { CRM_INBOUND_URL, CORDIAL_INBOUND_KEY } from 'astro:env/server';

// The single CRM inbound writer, shared by the contact form and the ISO
// readiness check. Extracted from /api/contact so neither route reimplements
// the auth, the status handling or the error shape. Behaviour is unchanged
// from the version that lived in the contact route.

export interface CrmLead {
  name: string;
  email: string;
  message: string;
  /** The funnel this lead came from. The CRM validates this value. */
  source: string;
  company?: string;
  phone?: string;
  /**
   * Legacy free-text how-heard. The CRM resolves it by matching the text
   * against its referred-by labels, and never rejects it. Kept during the
   * referredByKey verification window; see ContactSection.astro.
   */
  howHeard?: string;
  /**
   * The CRM's referred_by_sources key. The structured path: the CRM validates
   * it and answers 400 for a key it does not know, which this module throws on
   * so the caller runs its Resend fallback. When both this and howHeard are
   * present, the CRM's contract is that this one wins.
   */
  referredByKey?: string;
  submittedAt: string;
}

// Returns the CRM's lead id when it has one. Throws on any failure so the
// caller can run its Resend fallback and never lose the lead.
export async function deliverToCrm(lead: CrmLead): Promise<string | undefined> {
  if (!CRM_INBOUND_URL || !CORDIAL_INBOUND_KEY) {
    // Not configured locally: treat as a delivery failure so the fallback path
    // records the lead. (In production these are always set.)
    throw new Error('CRM not configured');
  }

  const res = await fetch(CRM_INBOUND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CORDIAL_INBOUND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      company: lead.company || undefined,
      phone: lead.phone || undefined,
      message: lead.message,
      source: lead.source,
      how_heard: lead.howHeard || undefined,
      // Exact spelling matters: the CRM's inbound schema is not strict, so a
      // field name it does not recognise is dropped without an error and the
      // lead lands with no attribution at all.
      referred_by_key: lead.referredByKey || undefined,
      submitted_at: lead.submittedAt,
    }),
  });

  if (res.status === 200) {
    const out = await res.json().catch(() => ({}));
    return typeof out?.lead_id === 'string' ? out.lead_id : undefined;
  }
  if (res.status === 400) {
    const out = await res.json().catch(() => ({}));
    throw new Error(`CRM rejected: ${out?.error || 'bad request'}`);
  }
  if (res.status === 401) {
    console.error('[website] CRM returned 401, check CORDIAL_INBOUND_KEY');
    throw new Error('CRM auth failed');
  }
  throw new Error(`CRM error ${res.status}`);
}
