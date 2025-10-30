import { db } from './db';
import { faker } from '@faker-js/faker';
import { sampleTags, stages } from './utils';
import { nanoid } from 'nanoid';

async function seedJobs(){
  const jobs=[];
  for(let i=0;i<25;i++){
    const title=faker.person.jobTitle();
    const slug=`${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)}-${i}`;
    jobs.push({ id:nanoid(), title, slug, tags: faker.helpers.arrayElements(sampleTags,{min:1,max:3}), status: faker.helpers.arrayElement(['active','archived']), order:i });
  }
  await db.jobs.bulkPut(jobs); return jobs;
}
async function seedCandidates(jobs){
  const list=[];
  for(let i=0;i<1000;i++){
    const job=faker.helpers.arrayElement(jobs);
    list.push({ id:nanoid(), jobId:job.id, name:faker.person.fullName(), email:faker.internet.email().toLowerCase(), stage:faker.helpers.arrayElement(stages), createdAt: Date.now()-faker.number.int({min:0,max:86_400_000*90}) });
  }
  await db.candidates.bulkPut(list);
  const timeline=list.map(c=>({ id:nanoid(), candidateId:c.id, from:'applied', to:c.stage, at: Date.now()-faker.number.int({min:10_000,max:86_400_000}) }));
  await db.timeline.bulkPut(timeline);
}
async function seedAssessments(jobs){
  for(const job of jobs.slice(0,3)){
    const schema={
      jobId: job.id,
      sections:[
        { id:'sec-1', title:'General', questions:[
          { id:'q1', type:'single', label:'Open to remote?', required:true, options:[{label:'Yes',value:'Yes'},{label:'No',value:'No'}] },
          { id:'q2', type:'shortText', label:'Portfolio URL', maxLength:120 },
          { id:'q3', type:'number', label:'Years of experience', min:0, max:30, required:true }
        ]},
        { id:'sec-2', title:'Technical', questions:[
          { id:'q4', type:'longText', label:'Describe a challenge you solved', maxLength:500 },
          { id:'q5', type:'file', label:'Upload resume (stub)' },
          { id:'q6', type:'single', label:'OK with on-call?', required:true, options:[{label:'Yes',value:'Yes'},{label:'No',value:'No'}], showIf:{ qid:'q3', op:'>=', value:2 } }
        ]}
      ]
    };
    await db.assessments.put({ id:`ass-${job.id}`, jobId:job.id, schema });
  }
}
export async function ensureSeed(){
  const has=await db.jobs.count();
  if(!has){ const jobs=await seedJobs(); await seedCandidates(jobs); await seedAssessments(jobs); }
}