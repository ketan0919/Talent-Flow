export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export const randomBetween = (min, max) => Math.floor(Math.random()*(max-min+1))+min;
export const stages = ['applied','screen','tech','offer','hired','rejected'];
export const statusOptions = ['active','archived'];
export const sampleTags = ['frontend','backend','fullstack','mobile','data','devops'];
export const shouldFailWrite = () => Math.random() < 0.07;
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60);