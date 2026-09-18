import express from "express";
import path from "path";
import cors from "cors";
import { Pool } from "pg";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import https from "https";
import dotenv from "dotenv";
// Priorité comme Vite : .env.local puis .env (sans écraser l'existant)
dotenv.config({ path: '.env.local' });
dotenv.config();

// ── Configuration (100% via variables d'environnement — aucun secret en dur) ──
const DJOMY_API_URL       = process.env.DJOMY_API_URL       || 'https://api.djomy.africa';
const DJOMY_CLIENT_ID     = process.env.DJOMY_CLIENT_ID     || '';
const DJOMY_CLIENT_SECRET = process.env.DJOMY_CLIENT_SECRET || '';
const DJOMY_PARTNER_DOMAIN= process.env.DJOMY_PARTNER_DOMAIN|| '';
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD   || 'admin123';

/** Djomy est-il configuré ? (sinon : endpoints de paiement désactivés proprement) */
function djomyConfigured(): boolean {
  return Boolean(DJOMY_CLIENT_ID && DJOMY_CLIENT_SECRET);
}

// ── PostgreSQL (Neon) ────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL manquante. Configurez-la dans .env.local (voir .env.example).");
  process.exit(1);
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon exige du TLS :
  // - sslmode présent dans l'URL → node-pg l'interprète lui-même (recommandé)
  // - pas de sslmode → on active SSL explicitement
  ssl: /sslmode=disable/.test(process.env.DATABASE_URL)
    ? false
    : /sslmode=/.test(process.env.DATABASE_URL)
      ? undefined
      : { rejectUnauthorized: false },
});

// Wrapper mimant l'ancienne API sqlite (all / get / run)
const db = {
  async all(sql: string, params: any[] = []): Promise<any[]> {
    return (await pool.query(sql, params)).rows;
  },
  async get(sql: string, params: any[] = []): Promise<any | undefined> {
    return (await pool.query(sql, params)).rows[0];
  },
  async run(sql: string, params: any[] = []): Promise<void> {
    await pool.query(sql, params);
  },
};

