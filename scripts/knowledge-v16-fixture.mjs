// Evaluation-only hypothetical eligibility fixture. Never imported by the UI,
// production indexing, release scripts or content registry. No approvals are saved.
import {draftProfessionalV16} from './stage-professional-v16.mjs';
import {approvalHash,chunksFor,hash} from './indexing/content.mjs';
import {validateCorpus} from '../packages/knowledge-schema/src/validate.mjs';
export async function simulatedReviewedDraftsV16(){
 const {corpus}=await draftProfessionalV16();
 for(const r of [...corpus.documents,...corpus.answers])if(r.status==='draft'){
  r.status='approved';r.approval={scope:'local-test',reviewer:'AUTOMATED-HYPOTHETICAL-TEST-FIXTURE-NOT-OWNER-APPROVAL',approvedAt:'2026-10-19T00:00:00Z',contentHash:approvalHash(r)};r.reviewedAt=r.approval.approvedAt;
 }
 // Local-test scopes must still fail release validation.
 validateCorpus(corpus);
 const version=hash(JSON.stringify({documents:corpus.documents,answers:corpus.answers,simulationOnly:true})).slice(0,16);
 return{...corpus,documents:corpus.documents.filter(d=>d.status==='approved'),answers:corpus.answers.filter(a=>a.status==='approved'),corpusVersion:version,chunks:chunksFor(corpus,version),simulationOnly:true};
}
