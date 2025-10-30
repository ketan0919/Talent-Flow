import Dexie from 'dexie';
export const db = new Dexie('talentflow');
db.version(1).stores({
  jobs: 'id, slug, status, order',
  candidates: 'id, jobId, email, stage',
  timeline: 'id, candidateId, at',
  notes: 'id, candidateId, at',
  assessments: 'id, jobId',
  responses: 'id, candidateId, jobId, createdAt'
});