// ── Djomy Payment — Helpers ──────────────────────────────────────
/** HMAC-SHA256 hex digest */
function djomyHmac(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/** X-API-KEY header value */
function djomyApiKeyHeader(): string {
  return `${DJOMY_CLIENT_ID}:${djomyHmac(DJOMY_CLIENT_ID, DJOMY_CLIENT_SECRET)}`;
}

/** In-process Bearer token cache (reset on each server restart) */
let _djomyToken: string | null = null;
let _djomyTokenExpiry = 0;

async function djomyGetToken(): Promise<string> {
  if (_djomyToken && Date.now() < _djomyTokenExpiry) return _djomyToken;

  const res = await djomyRequest('POST', '/v1/auth', null as any);
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Djomy auth failed (HTTP ${res.status}): ${JSON.stringify(res.body)}`);
  }
  const token = res.body?.data?.accessToken || res.body?.accessToken || '';
  if (!token) throw new Error('Djomy auth: token vide');
  _djomyToken = token;
  _djomyTokenExpiry = Date.now() + 25 * 60 * 1000; // 25 min cache
  return token;
}

/** Generic HTTP client for Djomy API */
function djomyRequest(
  method: 'GET' | 'POST',
  urlPath: string,
  payload: object | null,
  withAuth = false
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const bodyStr = (method === 'POST' && payload) ? JSON.stringify(payload) : '';
    const headers: Record<string, string> = {
      'Content-Type':  'application/json',
      'X-API-KEY':     djomyApiKeyHeader(),
      'X-PARTNER-DOMAIN': DJOMY_PARTNER_DOMAIN,
    };
    if (withAuth && _djomyToken) headers['Authorization'] = `Bearer ${_djomyToken}`;

    if (method === 'POST') {
      headers['Content-Length'] = bodyStr ? Buffer.byteLength(bodyStr).toString() : '0';
    }

    const url = new URL(DJOMY_API_URL + urlPath);
    const options: https.RequestOptions = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        try { resolve({ status: res.statusCode || 0, body: JSON.parse(data) }); }
        catch   { resolve({ status: res.statusCode || 0, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Djomy timeout')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

/** Djomy request with Bearer auth (auto-fetches token) */
async function djomyAuthRequest(
  method: 'GET' | 'POST',
  urlPath: string,
  payload: object = {}
): Promise<{ status: number; body: any }> {
  await djomyGetToken();
  return djomyRequest(method, urlPath, payload, true);
}

// ── Uploads (multer) ─────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const ALLOWED_UPLOAD_EXT = /\.(mp4|mov|mp3|pdf|jpg|jpeg|png|webp|gif|zip)$/i;

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_UPLOAD_EXT.test(file.originalname)) cb(null, true);
    else cb(new Error('Type de fichier non autorisé'));
  },
});

// Helper: generate a short unique access token
function genToken(): string {
  return crypto.randomBytes(20).toString('hex');
}

// ── Sessions admin (tokens en mémoire, valables 7 jours) ─────────
const adminSessions = new Map<string, number>(); // token -> expiration (ms)
const ADMIN_SESSION_TTL = 7 * 24 * 3600 * 1000;

function issueAdminToken(): { token: string; expires_at: string } {
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + ADMIN_SESSION_TTL;
  adminSessions.set(token, expiresAt);
  return { token, expires_at: new Date(expiresAt).toISOString() };
}

function getBearer(req: express.Request): string {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

function isAdminRequest(req: express.Request): boolean {
  const t = getBearer(req);
  if (!t) return false;
  const exp = adminSessions.get(t);
  if (!exp) return false;
  if (Date.now() > exp) { adminSessions.delete(t); return false; }
  return true;
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (isAdminRequest(req)) return next();
  return res.status(401).json({ error: 'Authentification admin requise' });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(uploadDir));

  // ── Database : vérification de connexion ─────────────────
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connecté');
  } catch (e: any) {
    console.error('❌ Connexion PostgreSQL impossible :', e.message);
    process.exit(1);
  }

  // ── Schéma (idempotent) ──────────────────────────────────
  await db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price TEXT DEFAULT '0 FCFA',
      type TEXT DEFAULT 'native',
      status TEXT DEFAULT 'draft',
      category TEXT DEFAULT 'Général',
      image_url TEXT,
      external_link TEXT,
      has_certificate TEXT DEFAULT 'Aucun',
      objectives TEXT,
      prerequisites TEXT,
      duration TEXT,
      format TEXT DEFAULT 'en ligne',
      visits INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'video',
      duration TEXT DEFAULT '0 min',
      is_free INTEGER DEFAULT 0,
      content TEXT,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      role TEXT DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      user_id TEXT,
      status TEXT DEFAULT 'prospect',
      price TEXT,
      access_token TEXT UNIQUE,
      djomy_transaction_id TEXT,
      djomy_payment_url TEXT,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      course_id TEXT,
      ip TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_enrollments_token ON enrollments(access_token);
    CREATE INDEX IF NOT EXISTS idx_enrollments_tx    ON enrollments(djomy_transaction_id);
    CREATE INDEX IF NOT EXISTS idx_modules_course    ON modules(course_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_module    ON lessons(module_id);
  `);

  // Generate tokens for existing enrollments that don't have one
  const noToken = await db.all(`SELECT id FROM enrollments WHERE access_token IS NULL OR access_token = ''`);
  for (const e of noToken) {
    await db.run(`UPDATE enrollments SET access_token = $1 WHERE id = $2`, [genToken(), e.id]);
  }

  // Seed demo data if empty
  const coursesCount = await db.get("SELECT COUNT(*)::int as c FROM courses");
  if (Number(coursesCount?.c) === 0) {
    const courseId = "c_1";
    await db.run(
      "INSERT INTO courses (id, title, description, price, type, status, category, visits, likes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [courseId, 'Maîtriser React 2026', 'De zéro à expert sur React et son écosystème moderne.', '199 FCFA', 'native', 'published', 'Développement Web', 0, 0]
    );
    await db.run("INSERT INTO modules (id, course_id, title, description, order_index) VALUES ($1, $2, $3, $4, $5)",
      ['m_1', courseId, 'Bases de React', 'Comprendre les fondamentaux.', 0]);
    await db.run("INSERT INTO lessons (id, module_id, title, description, type, duration, is_free, content, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      ['l_1', 'm_1', 'Introduction', 'Bienvenue dans ce cours', 'video', '05:00', 1, '', 0]);

    const accessToken = genToken();
    await db.run("INSERT INTO users (id, name, email, phone) VALUES ($1, $2, $3, $4)",
      ["u_1", "Apprenant Démo", "demo@example.com", "+224 000 00 00 00"]);
    await db.run("INSERT INTO enrollments (id, course_id, user_id, status, price, access_token) VALUES ($1, $2, $3, $4, $5, $6)",
      ["e_1", "c_1", "u_1", "paid", "199 FCFA", accessToken]);
    console.log('🌱 Données de démonstration créées');
  }

  // ── Health ────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  // ── Admin Login ──
  app.post("/api/admin_login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "Identifiant et mot de passe requis" });

      const storedPassRow = await db.get("SELECT value FROM settings WHERE key='admin_password'");
      const storedPass = storedPassRow ? storedPassRow.value : ADMIN_DEFAULT_PASSWORD;

      if (username === 'admin' && password === storedPass) {
         res.json({ ...issueAdminToken(), username: "admin" });
      } else {
         res.status(401).json({ error: "Identifiants incorrects" });
      }
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ── Upload ────────────────────────────────────────────────
  app.post("/api/upload", requireAdmin, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // ── Stats ─────────────────────────────────────────────────
  // Helper : clause WHERE selon le filtre temporel
  function timeframeClause(tf: string, col = 'joined_at'): string {
    const map: Record<string, string> = {
      '24h': `AND ${col} >= NOW() - INTERVAL '1 day'`,
      '7j':  `AND ${col} >= NOW() - INTERVAL '7 days'`,
      '30j': `AND ${col} >= NOW() - INTERVAL '30 days'`,
      '90j': `AND ${col} >= NOW() - INTERVAL '90 days'`,
    };
    return map[tf] || '';
  }

  app.get("/api/stats", requireAdmin, async (req, res) => {
    try {
      const endpoint  = (req.query.endpoint  as string) || 'kpis';
      const timeframe = (req.query.timeframe as string) || 'Tous';
      const tf        = timeframeClause(timeframe);
      const tfLogs    = timeframeClause(timeframe, 'timestamp');

      // ── Graphique ──────────────────────────────────────────
      if (endpoint === 'chart') {
        const enrollments = await db.all(
          `SELECT to_char(joined_at, 'YYYY-MM-DD') as day, price, status FROM enrollments WHERE 1=1 ${tf} ORDER BY joined_at ASC`
        );
        const accessLogs = await db.all(
          `SELECT to_char(timestamp, 'YYYY-MM-DD') as day, COUNT(*)::int as cnt FROM access_logs WHERE 1=1 ${tfLogs} GROUP BY 1`
        );

        const dataMap: Record<string, any> = {};
        enrollments.forEach((e: any) => {
          const date = e.day || 'Inconnu';
          if (!dataMap[date]) dataMap[date] = { name: date, revenue: 0, prospects: 0, visitors: 0 };
          if (e.status === 'paid') {
            dataMap[date].revenue += parseInt((e.price || '0').replace(/[^0-9]/g, '')) || 0;
          } else {
            dataMap[date].prospects += 1;
          }
        });
        // Ajouter les visites (access_logs)
        accessLogs.forEach((log: any) => {
          if (!dataMap[log.day]) dataMap[log.day] = { name: log.day, revenue: 0, prospects: 0, visitors: 0 };
          dataMap[log.day].visitors += log.cnt;
        });

        const data = Object.values(dataMap).sort((a: any, b: any) => a.name.localeCompare(b.name));
        return res.json(data.length ? data : [{ name: new Date().toISOString().split('T')[0], revenue: 0, prospects: 0, visitors: 0 }]);
      }

      // ── Top formations ─────────────────────────────────────
      if (endpoint === 'top') {
        const top = await db.all("SELECT title, visits FROM courses ORDER BY visits DESC LIMIT 5");
        return res.json(top);
      }

      // ── KPIs (défaut) ──────────────────────────────────────
      const paidCount     = await db.get(`SELECT COUNT(*)::int as c FROM enrollments WHERE status='paid' ${tf}`);
      const prospectCount = await db.get(`SELECT COUNT(*)::int as c FROM enrollments WHERE status='prospect' ${tf}`);
      const visitsRow     = await db.get(`SELECT SUM(cnt)::int as c FROM (SELECT COUNT(*) as cnt FROM access_logs WHERE 1=1 ${tfLogs}) t`);
      const allPaid       = await db.all(`SELECT price FROM enrollments WHERE status='paid' ${tf}`);
      const totalRevenue  = allPaid.reduce((acc: number, e: any) => {
        return acc + (parseInt((e.price || '0').replace(/[^0-9]/g, '')) || 0);
      }, 0);

      res.json({
        totalRevenue:   totalRevenue.toLocaleString('fr-FR') + ' FCFA',
        paidStudents:   Number(paidCount?.c)  || 0,
        prospects:      Number(prospectCount?.c) || 0,
        uniqueVisitors: Number(visitsRow?.c)  || 0,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Courses ───────────────────────────────────────────────
  app.get("/api/courses", async (req, res) => {
    try {
      // L'admin voit tous les cours, le public uniquement les publiés
      const isAdmin = isAdminRequest(req);
      const sql = isAdmin
        ? "SELECT * FROM courses ORDER BY created_at DESC"
        : "SELECT * FROM courses WHERE status='published' ORDER BY created_at DESC";
      const rows = await db.all(sql);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/courses", requireAdmin, async (req, res) => {
    try {
      const { id, title, description, price, type, status, category, image_url, external_link, has_certificate, objectives, prerequisites, duration, format } = req.body;
      await db.run(
        "INSERT INTO courses (id, title, description, price, type, status, category, image_url, external_link, has_certificate, objectives, prerequisites, duration, format) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
        [id, title || 'Sans titre', description || '', price || '0 FCFA', type || 'native', status || 'draft', category || 'Général', image_url || null, external_link || null, has_certificate || 'Aucun', objectives || '', prerequisites || '', duration || '', format || 'en ligne']
      );
      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/courses/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, price, type, status, category, image_url, external_link, has_certificate, objectives, prerequisites, duration, format } = req.body;
      await db.run(
        "UPDATE courses SET title=$1, description=$2, price=$3, type=$4, status=$5, category=$6, image_url=$7, external_link=$8, has_certificate=$9, objectives=$10, prerequisites=$11, duration=$12, format=$13 WHERE id=$14",
        [title, description, price, type, status, category, image_url || null, external_link || null, has_certificate || 'Aucun', objectives || '', prerequisites || '', duration || '', format || 'en ligne', req.params.id]
      );
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/courses/:id", requireAdmin, async (req, res) => {
    try {
      await db.run("DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id=$1)", [req.params.id]);
      await db.run("DELETE FROM modules WHERE course_id=$1", [req.params.id]);
      await db.run("DELETE FROM enrollments WHERE course_id=$1", [req.params.id]);
      await db.run("DELETE FROM courses WHERE id=$1", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await db.get("SELECT * FROM courses WHERE id=$1", [req.params.id]);
      if (!course) return res.status(404).json({ error: "Formation introuvable" });

      // Compter la visite si accès public (pas admin) et logger pour les stats
      if (!isAdminRequest(req)) {
        await db.run("UPDATE courses SET visits = visits + 1 WHERE id=$1", [req.params.id]);
        await db.run("INSERT INTO access_logs (course_id, ip) VALUES ($1, $2)",
          [req.params.id, req.ip || 'unknown']);
        course.visits = Number(course.visits) + 1;
      }

      const modules  = await db.all("SELECT * FROM modules WHERE course_id=$1 ORDER BY order_index ASC", [req.params.id]);
      const lessons  = await db.all(
        `SELECT lessons.* FROM lessons
         JOIN modules ON lessons.module_id = modules.id
         WHERE modules.course_id=$1 ORDER BY lessons.order_index ASC`,
        [req.params.id]
      );
      const paid     = await db.get("SELECT COUNT(*)::int as c FROM enrollments WHERE course_id=$1 AND status='paid'",    [req.params.id]);
      const prospect = await db.get("SELECT COUNT(*)::int as c FROM enrollments WHERE course_id=$1 AND status='prospect'", [req.params.id]);
      const allPaidRows = await db.all("SELECT price FROM enrollments WHERE course_id=$1 AND status='paid'", [req.params.id]);
      const totalRev = (allPaidRows as any[]).reduce((acc: number, e: any) =>
        acc + (parseInt((e.price || '0').replace(/[^0-9]/g, '')) || 0), 0);

      const curriculum = (modules as any[]).map((m: any) => ({
        ...m,
        lessons: (lessons as any[]).filter((l: any) => l.module_id === m.id)
      }));

      res.json({
        ...course,
        curriculum,
        paidSignups: Number((paid as any)?.c) || 0,
        freeSignups: Number((prospect as any)?.c) || 0,
        revenue:    totalRev.toLocaleString('fr-FR') + ' FCFA'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Modules ───────────────────────────────────────────────
  app.get("/api/modules", async (req, res) => {
    try {
      const courseId = req.query.course_id as string;
      if (!courseId) return res.status(400).json({ error: 'course_id requis' });
      const rows = await db.all("SELECT * FROM modules WHERE course_id=$1 ORDER BY order_index ASC", [courseId]);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/modules", requireAdmin, async (req, res) => {
    try {
      const { id, course_id, title, description, order_index } = req.body;
      if (!course_id) return res.status(400).json({ error: 'course_id est requis' });
      const moduleId = id || 'm_' + Date.now();
      await db.run(
        "INSERT INTO modules (id, course_id, title, description, order_index) VALUES ($1, $2, $3, $4, $5)",
        [moduleId, course_id, title || 'Nouveau module', description || '', order_index ?? 0]
      );
      res.json({ success: true, id: moduleId });
    } catch (e: any) {
      console.error('[POST /api/modules]', e);
      res.status(500).json({ error: e.message || 'Erreur lors de la création du module' });
    }
  });

  app.put("/api/modules/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description } = req.body;
      await db.run("UPDATE modules SET title=$1, description=$2 WHERE id=$3",
        [title || '', description || '', req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/modules/:id", requireAdmin, async (req, res) => {
    try {
      await db.run("DELETE FROM lessons WHERE module_id=$1", [req.params.id]);
      await db.run("DELETE FROM modules WHERE id=$1", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Lessons ───────────────────────────────────────────────
  app.post("/api/lessons", requireAdmin, async (req, res) => {
    try {
      const { id, module_id, title, description, type, duration, is_free, content, order_index } = req.body;
      if (!module_id) return res.status(400).json({ error: 'module_id est requis' });
      const lessonId = id || 'l_' + Date.now();
      await db.run(
        "INSERT INTO lessons (id, module_id, title, description, type, duration, is_free, content, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [lessonId, module_id, title || 'Nouvelle leçon', description || '',
         type || 'video', duration || '0 min', is_free ? 1 : 0, content || '', order_index ?? 0]
      );
      res.json({ success: true, id: lessonId });
    } catch (e: any) {
      console.error('[POST /api/lessons]', e);
      res.status(500).json({ error: e.message || 'Erreur lors de la création de la leçon' });
    }
  });

  app.put("/api/lessons/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, type, duration, is_free, content } = req.body;
      await db.run(
        "UPDATE lessons SET title=$1, description=$2, type=$3, duration=$4, is_free=$5, content=$6 WHERE id=$7",
        [title || '', description || '', type || 'video', duration || '0 min',
         is_free ? 1 : 0, content || '', req.params.id]
      );
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/lessons/:id", requireAdmin, async (req, res) => {
    try {
      await db.run("DELETE FROM lessons WHERE id=$1", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Enrollment ────────────────────────────────────────────
  app.post("/api/enroll", async (req, res) => {
    try {
      const { name, phone, course_id, price, status, email } = req.body;
      if (!name || !phone || !course_id) {
        return res.status(400).json({ error: 'Nom, téléphone et formation requis' });
      }

      const enrollStatus = ['paid', 'prospect'].includes(status) ? status : 'prospect';

      // Chercher l'utilisateur par téléphone
      let user = await db.get("SELECT * FROM users WHERE phone=$1", [phone]);
      if (!user) {
        const userId = "u_" + Date.now();
        const userEmail = email || `${phone}@wa.me`;
        await db.run("INSERT INTO users (id, name, email, phone) VALUES ($1, $2, $3, $4)", [userId, name, userEmail, phone]);
        user = { id: userId, name, phone, email: userEmail };
      }

      // Vérifier si déjà inscrit et payant
      const existing = await db.get(
        "SELECT id, status, access_token FROM enrollments WHERE user_id=$1 AND course_id=$2",
        [user.id, course_id]
      );
      if (existing && (existing as any).status === 'paid') {
        const host = req.get('host') || `localhost:${PORT}`;
        const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const accessUrl = `${proto}://${host}/access/${(existing as any).access_token}`;
        return res.json({
          success: true,
          already_paid: true,
          access_token: (existing as any).access_token,
          access_url: accessUrl,
          message: 'Vous êtes déjà inscrit à cette formation.'
        });
      }

      const enrollmentId = "e_" + Date.now();
      const accessToken  = enrollStatus === 'paid' ? genToken() : null;

      await db.run(
        "INSERT INTO enrollments (id, course_id, user_id, status, price, access_token) VALUES ($1, $2, $3, $4, $5, $6)",
        [enrollmentId, course_id, user.id, enrollStatus, price || '0 FCFA', accessToken]
      );

      // Construire l'URL d'accès avec le bon domaine
      const host   = req.get('host') || `localhost:${PORT}`;
      const proto  = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
      const access_url = accessToken ? `${proto}://${host}/access/${accessToken}` : null;

      const response: any = {
        success: true,
        enrollment_id: enrollmentId,
        status: enrollStatus,
      };
      if (enrollStatus === 'paid') {
        response.access_token = accessToken;
        response.access_url   = access_url;
        response.message = '✅ Inscription réussie ! Copiez votre lien d\'accès maintenant — il ne sera plus affiché.';
      } else {
        response.message = 'Pré-inscription enregistrée. Le formateur vous contactera sur WhatsApp.';
      }

      res.json(response);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Students CRM (grouped by user) ───────────────────────
  app.post("/api/validate_payment", requireAdmin, async (req, res) => {
    try {
      const { enrollment_id } = req.body;
      if (!enrollment_id) return res.status(400).json({ error: "L'ID de l'inscription est requis" });

      let enrollment = await db.get("SELECT id, status, access_token FROM enrollments WHERE id=$1", [enrollment_id]);
      if (!enrollment) return res.status(404).json({ error: 'Inscription introuvable' });

      let accessToken = enrollment.access_token;
      if (enrollment.status !== 'paid') {
        if (!accessToken) accessToken = genToken();
        await db.run("UPDATE enrollments SET status='paid', access_token=$1 WHERE id=$2", [accessToken, enrollment_id]);
      }

      const host = req.get('host') || `localhost:${PORT}`;
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';

      res.json({
        success: true,
        status: 'paid',
        access_token: accessToken,
        access_url: `${proto}://${host}/access/${accessToken}`,
        message: 'Paiement validé manuellement avec succès.'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/students", requireAdmin, async (req, res) => {
    try {
      // CSV export
      if (req.query.export === 'csv') {
        const rows = await db.all(`
          SELECT u.name, u.phone,
                 to_char(u.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
                 e.status, e.price, c.title as course_title,
                 to_char(e.joined_at, 'YYYY-MM-DD HH24:MI:SS') as joined_at, e.access_token
          FROM users u
          JOIN enrollments e ON u.id = e.user_id
          JOIN courses c ON e.course_id = c.id
          ORDER BY e.joined_at DESC
        `);
        const origin = req.headers.origin || `http://localhost:${PORT}`;
        const header = 'Nom,Téléphone,Formation,Statut,Prix,Date inscription,Lien accès\n';
        const csvRows = rows.map((r: any) => {
          const accessUrl = r.access_token ? `${origin}/access/${r.access_token}` : '';
          return `"${r.name}","${r.phone}","${r.course_title}","${r.status}","${r.price}","${r.joined_at}","${accessUrl}"`;
        });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="apprenants.csv"');
        return res.send('\uFEFF' + header + csvRows.join('\n')); // BOM for Excel
      }

      // Normal CRM response — grouped by user
      const rows = await db.all(`
        SELECT u.id as user_id, u.name, u.phone,
               to_char(u.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
               e.id as enrollment_id, e.course_id, c.title as course_title,
               e.status, e.price,
               to_char(e.joined_at, 'YYYY-MM-DD HH24:MI:SS') as joined_at, e.access_token
        FROM users u
        JOIN enrollments e ON u.id = e.user_id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.joined_at DESC
      `);

      // Group by user
      const usersMap: Record<string, any> = {};
      const origin = req.headers.origin || `http://localhost:${PORT}`;

      for (const row of rows as any[]) {
        if (!usersMap[row.user_id]) {
          usersMap[row.user_id] = {
            id: row.user_id,
            name: row.name,
            phone: row.phone,
            created_at: row.created_at,
            status: row.status,
            total_spent: 0,
            courses_count: 0,
            enrollments: []
          };
        }
        const u = usersMap[row.user_id];
        const accessUrl = row.access_token ? `${origin}/access/${row.access_token}` : null;
        u.enrollments.push({
          course_id: row.course_id,
          course_title: row.course_title,
          status: row.status,
          price: row.price,
          joined_at: row.joined_at,
          access_token: row.access_token,
          access_url: accessUrl
        });
        // Update aggregates
        if (row.status === 'paid') {
          u.total_spent += parseInt((row.price || '0').replace(/[^0-9]/g, '')) || 0;
          if (u.status !== 'paid') u.status = 'paid';
        }
        u.courses_count += 1;
      }

      const students = Object.values(usersMap).map((u: any) => ({
        ...u,
        total_spent: u.total_spent.toLocaleString('fr-FR') + ' FCFA'
      }));

      res.json(students);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Students by course — supporte ?course_id= ET /by-course/:id
  app.get("/api/students/by-course/:courseId", requireAdmin, async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const rows = await db.all(`
        SELECT u.name, u.phone, e.status, e.price, e.access_token,
               to_char(e.joined_at, 'YYYY-MM-DD HH24:MI:SS') as joined_at, e.id as enrollment_id
        FROM users u
        JOIN enrollments e ON u.id = e.user_id
        WHERE e.course_id = $1
        ORDER BY e.joined_at DESC
      `, [courseId]);
      const host  = req.get('host') || `localhost:${PORT}`;
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
      const result = (rows as any[]).map(r => ({
        ...r,
        access_url: r.access_token ? `${proto}://${host}/access/${r.access_token}` : null
      }));
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Access content (for learners) ─────────────────────────
  app.get("/api/access", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).json({ error: "Token requis" });

      const enrollment = await db.get(
        `SELECT e.id, e.course_id, e.user_id, e.status, e.price, e.access_token,
                to_char(e.joined_at, 'YYYY-MM-DD HH24:MI:SS') as joined_at,
                c.title as course_title, c.description as course_description,
                c.type as course_type, c.category as course_category,
                c.image_url as course_image_url, c.external_link as course_external_link,
                u.name as student_name
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         JOIN users u ON e.user_id = u.id
         WHERE e.access_token = $1`,
        [token]
      );

      if (!enrollment) return res.status(404).json({ error: "Lien d'acc\u00e8s invalide ou expir\u00e9" });

      const modules = await db.all(
        "SELECT * FROM modules WHERE course_id=$1 ORDER BY order_index",
        [enrollment.course_id]
      );
      const lessons = await db.all(
        `SELECT lessons.* FROM lessons
         JOIN modules ON lessons.module_id = modules.id
         WHERE modules.course_id=$1 ORDER BY lessons.order_index`,
        [enrollment.course_id]
      );
      const curriculum = (modules as any[]).map((m: any) => ({
        ...m,
        lessons: (lessons as any[]).filter((l: any) => l.module_id === m.id)
      }));

      res.json({
        student_name: enrollment.student_name,
        enrolled_at: enrollment.joined_at,
        course: {
          id: enrollment.course_id,
          title: enrollment.course_title,
          description: enrollment.course_description,
          type: enrollment.course_type,
          category: enrollment.course_category,
          image_url: enrollment.course_image_url || '',
          external_link: enrollment.status === 'paid' ? (enrollment.course_external_link || '') : ''
        },
        curriculum
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Settings ──────────────────────────────────────────────
  app.get("/api/settings", async (_req, res) => {
    try {
      // Ne jamais exposer le mot de passe admin
      const rows = await db.all("SELECT key, value FROM settings WHERE key NOT IN ('admin_password')");
      const settings: Record<string, string> = {};
      for (const r of rows as any[]) settings[r.key] = r.value;
      res.json(settings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/settings", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body } as Record<string, string>;

      if (data.currentPassword && data.newPassword) {
        const storedPassRow = await db.get("SELECT value FROM settings WHERE key='admin_password'");
        const storedPass = storedPassRow ? storedPassRow.value : ADMIN_DEFAULT_PASSWORD;
        if (data.currentPassword !== storedPass) {
          return res.status(400).json({ error: "Le mot de passe actuel est incorrect." });
        }
        await db.run(
          "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
          ['admin_password', data.newPassword]
        );
      }
      // Ne jamais persister ces clés techniques
      delete data.currentPassword;
      delete data.newPassword;

      for (const [key, value] of Object.entries(data)) {
        await db.run(
          "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
          [key, value]
        );
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Djomy Payment — Init — POST /api/payment/init ─────────
  app.post("/api/payment/init", async (req, res) => {
    try {
      // Paiement débranché tant que les clés ne sont pas configurées
      if (!djomyConfigured()) {
        return res.status(503).json({
          error: 'Paiement non configuré sur cette plateforme (DJOMY_CLIENT_ID / DJOMY_CLIENT_SECRET manquants).'
        });
      }

      const { name, phone, course_id, country_code = 'GN', email } = req.body;
      if (!name || !phone || !course_id) {
        return res.status(400).json({ error: 'Nom, téléphone et formation requis.' });
      }

      // Valider countryCode
      const cc = /^[A-Z]{2,3}$/.test((country_code||'').toUpperCase())
        ? (country_code as string).toUpperCase() : 'GN';

      // Récupérer le cours
      const course = await db.get("SELECT id, title, price, status FROM courses WHERE id=$1", [course_id]);
      if (!course) return res.status(404).json({ error: 'Formation introuvable.' });
      if (course.status !== 'published') return res.status(403).json({ error: 'Formation non disponible.' });

      let cleanPhone = phone.replace(/^(\+|00)/, '').replace(/\s+/g, '');

      // Parser le montant et convertir selon le pays
      const rawPrice = (course.price || '0 FCFA').toUpperCase();
      const priceMatch = rawPrice.replace(/[\s\.,]/g, '').match(/\d+/);
      const baseAmount = priceMatch ? parseInt(priceMatch[0]) : 0;

      let baseCurrency = 'XOF';
      if (rawPrice.includes('GNF')) baseCurrency = 'GNF';
      else if (rawPrice.includes('EUR') || rawPrice.includes('€')) baseCurrency = 'EUR';
      else if (rawPrice.includes('USD') || rawPrice.includes('$')) baseCurrency = 'USD';

      const rates: Record<string, number> = {
        'EUR': 1,
        'XOF': 655.957,
        'USD': 1.08,
        'GNF': 9300
      };

      const targetCurrency = cc === 'GN' ? 'GNF' : 'XOF';
      const amountInEur = baseAmount / rates[baseCurrency];
      const amount = Math.round(amountInEur * rates[targetCurrency]);

      // Créer / récupérer l'utilisateur
      let user = await db.get("SELECT * FROM users WHERE phone=$1", [cleanPhone]);
      if (!user) {
        const uid = 'u_' + Date.now();
        const userEmail = email || `${cleanPhone}@wa.me`;
        await db.run("INSERT INTO users (id, name, email, phone) VALUES ($1, $2, $3, $4)",
          [uid, name, userEmail, cleanPhone]);
        user = { id: uid, name, phone: cleanPhone };
      }

      // Déjà inscrit et payé ?
      const existing = await db.get(
        "SELECT id, access_token FROM enrollments WHERE user_id=$1 AND course_id=$2 AND status='paid'",
        [user.id, course_id]
      );
      if (existing) {
        const host  = req.get('host') || `localhost:${PORT}`;
        const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
        return res.json({
          success: true, already_paid: true,
          access_token: existing.access_token,
          access_url:   `${proto}://${host}/access/${existing.access_token}`,
          message:      'Vous êtes déjà inscrit à cette formation.',
        });
      }

      // Formation gratuite → inscription directe
      if (amount <= 0) {
        const enrollId   = 'e_' + Date.now();
        const accessToken = genToken();
        const host   = req.get('host') || `localhost:${PORT}`;
        const proto  = (req.headers['x-forwarded-proto'] as string) || 'http';
        await db.run(
          "DELETE FROM enrollments WHERE user_id=$1 AND course_id=$2 AND status='pending'",
          [user.id, course_id]
        );
        await db.run(
          "INSERT INTO enrollments (id, course_id, user_id, status, price, access_token) VALUES ($1, $2, $3, 'paid', $4, $5)",
          [enrollId, course_id, user.id, rawPrice, accessToken]
        );
        return res.json({
          success: true, free: true,
          access_token: accessToken,
          access_url:   `${proto}://${host}/access/${accessToken}`,
          message:      '✅ Inscription gratuite confirmée !',
        });
      }

      // 3. Vérifier s'il y a déjà un enrollment 'pending' pour ce couple user/course
      const pending = await db.get(
        "SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2 AND status='pending'",
        [user.id, course_id]
      );

      let enrollId = '';
      if (pending) {
        enrollId = pending.id;
        await db.run("UPDATE enrollments SET price=$1 WHERE id=$2", [rawPrice, enrollId]);
      } else {
        enrollId = 'e_' + Date.now();
        await db.run(
          "INSERT INTO enrollments (id, course_id, user_id, status, price) VALUES ($1, $2, $3, 'pending', $4)",
          [enrollId, course_id, user.id, rawPrice]
        );
      }

      // Appeler Djomy
      const host  = req.get('host') || `localhost:${PORT}`;
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
      const base  = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `${proto}://${host}`;
      const returnUrl = `${base}/payment/return?ref=${enrollId}`;
      const cancelUrl = `${base}/payment/cancel`;

      let djomyResp: { status: number; body: any };
      try {
        djomyResp = await djomyAuthRequest('POST', '/v1/payments/gateway', {
          amount,
          countryCode: cc,
          currencyCode: targetCurrency,
          payerNumber: cleanPhone,
          description:              `Inscription formation : ${course.title}`,
          merchantPaymentReference:  enrollId,
          returnUrl, cancelUrl
        });
      } catch (err: any) {
        return res.status(503).json({ error: 'Passerelle de paiement injoignable : ' + err.message });
      }

      if (djomyResp.status !== 201 && djomyResp.status !== 200) {
        const msg = djomyResp.body?.message || `Djomy HTTP ${djomyResp.status}`;
        return res.status(502).json({ error: 'Passerelle de paiement : ' + msg });
      }

      let transactionId   = djomyResp.body?.data?.transactionId   || djomyResp.body?.transactionId   || '';
      transactionId       = transactionId.split(':')[0]; // Remove Djomy suffix (e.g. :1)
      const djomyPaymentUrl = djomyResp.body?.data?.redirectUrl     || djomyResp.body?.redirectUrl     || '';

      await db.run(
        "UPDATE enrollments SET djomy_transaction_id=$1, djomy_payment_url=$2 WHERE id=$3",
        [transactionId, djomyPaymentUrl, enrollId]
      );

      return res.json({
        success: true, enrollment_id: enrollId,
        transaction_id: transactionId,
        redirect_url:   djomyPaymentUrl,
        message:        'Redirection vers le portail de paiement.',
      });
    } catch (e: any) {
      console.error('[POST /api/payment/init]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Djomy Payment — Status — GET /api/payment/status ──────
  app.get('/api/payment/status', async (req, res) => {
    try {
      let transactionId = (req.query.transactionId as string) || (req.query.ref as string) || '';
      transactionId = transactionId.split(':')[0]; // Remove Djomy suffix

      if (!transactionId) {
        return res.status(400).json({ error: 'transactionId requis.' });
      }

      // Chercher en DB locale
      let enrollment = await db.get(
        `SELECT e.id, e.status, e.access_token, c.title as course_title, e.djomy_transaction_id
         FROM enrollments e JOIN courses c ON c.id = e.course_id
         WHERE e.djomy_transaction_id ILIKE $1`, [transactionId + '%']
      );
      // Fallback par enrollId
      if (!enrollment) {
        enrollment = await db.get(
          `SELECT e.id, e.status, e.access_token, c.title as course_title, e.djomy_transaction_id
           FROM enrollments e JOIN courses c ON c.id = e.course_id
           WHERE e.id = $1`, [transactionId]
        );
      }

      if (!enrollment) {
        return res.status(404).json({ error: 'Transaction introuvable en base.' });
      }

      // Si trouvé en base, renvoyer directement le statut local.
      // Le webhook mettra à jour la base de données de manière asynchrone.
      const host  = req.get('host') || `localhost:${PORT}`;
      const proto = (req.headers['x-forwarded-proto'] as string) || 'http';

      if (enrollment.status === 'paid') {
        return res.json({
          success: true, status: 'SUCCESS',
          access_token: enrollment.access_token,
          access_url:   `${proto}://${host}/access/${enrollment.access_token}`,
          course_title: enrollment.course_title,
          source: 'local_db',
        });
      } else if (enrollment.status === 'failed' || enrollment.status === 'cancelled') {
         return res.json({ success: false, status: 'FAILED', error: 'Le paiement a échoué ou a été annulé.' });
      }

      // ── Fallback : Le webhook de Djomy n'est pas arrivé, on demande MANUELLEMENT à Djomy ──
      if (djomyConfigured()) {
        const realTxId = enrollment.djomy_transaction_id || transactionId;
        const cleanTxId = realTxId.split(':')[0];

        try {
          const djomyResp = await djomyAuthRequest('GET', '/v1/payments/' + encodeURIComponent(cleanTxId) + '/status', null as any);

          if (djomyResp.status === 200) {
            const body = djomyResp.body || {};
            const status = (body.data?.status || body.status || '').toLowerCase();

            // ATTENTION : Validation sécurisée, ne pas utiliser body.success === true
            if (['success', 'paid', 'completed'].includes(status)) {
              const accessToken = genToken();
              await db.run(
                "UPDATE enrollments SET status='paid', access_token=$1 WHERE id=$2",
                [accessToken, enrollment.id]
              );
              return res.json({
                success: true, status: 'SUCCESS',
                access_token: accessToken,
                access_url:   `${proto}://${host}/access/${accessToken}`,
                course_title: enrollment.course_title,
                source: 'djomy_api'
              });
            } else if (['failed', 'cancelled'].includes(status)) {
              await db.run(
                "UPDATE enrollments SET status=$1 WHERE id=$2",
                [status, enrollment.id]
              );
              return res.json({ success: false, status: 'FAILED', error: 'Le paiement a échoué ou a été annulé.' });
            }
          }
        } catch (e: any) {
          console.error('[GET /api/payment/status] Djomy Fallback Error:', e.message);
        }
      }

      // Si Djomy ne répond pas ou est toujours en attente
      return res.json({
        success: true, status: 'PENDING',
        message: 'Paiement en attente de validation par Djomy.',
        source: 'local_db'
      });
    } catch (e: any) {
      console.error('[GET /api/payment/status]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Djomy Payment — Webhook — POST /api/payment/webhook ──
  app.post("/api/payment/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      // Sans secret configuré, aucune signature ne peut être valide → rejet systématique
      if (!DJOMY_CLIENT_SECRET) {
        return res.status(401).json({ error: 'Webhook non configuré (DJOMY_CLIENT_SECRET manquant)' });
      }

      const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
      const sigHeader = (req.headers['x-webhook-signature'] as string) || (req.headers['x-api-key'] as string) || '';

      let receivedHash = sigHeader;
      if (receivedHash.startsWith('v1:')) {
        receivedHash = receivedHash.slice(3);
      } else if (receivedHash.includes(':')) {
        receivedHash = receivedHash.split(':').pop() || '';
      }

      if (!/^[0-9a-f]{64}$/i.test(receivedHash)) {
        return res.status(401).json({ error: 'Signature manquante ou invalide' });
      }
      const expectedHash = djomyHmac(rawBody, DJOMY_CLIENT_SECRET);

      // Comparaison sécurisée (timing-safe)
      if (!crypto.timingSafeEqual(
        Buffer.from(expectedHash, 'hex'),
        Buffer.from(receivedHash.toLowerCase(), 'hex')
      )) {
        return res.status(401).json({ error: 'Signature webhook invalide' });
      }

      const event = JSON.parse(rawBody);
      const eventType     = event.eventType     || '';
      const txId = event.data?.transactionId || event.transactionId || '';
      const transactionId = txId.split(':')[0]; // Remove Djomy suffix
      const metadata      = event.metadata      || {};

      switch (eventType) {
        case 'payment.success': {
          if (!transactionId) return res.status(400).json({ error: 'transactionId manquant' });

          let enrollment = await db.get(
            "SELECT id, status, access_token FROM enrollments WHERE djomy_transaction_id ILIKE $1", [transactionId + '%']
          );
          if (!enrollment) {
            const ref = event.data?.merchantPaymentReference || '';
            if (ref) enrollment = await db.get("SELECT id, status, access_token FROM enrollments WHERE id=$1", [ref]);
          }
          if (!enrollment && metadata.enrollment_id) {
            enrollment = await db.get("SELECT id, status, access_token FROM enrollments WHERE id=$1", [metadata.enrollment_id]);
          }
          if (!enrollment) return res.json({ warning: 'Enrollment introuvable' });
          if (enrollment.status === 'paid') return res.json({ success: true, idempotent: true });

          // BUG #5 : Réutiliser le token d'accès s'il existe (pour éviter de révoquer l'accès en cas d'appel webhook en double)
          const newAccessToken = enrollment.access_token ? enrollment.access_token : genToken();
          await db.run(
            "UPDATE enrollments SET status='paid', access_token=$1, djomy_transaction_id=$2 WHERE id=$3",
            [newAccessToken, transactionId, enrollment.id]
          );
          console.log(`[Djomy Webhook] payment.success — enrollmentId=${enrollment.id}`);
          return res.json({ success: true });
        }
        case 'payment.failed':
          if (transactionId) await db.run(
            "UPDATE enrollments SET status='failed' WHERE djomy_transaction_id ILIKE $1 AND status='pending'",
            [transactionId + '%']
          );
          return res.json({ success: true });
        case 'payment.cancelled':
          if (transactionId) await db.run(
            "UPDATE enrollments SET status='cancelled' WHERE djomy_transaction_id ILIKE $1 AND status='pending'",
            [transactionId + '%']
          );
          return res.json({ success: true });
        default:
          return res.json({ info: `Événement non géré : ${eventType}` });
      }
    } catch (e: any) {
      console.error('[POST /api/payment/webhook]', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Chat IA Gemini (proxy sécurisé) ──────────────────────
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        return res.status(503).json({ error: 'Service IA non configuré (GEMINI_API_KEY manquante)' });
      }
      const { message, history } = req.body;
      if (!message) return res.status(400).json({ error: 'Message requis' });

      // Nom de plateforme personnalisable via les settings
      const settingsRow = await db.get("SELECT value FROM settings WHERE key='platformName'");
      const platformName = settingsRow?.value || 'la plateforme de formation';

      // Charger le contexte des formations pour le RAG
      const courses = await db.all("SELECT title, description, price, category FROM courses WHERE status='published'");
      const systemPrompt = `Tu es l'assistant intelligent de ${platformName}.
Ton rôle est d'aider les visiteurs à trouver la formation qui correspond à leurs besoins.
Formations disponibles :\n${courses.map((c: any) => `- ${c.title} (${c.category}) — ${c.price} : ${c.description || 'Pas de description'}`).join('\n')}
Réponds en français, de manière concise et professionnelle. Si tu ne sais pas, dis-le honnêtement.`;

      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey });
      const chat = genAI.chats.create({
        model: 'gemini-2.0-flash',
        config: { systemInstruction: systemPrompt },
        history: (history || []).map((h: any) => ({ role: h.role, parts: [{ text: h.content }] }))
      });
      const response = await chat.sendMessage({ message });
      res.json({ reply: response.text });
    } catch (e: any) {
      console.error('[POST /api/chat]', e);
      res.status(500).json({ error: 'Erreur du service IA : ' + e.message });
    }
  });

  // ── Vite / Static ─────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    if (!djomyConfigured()) {
      console.log('ℹ️  Paiement Djomy NON configuré (DJOMY_CLIENT_ID / DJOMY_CLIENT_SECRET absents) — endpoints de paiement désactivés.');
    }
  });
}

startServer();
