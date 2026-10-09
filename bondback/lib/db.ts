import { Pool } from "pg";
import { DisputeCase, EvidenceItem, LandlordClaimItem, RebuttalLineItem, TimelineEvent } from "./types";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.dbenxqgizvdrcumasgdb:aJdky3xqQTH3%2Fj-@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";

// Singleton pool across hot-reloads
declare global {
  var _supabasePool: Pool | undefined;
}

export const pool =
  global._supabasePool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  global._supabasePool = pool;
}

export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
}

// ── Auth & Users ────────────────────────────────────────────────────────────

export async function getOrCreateUser(email: string, fullName: string): Promise<DbUser> {
  const selectQuery = "SELECT id, email, full_name, avatar_url FROM users WHERE email = $1";
  const selectRes = await pool.query(selectQuery, [email.toLowerCase().trim()]);

  if (selectRes.rows.length > 0) {
    return selectRes.rows[0];
  }

  const insertQuery = `
    INSERT INTO users (email, full_name, avatar_url)
    VALUES ($1, $2, $3)
    RETURNING id, email, full_name, avatar_url
  `;
  const insertRes = await pool.query(insertQuery, [
    email.toLowerCase().trim(),
    fullName.trim(),
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
  ]);

  return insertRes.rows[0];
}

// ── Disputes ────────────────────────────────────────────────────────────────

export async function getUserDisputes(userId: string) {
  const query = `
    SELECT id, case_number, tenant_name, property_address, managing_agent,
           total_claimed, statutory_cap, counter_offer, status, created_at, updated_at
    FROM disputes
    WHERE user_id = $1
    ORDER BY updated_at DESC
  `;
  const res = await pool.query(query, [userId]);
  return res.rows;
}

export async function getFullDisputeCase(disputeId: string): Promise<DisputeCase | null> {
  const disputeRes = await pool.query("SELECT * FROM disputes WHERE id = $1", [disputeId]);
  if (disputeRes.rows.length === 0) return null;

  const d = disputeRes.rows[0];

  // Fetch Claims
  const claimsRes = await pool.query(
    "SELECT * FROM dispute_claims WHERE dispute_id = $1 ORDER BY created_at ASC",
    [disputeId]
  );

  // Fetch Evidence
  const evidenceRes = await pool.query(
    "SELECT * FROM dispute_evidence WHERE dispute_id = $1 ORDER BY timestamp ASC",
    [disputeId]
  );

  // Fetch Timeline
  const timelineRes = await pool.query(
    "SELECT * FROM dispute_timeline WHERE dispute_id = $1 ORDER BY event_date ASC",
    [disputeId]
  );

  const claims: LandlordClaimItem[] = claimsRes.rows.map((r) => ({
    id: r.id,
    category: r.category as any,
    room: r.room,
    amountClaimed: parseFloat(r.amount_claimed),
    landlordDescription: r.landlord_description || "",
    itemAgeYears: parseFloat(r.item_age_years || "0"),
    initialInstallCost: r.amount_claimed ? parseFloat(r.amount_claimed) * 1.3 : undefined,
  }));

  const evidence: EvidenceItem[] = evidenceRes.rows.map((r) => ({
    id: r.id,
    filename: r.filename,
    timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
    room: r.room,
    photoUrl: r.photo_url,
    isBackgroundMining: Boolean(r.is_background_mining),
    boundingBox: r.bounding_box || undefined,
    aiFinding: r.ai_finding || "",
    cameraModel: r.camera_model || undefined,
    gpsLocation: r.gps_location || undefined,
    sha256Hash: r.sha256_hash || undefined,
  }));

  const rebuttals: RebuttalLineItem[] = claimsRes.rows.map((r) => {
    const claimItem = claims.find((c) => c.id === r.id) || claims[0];
    return {
      claimItem,
      matchedEvidence: evidence,
      depreciationLifespanYears: parseFloat(r.statutory_lifespan || "10"),
      maximumStatutoryCap: parseFloat(r.statutory_legal_cap || "0"),
      counterOffer: parseFloat(r.counter_offer || "0"),
      rebuttalArgument: r.rebuttal_argument || "",
      citations: Array.isArray(r.citations) ? r.citations : [],
    };
  });

  const timeline: TimelineEvent[] = timelineRes.rows.map((r) => ({
    id: r.id,
    date: r.event_date ? new Date(r.event_date).toISOString() : new Date().toISOString(),
    title: r.title,
    description: r.description || "",
    category: r.category as any,
    room: r.room,
    isEvidenceGap: Boolean(r.is_gap),
    gapResolutionAdvice: r.is_gap ? "Attach proof or cleaning invoice to resolve gap" : undefined,
    status: r.status as any,
  }));

  return {
    id: d.id,
    caseNumber: d.case_number,
    tenantName: d.tenant_name,
    propertyAddress: d.property_address,
    managingAgent: d.managing_agent,
    leaseStartDate: "2022-02-15",
    leaseEndDate: "2025-01-10",
    bondAmount: 3200,
    claims,
    evidence,
    rebuttals,
    timeline,
  };
}

