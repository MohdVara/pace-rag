import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {portfolio,critical} from '../evaluation/efrd-heldout.mjs';
import {verification} from '../evaluation/verification-v13.mjs';
import {verificationV14} from '../evaluation/verification-v14.mjs';
import {loadContent} from './indexing/content.mjs';
export const csv=rows=>rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
export function parseCsv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(cell.replace(/\r$/,''));cell='';if(c==='\n'){rows.push(row);row=[];}}else cell+=c;}if(quoted)throw Error('Unclosed CSV quote');if(cell||row.length){row.push(cell);rows.push(row);}const [headers,...body]=rows;return body.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));}
const hash=x=>createHash('sha256').update(x).digest('hex');
export function aggregate(labels,tasks){
 const reviewed=labels.filter(r=>r.judgment),executed=tasks.filter(r=>r.outcome);
 if(reviewed.some(r=>!['agree','disagree','ambiguous','unsupported'].includes(r.judgment)||!r.reviewer_id||!r.reason))throw Error('Reviewed labels require reviewer, valid judgment and reason');
 if(executed.some(r=>!['passed','failed','blocked'].includes(r.outcome)||!r.session_id||!r.observation||!r.reviewer_type))throw Error('Usability outcomes require session, reviewer type and observation');
 const unique=(rows,key)=>{const ids=rows.map(key);if(new Set(ids).size!==ids.length)throw Error('Duplicate reviewer/session observation');};
 unique(reviewed,r=>r.reviewer_id+'|'+r.packet_id);unique(executed,r=>r.session_id+'|'+r.task_id);
 if(executed.some(r=>!['human-independent','human-involved','agent'].includes(r.reviewer_type)))throw Error('Use an explicit human-independent, human-involved or agent reviewer type');
 const count=(rows,field,value)=>rows.filter(r=>r[field]===value).length;
 const denomin=executed.filter(r=>r.outcome!=='blocked');
 return{status:reviewed.length||executed.length?'Supplied findings aggregated; authorship and independence require owner verification':'Not performed',labelReviews:reviewed.length,agreements:count(reviewed,'judgment','agree'),disagreements:reviewed.filter(r=>r.judgment!=='agree'),usabilityAttempts:executed.length,usabilityPassed:count(executed,'outcome','passed'),usabilityBlocked:count(executed,'outcome','blocked'),usabilitySuccessRate:denomin.length?count(executed,'outcome','passed')/denomin.length:null,declaredHumanIndependentSessions:[...new Set(executed.filter(r=>r.reviewer_type==='human-independent').map(r=>r.session_id))].length,independentReviewVerified:false,realUserTestingVerified:false,limits:['Blank rows are unperformed, never passes. Self-reported reviewer type is not identity verification. Automated/agent runs must use reviewer_type: agent. No reviewed labels or generated text are promoted into the approved cache.']};
}
export async function preparePacket(root='docs/reviewer-v15'){
 let entries;try{entries=await readdir(root);}catch(error){if(error.code!=='ENOENT')throw error;}if(entries?.length)throw Error('Packet destination is not empty; preserve existing reviewer forms');
 const data=await loadContent('portfolio',{release:true});const seed='pace-v15-review-order-1';
 const rows=[...portfolio,...critical,...verification,...verificationV14];
 const order=values=>values.toSorted((a,b)=>hash(seed+a.id).localeCompare(hash(seed+b.id)));
 const selected=order([...order(rows.filter(r=>r.relevantAnswerIds)).slice(0,40),...order(rows.filter(r=>!r.relevantAnswerIds)).slice(0,20)]).map((r,i)=>({...r,packetId:`Q${String(i+1).padStart(3,'0')}`}));
 for(const folder of ['blind','adjudication','forms'])await mkdir(`${root}/${folder}`,{recursive:true});
 await writeFile(`${root}/blind/questions.csv`,csv([['packet_id','knowledge_source','question'],...selected.map(r=>[r.packetId,'Professional Experience',r.question])]));
 await writeFile(`${root}/adjudication/key.json`,JSON.stringify({status:'Provisional agent-authored labels from previously inspected sets; not independent ground truth',seed,questions:selected.map(r=>({packetId:r.packetId,originalId:r.id,question:r.question,relevantAnswerIds:r.relevantAnswerIds||[],expect:r.relevantAnswerIds?'reviewed-question suggestion':'insufficient-evidence',supportingSourceIds:[...new Set((r.relevantAnswerIds||[]).flatMap(id=>data.answers.find(a=>a.id===id).citations.map(c=>c.sourceId)))]}))},null,2)+'\n');
 await writeFile(`${root}/adjudication/evidence.json`,JSON.stringify({evidenceVersion:data.technologyEvidence.contentVersion,answers:data.answers.map(a=>({id:a.id,question:a.canonicalQuestion,answer:a.answerText,citations:a.citations})),documents:data.documents.map(d=>({id:d.id,title:d.title,url:d.canonicalUrl,version:d.version,contentHash:d.contentHash,text:d.body||d.content||d.text}))},null,2)+'\n');
 await writeFile(`${root}/forms/label-review.csv`,csv([['reviewer_id','packet_id','judgment','proposed_answer_ids','source_ids','reason'],...selected.map(r=>['',r.packetId,'','','',''])]));
 await writeFile(`${root}/forms/disagreements.csv`,csv([['adjudicator_id','packet_id','reviewer_ids','decision','accepted_answer_ids','source_ids','rationale','decided_at']]));
 const tasks=[
 ['R1','Recruiter','Find one relevant engineering project and its supporting evidence','Correct project and citation; ≤120 seconds'],
 ['R2','Recruiter','Ask a paraphrased question; explain whether the suggestions answer it','Distinguishes suggestions from an answer without prompting; ≤90 seconds'],
 ['R3','Recruiter','Determine the nature of ongoing WenSymes collaboration','Identifies occasional collaboration rather than continuous employment; ≤120 seconds'],
 ['E1','Engineering manager','Inspect the PHP framework worked example and verify a project mapping','Symfony/rental or Laravel/education/WenSymes traced to a citation; ≤120 seconds'],
 ['E2','Engineering manager','Inspect a Fictional Test Document and identify its purpose and origin','Fictional before search; source opened within two total actions including source selection; origin identified'],
 ['E3','Engineering manager','Compare answer-supporting sources and similarly ranked passages','Explains that topical passages are not automatically supporting citations'],
 ['C1','Client','Find how to discuss a relevant engineering engagement','Correct public contact/booking route; ≤120 seconds'],
 ['C2','Client','Ask for unsupported private performance metrics','Recognizes insufficient evidence; no unsupported factual answer'],
 ['C3','Client','Use a starter and inspect whether hosted generation was needed','Understands reviewed/local path and zero Workers AI calls; no model download for starter']
 ];
 await writeFile(`${root}/blind/usability-tasks.csv`,csv([['task_id','persona','task'],...tasks.map(t=>t.slice(0,3))]));
 await writeFile(`${root}/adjudication/usability-criteria.csv`,csv([['task_id','persona','task','planned_success_criterion'],...tasks]));
 await writeFile(`${root}/forms/usability.csv`,csv([['session_id','reviewer_type','task_id','outcome','elapsed_seconds','interactions','observation'],...tasks.map(t=>['','',t[0],'','','',''])]));
 await writeFile(`${root}/holdout.template.json`,JSON.stringify({version:'owner-supplied-holdout-v1',preparedBy:{reviewerId:'',relationshipToImplementation:'',preparedAt:'',attestation:''},labelReview:'Pending independent adjudication',questions:[]},null,2)+'\n');
 const blind=await readFile(`${root}/blind/questions.csv`);
 await writeFile(`${root}/manifest.json`,JSON.stringify({version:'pace-review-packet-v15',questionCount:60,questionsSha256:hash(blind),preparation:'Agent-prepared randomized regression review; not a fresh independently prepared holdout',independentReviewOccurred:false,realUserTestingOccurred:false,sourceApprovalModified:false},null,2)+'\n');
 await writeFile(`${root}/findings.json`,JSON.stringify(aggregate([],[]),null,2)+'\n');
}
async function main(){const [command='prepare',path='docs/reviewer-v15']=process.argv.slice(2);if(command==='prepare')await preparePacket(path);else if(command==='aggregate'){const labels=parseCsv(await readFile(`${path}/forms/label-review.csv`,'utf8')),tasks=parseCsv(await readFile(`${path}/forms/usability.csv`,'utf8'));const manifest=JSON.parse(await readFile(`${path}/adjudication/key.json`,'utf8'));const ids=new Set(manifest.questions.map(r=>r.packetId));if(labels.some(r=>!ids.has(r.packet_id)))throw Error('Unknown packet question ID');const taskIds=new Set(parseCsv(await readFile(`${path}/blind/usability-tasks.csv`,'utf8')).map(r=>r.task_id));if(tasks.some(r=>!taskIds.has(r.task_id)))throw Error('Unknown usability task ID');await writeFile(`${path}/findings.json`,JSON.stringify(aggregate(labels,tasks),null,2)+'\n');}else if(command==='run'){if(!process.argv[3])throw Error('Supply the independently prepared holdout JSON path');execFileSync(process.execPath,['scripts/evaluate-v15.mjs','--semantic','--holdout',process.argv[3]],{stdio:'inherit'});}else throw Error('Use prepare, aggregate or run <holdout.json>');}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
