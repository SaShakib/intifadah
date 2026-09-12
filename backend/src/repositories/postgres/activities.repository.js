const { query } = require('../../db/pool');

async function listActivities({ publicOnly = false, limit = 100 } = {}) {
  const values = [];
  const where = publicOnly ? 'WHERE activity.is_published = TRUE' : '';
  values.push(Math.min(Math.max(Number(limit) || 100, 1), 300));
  const res = await query(
    `SELECT
      activity.id,
      activity.title,
      activity.description,
      activity.image_url,
      activity.image_public_id,
      activity.is_published,
      activity.created_by_user_id,
      activity.created_at,
      activity.updated_at,
      creator.full_name AS created_by_name
     FROM organization_activities activity
     JOIN app_users creator ON creator.id = activity.created_by_user_id
     ${where}
     ORDER BY activity.created_at DESC, activity.id DESC
     LIMIT $1`,
    values,
  );
  return res.rows;
}

async function createActivity({ title, description, imageUrl, imagePublicId, isPublished, createdByUserId }) {
  const res = await query(
    `INSERT INTO organization_activities (
      title, description, image_url, image_public_id, is_published, created_by_user_id
    ) VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id`,
    [title, description, imageUrl || null, imagePublicId || null, isPublished !== false, createdByUserId],
  );
  return getActivityById(res.rows[0].id);
}

async function getActivityById(activityId) {
  const res = await query(
    `SELECT
      activity.id, activity.title, activity.description, activity.image_url, activity.image_public_id,
      activity.is_published, activity.created_by_user_id, activity.created_at, activity.updated_at,
      creator.full_name AS created_by_name
     FROM organization_activities activity
     JOIN app_users creator ON creator.id = activity.created_by_user_id
     WHERE activity.id = $1
     LIMIT 1`,
    [activityId],
  );
  return res.rows[0] || null;
}

async function updateActivity(activityId, { title, description, imageUrl, imagePublicId, isPublished }) {
  await query(
    `UPDATE organization_activities
     SET title = $2,
         description = $3,
         image_url = $4,
         image_public_id = $5,
         is_published = $6,
         updated_at = NOW()
     WHERE id = $1`,
    [activityId, title, description, imageUrl || null, imagePublicId || null, isPublished !== false],
  );
  return getActivityById(activityId);
}

module.exports = { listActivities, createActivity, getActivityById, updateActivity };
