# Normalized Schema Specifications for StudyBuddy (MCA/BCA Extension)

These are additive schema/table definitions for future backend expansion. They are documentation-only here.

1. users
- id (PK, uuid)
- name (text)
- email (text, unique)
- password_hash (text)
- city (text)
- lat (float)
- lng (float)
- course (text)
- semester (int)
- created_at (timestamp)

2. subjects
- id (PK, serial)
- name (text)

3. user_subjects
- id (PK, serial)
- user_id (FK -> users.id)
- subject_id (FK -> subjects.id)
- proficiency (int) -- 1-5

4. partner_requests
- id (PK, uuid)
- from_user_id (FK)
- to_user_id (FK)
- message (text)
- status (enum: pending, accepted, rejected, canceled)
- created_at (timestamp)

5. study_partners
- id (PK, uuid)
- user_a (FK -> users.id)
- user_b (FK -> users.id)
- since (timestamp)

6. study_sessions
- id (PK, uuid)
- title (text)
- host_id (FK -> users.id)
- participants (jsonb) -- array of user IDs
- day (text) -- e.g., 'Mon'
- start (time)
- end (time)
- date (date) -- optional specific date
- subject_id (FK)
- created_at (timestamp)

7. messages
- id (PK, uuid)
- session_id (FK -> study_sessions.id) NULLABLE
- from_user_id (FK)
- to_user_id (FK) NULLABLE (for group messages null)
- body (text)
- sent_at (timestamp)

8. notifications
- id (PK, uuid)
- user_id (FK)
- type (text)
- payload (jsonb)
- read (boolean)
- created_at (timestamp)

9. notes
- id (PK, uuid)
- user_id (FK)
- content (text)
- session_id (FK) NULLABLE
- created_at (timestamp)

10. feedback
- id (PK, uuid)
- from_user_id (FK)
- to_user_id (FK)
- session_id (FK) NULLABLE
- rating (int)
- comment (text)
- created_at (timestamp)


These designs are intentionally normalized and ready to be mapped to Postgres or other relational DBs.
