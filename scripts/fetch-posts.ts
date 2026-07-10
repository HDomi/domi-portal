import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

interface Post {
  uuid: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  tags?: Record<string, boolean> | string[];
  embedding?: number[];
  [key: string]: any;
}

interface PostIndexItem {
  uuid: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
}

const OUTPUT_DIR = path.join(__dirname, "../public/data");
const POSTS_DETAIL_DIR = path.join(OUTPUT_DIR, "posts");

// Helper to parse environmental variables from .env if it exists
function getCredentials() {
  const envPath = path.join(__dirname, "../.env");
  let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let databaseUrl = process.env.FIREBASE_DATABASE_URL;

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const serviceAccountMatch = envContent.match(
      /FIREBASE_SERVICE_ACCOUNT_JSON\s*=\s*(\{[\s\S]*?\})/,
    );
    const databaseUrlMatch = envContent.match(/FIREBASE_DATABASE_URL\s*=\s*(https?:\/\/[^\s\n]+)/);

    if (serviceAccountMatch) {
      serviceAccountJson = serviceAccountMatch[1].trim();
    }
    if (databaseUrlMatch) {
      databaseUrl = databaseUrlMatch[1].trim().replace(/\/$/, "");
    }
  }

  if (!serviceAccountJson || !databaseUrl) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_DATABASE_URL environment variables.",
    );
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);
    return { serviceAccount, databaseUrl };
  } catch (error: any) {
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${error.message}`, { cause: error });
  }
}

// Generate signed JWT for Google OAuth2
function signJwt(payload: object, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${base64Header}.${base64Payload}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(token);
  const signature = sign.sign(privateKey, "base64url");
  return `${token}.${signature}`;
}

// Request Google Access Token using Service Account JWT
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.database",
    aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const jwt = signJwt(payload, serviceAccount.private_key);

  const res = await fetch(payload.aud, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OAuth token exchange failed: ${res.status} - ${errText}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// Process tags object to tags array
function formatTags(tags: Post["tags"]): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === "object") {
    return Object.entries(tags)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  }
  return [];
}

async function run() {
  console.log("[Fetch Posts] Starting blog posts fetch sequence...");
  try {
    const { serviceAccount, databaseUrl } = getCredentials();
    console.log(`[Fetch Posts] Connecting to project: ${serviceAccount.project_id}`);

    const accessToken = await getAccessToken(serviceAccount);
    console.log("[Fetch Posts] OAuth access token acquired.");

    console.log(`[Fetch Posts] Pulling posts from ${databaseUrl}/posts.json`);
    const response = await fetch(`${databaseUrl}/posts.json`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Database HTTP error: ${response.status} - ${await response.text()}`);
    }

    const rawPosts = (await response.json()) as Record<string, Post> | null;
    if (!rawPosts) {
      console.log("[Fetch Posts] No blog posts found in database.");
      // Create empty placeholder outputs to avoid breaking the build
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      if (!fs.existsSync(POSTS_DETAIL_DIR)) fs.mkdirSync(POSTS_DETAIL_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(OUTPUT_DIR, "posts-index.json"),
        JSON.stringify([], null, 2),
        "utf-8",
      );
      return;
    }

    // Convert and sort posts descending by createdAt
    const postsList: Post[] = Object.values(rawPosts).filter((p) => p && p.uuid);
    postsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`[Fetch Posts] Successfully loaded ${postsList.length} posts.`);

    // Ensure output directories exist
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(POSTS_DETAIL_DIR)) fs.mkdirSync(POSTS_DETAIL_DIR, { recursive: true });

    // Write index file (excluding heavy fields like content or embedding)
    const indexData: PostIndexItem[] = postsList.map((post) => ({
      uuid: post.uuid,
      title: post.title,
      summary: post.summary || "",
      createdAt: post.createdAt,
      tags: formatTags(post.tags),
    }));

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "posts-index.json"),
      JSON.stringify(indexData, null, 2),
      "utf-8",
    );
    console.log(`[Fetch Posts] Saved posts index to ${path.join(OUTPUT_DIR, "posts-index.json")}`);

    // Write individual post detail files
    for (const post of postsList) {
      const detailPath = path.join(POSTS_DETAIL_DIR, `${post.uuid}.json`);
      const detailData = {
        uuid: post.uuid,
        title: post.title,
        summary: post.summary || "",
        content: post.content || "",
        createdAt: post.createdAt,
        tags: formatTags(post.tags),
      };
      fs.writeFileSync(detailPath, JSON.stringify(detailData, null, 2), "utf-8");
    }
    console.log(
      `[Fetch Posts] Saved ${postsList.length} individual post detail files to ${POSTS_DETAIL_DIR}/`,
    );
    console.log("[Fetch Posts] Done successfully!");
  } catch (error: any) {
    console.error("[Fetch Posts] Script execution failed:", error.message);
    process.exit(1);
  }
}

run();