export async function saveDisputeCase(userId: string, disputeCase: DisputeCase): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Upsert Dispute
    const totalClaimed = disputeCase.claims.reduce((acc, c) => acc + c.amountClaimed, 0);
    const statutoryCap = disputeCase.rebuttals.reduce((acc, r) => acc + r.maximumStatutoryCap, 0);
    const counterOffer = disputeCase.rebuttals.reduce((acc, r) => acc + r.counterOffer, 0);

    const disputeSql = `
      INSERT INTO disputes (
        id, user_id, case_number, tenant_name, property_address, managing_agent,
        total_claimed, statutory_cap, counter_offer, status, updated_at
      )
      VALUES (
        COALESCE(NULLIF($1, ''), gen_random_uuid()::text)::uuid,
        $2, $3, $4, $5, $6, $7, $8, $9, 'analyzed', NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        tenant_name = EXCLUDED.tenant_name,
        property_address = EXCLUDED.property_address,
        managing_agent = EXCLUDED.managing_agent,
        total_claimed = EXCLUDED.total_claimed,
        statutory_cap = EXCLUDED.statutory_cap,
        counter_offer = EXCLUDED.counter_offer,
        updated_at = NOW()
      RETURNING id
    `;

    const disputeRes = await client.query(disputeSql, [
      disputeCase.id || "",
      userId,
      disputeCase.caseNumber,
      disputeCase.tenantName,
      disputeCase.propertyAddress,
      disputeCase.managingAgent,
      totalClaimed,
      statutoryCap,
      counterOffer,
    ]);

    const disputeId = disputeRes.rows[0].id;

    // Delete existing child items
    await client.query("DELETE FROM dispute_claims WHERE dispute_id = $1", [disputeId]);
    await client.query("DELETE FROM dispute_evidence WHERE dispute_id = $1", [disputeId]);
    await client.query("DELETE FROM dispute_timeline WHERE dispute_id = $1", [disputeId]);

    // Insert Claims & Rebuttals
    for (const r of disputeCase.rebuttals) {
      await client.query(
        `INSERT INTO dispute_claims (
          dispute_id, category, room, amount_claimed, landlord_description,
          item_age_years, statutory_lifespan, statutory_legal_cap, counter_offer,
          rebuttal_argument, citations
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          disputeId,
          r.claimItem.category,
          r.claimItem.room,
          r.claimItem.amountClaimed,
          r.claimItem.landlordDescription,
          r.claimItem.itemAgeYears,
          r.depreciationLifespanYears,
          r.maximumStatutoryCap,
          r.counterOffer,
          r.rebuttalArgument,
          JSON.stringify(r.citations),
        ]
      );
    }

    // Insert Evidence
    for (const ev of disputeCase.evidence) {
      await client.query(
        `INSERT INTO dispute_evidence (
          dispute_id, filename, timestamp, room, photo_url,
          is_background_mining, bounding_box, ai_finding,
          camera_model, gps_location, sha256_hash
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          disputeId,
          ev.filename,
          ev.timestamp,
          ev.room,
          ev.photoUrl,
          ev.isBackgroundMining,
          ev.boundingBox ? JSON.stringify(ev.boundingBox) : null,
          ev.aiFinding,
          ev.cameraModel || null,
          ev.gpsLocation || null,
          ev.sha256Hash || null,
        ]
      );
    }

    // Insert Timeline
    for (const tm of disputeCase.timeline) {
      await client.query(
        `INSERT INTO dispute_timeline (
          dispute_id, event_date, title, description, category, room, is_gap, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          disputeId,
          tm.date,
          tm.title,
          tm.description,
          tm.category,
          tm.room,
          tm.isEvidenceGap,
          tm.status,
        ]
      );
    }

    await client.query("COMMIT");
    return disputeId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
