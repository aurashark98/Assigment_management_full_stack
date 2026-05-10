const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('restforgejs/src/utils/db');

const router = express.Router();

function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function serializeUser(row) {
  if (!row) return null;

  return {
    id: row.user_id ? String(row.user_id) : null,
    username: row.employee_code || null,
    full_name: row.full_name || null,
    email: row.email || null,
    phone: row.phone || null,
    role: row.role || null,
    department: row.department || null,
    job_title: row.job_title || null,
    gender: row.gender || null,
    birth_date: toIsoDate(row.birth_date),
    profile_photo: row.profile_photo || null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

function cleanBodyValue(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function createWerkzeugPasswordHash(password, iterations = 600000, digest = 'sha256') {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, digest).toString('hex');
  return `pbkdf2:${digest}:${iterations}$${salt}$${derivedKey}`;
}

function verifyWerkzeugPasswordHash(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('pbkdf2:')) {
    return false;
  }

  const [algorithmPart, salt, hash] = storedHash.split('$');
  if (!algorithmPart || !salt || !hash) return false;

  const [, digest, iterationsRaw] = algorithmPart.split(':');
  const iterations = Number(iterationsRaw);
  if (!digest || !Number.isFinite(iterations) || !salt || !hash) return false;

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, hash.length / 2, digest).toString('hex');
  const expectedBuffer = Buffer.from(hash, 'hex');
  const actualBuffer = Buffer.from(derivedKey, 'hex');

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  if (storedHash.startsWith('pbkdf2:')) {
    return verifyWerkzeugPasswordHash(password, storedHash);
  }

  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(password, storedHash);
  }

  return password === storedHash;
}

async function fetchUserByIdentifier(identifier) {
  const query = `
      SELECT user_id, employee_code, full_name, email, phone, password_hash, role, department, job_title,
        is_active, gender, TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, profile_photo, created_at, updated_at
    FROM app_user
    WHERE LOWER(email) = LOWER($1)
       OR LOWER(employee_code) = LOWER($1)
    LIMIT 1
  `;

  const rows = await db.executeQuery(query, [identifier]);
  return rows && rows[0] ? rows[0] : null;
}

router.post('/auth/login', async (req, res) => {
  try {
    const payload = req.body || {};
    const identifier = cleanBodyValue(payload.identifier || payload.email || payload.username);
    const password = cleanBodyValue(payload.password) || '';

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier dan password wajib diisi.',
      });
    }

    const userRow = await fetchUserByIdentifier(identifier);
    if (!userRow) {
      return res.status(401).json({
        success: false,
        message: 'Username/email atau password salah.',
      });
    }

    if (userRow.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Akun tidak aktif.',
      });
    }

    const isPasswordValid = await verifyPassword(password, userRow.password_hash || '');
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username/email atau password salah.',
      });
    }

    return res.json({
      success: true,
      message: 'Login berhasil.',
      user: serializeUser(userRow),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan login.',
      details: error.message,
    });
  }
});

router.post('/auth/signup', async (req, res) => {
  try {
    const payload = req.body || {};
    const email = cleanBodyValue(payload.email);
    const password = cleanBodyValue(payload.password) || '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    const existing = await db.executeQuery(
      'SELECT user_id FROM app_user WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email]
    );

    if (existing && existing[0]) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    const employeeCode = `USR-${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const userId = uuidv4();
    const hashedPassword = createWerkzeugPasswordHash(password);
    const fullName = email.split('@')[0] || 'User';

    await db.executeQuery(
      `
        INSERT INTO app_user (
          user_id, employee_code, full_name, email, password_hash, role, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [userId, employeeCode, fullName, email, hashedPassword, 'REQUESTER']
    );

    const createdUser = await fetchUserByIdentifier(email);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      user: serializeUser(createdUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan registrasi.',
      details: error.message,
    });
  }
});

