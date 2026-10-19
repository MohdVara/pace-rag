import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregate,csv,parseCsv} from '../scripts/review-v15.mjs';
import {workedExample} from '../scripts/worked-example.mjs';
test('blank reviewer forms cannot imply successful review or real-user tests',()=>{
 const r=aggregate([{packet_id:'Q001',judgment:''}],[{task_id:'E1',outcome:''}]);
 assert.equal(r.status,'Not performed');assert.equal(r.usabilitySuccessRate,null);assert.equal(r.independentReviewVerified,false);assert.equal(r.realUserTestingVerified,false);
});
test('aggregation retains ambiguous labels and distinguishes agent runs from human sessions',()=>{
 const r=aggregate([{packet_id:'Q001',reviewer_id:'agent',judgment:'ambiguous',reason:'Multiple supported answers'}],[{task_id:'R1',session_id:'automation',reviewer_type:'agent',outcome:'passed',observation:'Automated task only'}]);
 assert.equal(r.disagreements.length,1);assert.equal(r.declaredHumanIndependentSessions,0);assert.equal(r.realUserTestingVerified,false);
 assert.throws(()=>aggregate([],[{outcome:'passed'}]));
 const duplicate={packet_id:'Q001',reviewer_id:'same-reviewer',judgment:'agree',reason:'Source checked'};assert.throws(()=>aggregate([duplicate,duplicate],[]),/Duplicate/);
});
test('review CSV preserves quoted commas and multiline evidence notes',()=>{
 const parsed=parseCsv(csv([['id','note'],['Q001','Two possibilities, not one\nSource says "reviewed"']]));assert.equal(parsed[0].note,'Two possibilities, not one\nSource says "reviewed"');assert.throws(()=>parseCsv('a\n"unclosed'));
});
test('worked example executes approved composition and retains actual citation/mapping evidence',async()=>{
 const e=await workedExample();assert.equal(e.origin,'approved-composite');assert.equal(e.workersAiInferenceCalls,0);assert.equal(e.trace.semanticFallbackNeeded,false);
 assert.deepEqual(new Set(e.technologies),new Set(['Symfony','Laravel']));
 assert.deepEqual(new Set(e.mappings.map(m=>m.projectId)),new Set(['rental','campus','wensymes']));
 assert(e.mappings.every(m=>e.sources.some(s=>s.sourceId===m.sourceId&&s.approvalScope==='publication')));
 assert(!e.mappings.some(m=>m.projectId==='hostel'||m.projectId==='asset'));
});