async function getProfile(userId) {
  const rows = await db.executeQuery(
    `
      SELECT user_id, employee_code, full_name, email, phone, role, department, job_title,
             gender, TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, profile_photo, created_at, updated_at
      FROM app_user
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows && rows[0] ? rows[0] : null;
}

async function getRequesterIdByEmail(email) {
  if (!email) return null;

  const rows = await db.executeQuery(
    `
      SELECT user_id
      FROM app_user
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return rows && rows[0] ? String(rows[0].user_id) : null;
}

async function getWorkRequestById(reportId) {
  const rows = await db.executeQuery(
    `
      SELECT
        r.report_id,
        r.report_number,
        r.reporter_id,
        r.category_id,
        r.facility_id,
        r.title,
        r.description,
        r.location_floor,
        r.location_room,
        r.location_detail,
        r.urgency,
        r.status,
        r.assigned_to_id,
        r.admin_note,
        r.technician_note,
        r.resolution_note,
        r.rejection_reason,
        r.photo_before_url,
        r.photo_after_url,
        r.reported_at,
        r.assigned_at,
        r.started_at,
        r.solved_at,
        r.closed_at,
        r.created_at,
        r.updated_at,
        f.facility_name,
        c.category_name,
        a.full_name AS assigned_to_name,
        rep.full_name AS reporter_name
      FROM maintenance_report r
      LEFT JOIN facility_asset f ON f.facility_id = r.facility_id
      LEFT JOIN issue_category c ON c.category_id = r.category_id
      LEFT JOIN app_user a ON a.user_id = r.assigned_to_id
      LEFT JOIN app_user rep ON rep.user_id = r.reporter_id
      WHERE r.report_id = $1
      LIMIT 1
    `,
    [reportId]
  );

  return rows && rows[0] ? rows[0] : null;
}

function mapWorkRequestRow(row) {
  if (!row) return null;

  return {
    report_id: row.report_id,
    report_number: row.report_number,
    title: row.title,
    description: row.description,
    location_floor: row.location_floor || null,
    location_room: row.location_room || null,
    location_detail: row.location_detail || null,
    status: row.status,
    assigned_to_id: row.assigned_to_id,
    assigned_to_name: row.assigned_to_name || null,
    facility_id: row.facility_id,
    facility_name: row.facility_name || null,
    category_id: row.category_id,
    category_name: row.category_name || null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

function mapWorkRequestDetail(row, activityRows = [], commentRows = [], attachmentRows = []) {
  if (!row) return null;

  return {
    report: {
      report_id: row.report_id,
      report_number: row.report_number,
      reporter_id: row.reporter_id,
      category_id: row.category_id,
      facility_id: row.facility_id,
      title: row.title,
      location_floor: row.location_floor,
      location_room: row.location_room,
      location_detail: row.location_detail,
      description: row.description,
      urgency: row.urgency,
      status: row.status,
      assigned_to_id: row.assigned_to_id,
      admin_note: row.admin_note,
      technician_note: row.technician_note,
      resolution_note: row.resolution_note,
      rejection_reason: row.rejection_reason,
      photo_before_url: row.photo_before_url,
      photo_after_url: row.photo_after_url,
      reported_at: row.reported_at ? new Date(row.reported_at).toISOString() : null,
      assigned_at: row.assigned_at ? new Date(row.assigned_at).toISOString() : null,
      started_at: row.started_at ? new Date(row.started_at).toISOString() : null,
      solved_at: row.solved_at ? new Date(row.solved_at).toISOString() : null,
      closed_at: row.closed_at ? new Date(row.closed_at).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    },
    relation: {
      facility_name: row.facility_name || null,
      category_name: row.category_name || null,
      assigned_to_name: row.assigned_to_name || null,
      reporter_name: row.reporter_name || null,
    },
    activity: activityRows.map((activity) => ({
      activity_id: activity.activity_id,
      report_id: activity.report_id,
      actor_id: activity.actor_id,
      actor_name: activity.actor_name || null,
      activity_type: activity.activity_type,
      status_from: activity.status_from,
      status_to: activity.status_to,
      activity_note: activity.activity_note,
      activity_at: activity.activity_at ? new Date(activity.activity_at).toISOString() : null,
    })),
    comments: commentRows.map((comment) => ({
      comment_id: comment.comment_id,
      report_id: comment.report_id,
      author_id: comment.author_id,
      author_name: comment.author_name || null,
      comment_text: comment.comment_text,
      is_internal: comment.is_internal,
      created_at: comment.created_at ? new Date(comment.created_at).toISOString() : null,
    })),
    attachments: attachmentRows.map((attachment) => ({
      attachment_id: attachment.attachment_id,
      report_id: attachment.report_id,
      attachment_type: attachment.attachment_type,
      file_name: attachment.file_name,
      file_url: attachment.file_url,
      mime_type: attachment.mime_type,
      file_size_bytes: attachment.file_size_bytes,
      uploaded_by: attachment.uploaded_by,
      created_at: attachment.created_at ? new Date(attachment.created_at).toISOString() : null,
    })),
  };
}

function generateWorkRequestNumber() {
  const now = new Date();
  const yearMonth = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `WR-${yearMonth}-${suffix}`;
}

router.post('/api/maintenance_report', async (req, res) => {
  try {
    const payload = req.body || {};
    const actorId = String(payload.actor_id || req.query.actor_id || '').trim();
    const actorEmail = String(payload.actor_email || req.query.actor_email || '').trim();
    const requesterId = actorId || (actorEmail ? await getRequesterIdByEmail(actorEmail) : '');

    if (!requesterId) {
      return res.status(400).json({ success: false, message: 'actor_id atau actor_email wajib diisi.' });
    }

    const title = cleanBodyValue(payload.title);
    const facilityId = cleanBodyValue(payload.facility_id);
    const categoryId = cleanBodyValue(payload.category_id);

    if (!title || !facilityId || !categoryId) {
      return res.status(400).json({ success: false, message: 'title, facility_id, dan category_id wajib diisi.' });
    }

    const reportId = crypto.randomUUID();
    const reportNumber = generateWorkRequestNumber();
    const description = cleanBodyValue(payload.description);
    const urgency = cleanBodyValue(payload.urgency) || 'medium';
    const locationFloor = cleanBodyValue(payload.location_floor);
    const locationRoom = cleanBodyValue(payload.location_room);
    const locationDetail = cleanBodyValue(payload.location_detail);
    const photoBeforeUrl = cleanBodyValue(payload.photo_before_url);

    await db.executeQuery(
      `
        INSERT INTO maintenance_report (
          report_id,
          report_number,
          reporter_id,
          category_id,
          facility_id,
          title,
          location_floor,
          location_room,
          location_detail,
          description,
          urgency,
          status,
          assigned_to_id,
          photo_before_url,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'draft', NULL, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `,
      [
        reportId,
        reportNumber,
        requesterId,
        categoryId,
        facilityId,
        title,
        locationFloor,
        locationRoom,
        locationDetail,
        description,
        urgency,
        photoBeforeUrl,
      ]
    );

    const created = await getWorkRequestById(reportId);
    return res.status(201).json({ success: true, message: 'Draft berhasil dibuat.', data: mapWorkRequestRow(created) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat draft.', details: error.message });
  }
});

router.get('/api/work-requests/my', async (req, res) => {
  try {
    const actorId = String(req.query.actor_id || '').trim();
    const actorEmail = String(req.query.actor_email || '').trim();
    const requesterId = actorId || await getRequesterIdByEmail(actorEmail);

    if (!requesterId) {
      return res.status(400).json({ success: false, message: 'actor_id atau actor_email wajib diisi.' });
    }

    const rows = await db.executeQuery(
      `
        SELECT
          r.report_id,
          r.report_number,
          r.title,
          r.description,
          r.location_floor,
          r.location_room,
          r.location_detail,
          r.photo_before_url,
          r.status,
          r.assigned_to_id,
          a.full_name AS assigned_to_name,
          r.facility_id,
          f.facility_name,
          r.category_id,
          c.category_name,
          r.updated_at,
          r.created_at
        FROM maintenance_report r
        LEFT JOIN facility_asset f ON f.facility_id = r.facility_id
        LEFT JOIN issue_category c ON c.category_id = r.category_id
        LEFT JOIN app_user a ON a.user_id = r.assigned_to_id
        WHERE r.reporter_id = $1
        ORDER BY COALESCE(r.updated_at, r.created_at) DESC, r.report_id DESC
      `,
      [requesterId]
    );

    return res.json({ success: true, data: rows.map(mapWorkRequestRow) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memuat work request.', details: error.message });
  }
});

router.get('/api/work-request/:report_id/detail', async (req, res) => {
  try {
    const reportId = String(req.params.report_id || '').trim();
    if (!reportId) {
      return res.status(400).json({ success: false, message: 'report_id wajib diisi.' });
    }

    const row = await getWorkRequestById(reportId);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Work request tidak ditemukan.' });
    }

    const [activityRows, commentRows, attachmentRows] = await Promise.all([
      db.executeQuery(
        `
          SELECT
            a.activity_id,
            a.report_id,
            a.actor_id,
            u.full_name AS actor_name,
            a.activity_type,
            a.status_from,
            a.status_to,
            a.activity_note,
            a.activity_at
          FROM report_activity a
          LEFT JOIN app_user u ON u.user_id = a.actor_id
          WHERE a.report_id = $1
          ORDER BY a.activity_at ASC, a.activity_id ASC
        `,
        [reportId]
      ),
      db.executeQuery(
        `
          SELECT
            c.comment_id,
            c.report_id,
            c.author_id,
            u.full_name AS author_name,
            c.comment_text,
            c.is_internal,
            c.created_at
          FROM report_comment c
          LEFT JOIN app_user u ON u.user_id = c.author_id
          WHERE c.report_id = $1
          ORDER BY c.created_at ASC, c.comment_id ASC
        `,
        [reportId]
      ),
      db.executeQuery(
        `
          SELECT
            a.attachment_id,
            a.report_id,
            a.attachment_type,
            a.file_name,
            a.file_url,
            a.mime_type,
            a.file_size_bytes,
            a.uploaded_by,
            a.created_at
          FROM report_attachment a
          WHERE a.report_id = $1
          ORDER BY a.created_at ASC, a.attachment_id ASC
        `,
        [reportId]
      )
    ]);

    return res.json({ success: true, data: mapWorkRequestDetail(row, activityRows, commentRows, attachmentRows) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memuat detail work request.', details: error.message });
  }
});

router.post('/api/work-requests/:report_id/submit', async (req, res) => {
  try {
    const reportId = String(req.params.report_id || '').trim();
    const actorId = String(req.body?.actor_id || req.query.actor_id || '').trim();
    const actorEmail = String(req.body?.actor_email || req.query.actor_email || '').trim();
    const requesterId = actorId || (actorEmail ? await getRequesterIdByEmail(actorEmail) : '');

    if (!reportId) {
      return res.status(400).json({ success: false, message: 'report_id wajib diisi.' });
    }

    const row = await getWorkRequestById(reportId);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Work request tidak ditemukan.' });
    }

    if (requesterId && String(row.reporter_id) !== requesterId) {
      return res.status(403).json({ success: false, message: 'Only requester can submit this work request.' });
    }

    const currentStatus = String(row.status || '').toLowerCase();
    if (currentStatus !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft work request can be submitted.' });
    }

    await db.executeQuery(
      `
        UPDATE maintenance_report
        SET status = 'submitted', updated_at = CURRENT_TIMESTAMP
        WHERE report_id = $1
      `,
      [reportId]
    );

    return res.json({ success: true, message: 'Work request berhasil disubmit.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal submit work request.', details: error.message });
  }
});

router.put('/api/maintenance_report/:report_id', async (req, res) => {
  try {
    const reportId = String(req.params.report_id || '').trim();
    const actorId = String(req.body?.actor_id || req.query.actor_id || '').trim();
    const actorEmail = String(req.body?.actor_email || req.query.actor_email || '').trim();
    const requesterId = actorId || (actorEmail ? await getRequesterIdByEmail(actorEmail) : '');
    const payload = req.body || {};

    if (!reportId) {
      return res.status(400).json({ success: false, message: 'report_id wajib diisi.' });
    }

    const row = await getWorkRequestById(reportId);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Work request tidak ditemukan.' });
    }

    const currentStatus = String(row.status || '').toLowerCase();
    if (currentStatus !== 'draft') {
      return res.status(403).json({ success: false, message: 'Only draft work request can be edited.' });
    }

    if (requesterId && String(row.reporter_id) !== requesterId) {
      return res.status(403).json({ success: false, message: 'Requester can only edit own draft work request.' });
    }

    const editableFields = ['title', 'description', 'facility_id', 'category_id', 'urgency', 'location_floor', 'location_room', 'location_detail', 'photo_before_url'];
    const updates = [];
    const values = [];

    for (const field of editableFields) {
      if (!Object.prototype.hasOwnProperty.call(payload, field)) continue;
      updates.push(`${field} = $${values.length + 1}`);
      values.push(cleanBodyValue(payload[field]));
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'status') && String(payload.status || '').toLowerCase() !== 'draft') {
      return res.status(400).json({ success: false, message: 'Draft update only allows draft status.' });
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada field yang bisa diupdate.' });
    }

    values.push(reportId);

    await db.executeQuery(
      `UPDATE maintenance_report SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE report_id = $${values.length}`,
      values
    );

    const updated = await getWorkRequestById(reportId);
    return res.json({ success: true, message: 'Draft berhasil diperbarui.', data: mapWorkRequestRow(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal update draft.', details: error.message });
  }
});

router.delete('/api/maintenance_report/:report_id', async (req, res) => {
  try {
    const reportId = String(req.params.report_id || '').trim();
    const actorId = String(req.query.actor_id || req.body?.actor_id || '').trim();
    const actorEmail = String(req.query.actor_email || req.body?.actor_email || '').trim();
    const requesterId = actorId || (actorEmail ? await getRequesterIdByEmail(actorEmail) : '');

    if (!reportId) {
      return res.status(400).json({ success: false, message: 'report_id wajib diisi.' });
    }

    const row = await getWorkRequestById(reportId);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Work request tidak ditemukan.' });
    }

    const currentStatus = String(row.status || '').toLowerCase();
    if (currentStatus !== 'draft') {
      return res.status(403).json({ success: false, message: 'Only draft work request can be deleted.' });
    }

    if (requesterId && String(row.reporter_id) !== requesterId) {
      return res.status(403).json({ success: false, message: 'Requester can only delete own draft work request.' });
    }

    await db.executeQuery('DELETE FROM maintenance_report WHERE report_id = $1', [reportId]);
    return res.json({ success: true, message: 'Draft berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus draft.', details: error.message });
  }
});

async function updateProfileHandler(req, res) {
  try {
    const userId = String(req.params.user_id || '').trim();
    const payload = req.body || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id wajib diisi.',
      });
    }

    const allowedFields = ['full_name', 'email', 'phone', 'role', 'department', 'job_title', 'gender', 'birth_date', 'profile_photo', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(payload, field)) continue;

      let value = cleanBodyValue(payload[field]);
      if (field === 'birth_date' && value) {
        value = String(value).slice(0, 10);
      }

      updates.push(`${field} = $${values.length + 1}`);
      values.push(value);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada field yang bisa diupdate.',
      });
    }

    values.push(userId);

    await db.executeQuery(
      `UPDATE app_user SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${values.length}`,
      values
    );

    const updatedUser = await getProfile(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    return res.json({
      success: true,
      message: 'Profile berhasil diperbarui.',
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profile.',
      details: error.message,
    });
  }
}

router.get('/profile/:user_id', async (req, res) => {
  try {
    const userId = String(req.params.user_id || '').trim();
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id wajib diisi.',
      });
    }

    const userRow = await getProfile(userId);
    if (!userRow) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    return res.json({
      success: true,
      user: serializeUser(userRow),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat profile.',
      details: error.message,
    });
  }
});

router.put('/profile/:user_id', updateProfileHandler);
router.put('/api/app_user/:user_id', updateProfileHandler);

module.exports = router;