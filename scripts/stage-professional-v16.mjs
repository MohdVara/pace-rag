import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import {hash,approvalHash} from './indexing/content.mjs';
import {normalizeText,validateCorpus,EMBEDDING} from '../packages/knowledge-schema/src/validate.mjs';
const root='content/portfolio/staged-v16';
export async function draftProfessionalV16(){
 const base=JSON.parse(await readFile('content/portfolio/history/v15-corpus.json','utf8')),proposal=JSON.parse(await readFile(`${root}/proposal.json`,'utf8'));
 if(proposal.status!=='draft'||proposal.publicationApproval!=='OWNER_REVIEW_REQUIRED')throw Error('Staging does not grant publication approval');
 const corpus=structuredClone(base),history=[],changed=new Set(Object.keys(proposal.documents));
 for(const doc of corpus.documents)if(changed.has(doc.id)){
  history.push({kind:'document',before:structuredClone(doc)});
  Object.assign(doc,{version:'2',text:normalizeText(proposal.documents[doc.id]),status:'draft',approval:null,reviewedAt:null,license:'Publication permission pending owner review; copyright retained. No new reuse license.'});doc.contentHash=hash(doc.text);
 }
 const revisions=new Map(Object.entries(proposal.revisions));
 for(const a of corpus.answers)if(a.citations.some(c=>changed.has(c.sourceId))||revisions.has(a.id)){
  history.push({kind:'answer',before:structuredClone(a)});
  const revision=revisions.get(a.id);if(revision)a.answerText=revision.answerText;
  for(const [index,text]of(revision?.addAlternatives||[]).entries())a.alternatives.push({id:`${a.id}-v16-alt-${index}`,text,approvedAt:null});
  Object.assign(a,{version:'2',status:a.status==='retired'?'retired':'draft',approval:null,reviewedAt:null});
  a.citations=a.citations.map(c=>{const d=corpus.documents.find(d=>d.id===c.sourceId);return{...c,documentVersion:d.version,sourceHash:d.contentHash,title:d.title,url:d.canonicalUrl};});
 }
 for(const n of proposal.newAnswers){
  if(corpus.answers.some(a=>a.id===n.id))throw Error('Duplicate new answer');const d=corpus.documents.find(d=>d.id===n.sourceId);if(!changed.has(d?.id))throw Error('New answer must cite a refreshed source');
  corpus.answers.push({id:n.id,corpusId:'portfolio',version:'1',canonicalQuestion:n.canonicalQuestion,answerText:normalizeText(n.answerText),alternatives:n.alternatives.map((text,i)=>({id:`${n.id}-alt-${i}`,text,approvedAt:null})),citations:[{sourceId:d.id,corpusId:'portfolio',documentVersion:d.version,sourceHash:d.contentHash,title:d.title,url:d.canonicalUrl}],embeddingSpecId:EMBEDDING.id,reviewedAt:null,reviewAfter:'2027-01-16T00:00:00Z',status:'draft',approval:null,matchPolicy:{mode:'suggest-only',intent:n.id.slice('portfolio-answer-'.length),protectedFacets:['professional-claim'],policyVersion:'suggest-only-v1'}});
 }
 corpus.retirements.retrievalExcludedDocuments=corpus.retirements.retrievalExcludedDocuments.filter(id=>!changed.has(id));
 // Corpus structure and citation checks apply to drafts too. They remain ineligible.
 validateCorpus(corpus);
 return{base,proposal,corpus,history};
}
export async function stageProfessionalV16(){
 try{await readFile('content/portfolio/v16-owner-approval.json');throw new Error('Historical draft packet is approved and frozen; do not regenerate it');}catch(error){if(error.code!=='ENOENT')throw error;}
 const{base,proposal,corpus,history}=await draftProfessionalV16();
 const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const tech={exports:{}};vm.runInNewContext(compile(await readFile('../mohdvara.github.io/src/technology.ts','utf8')),tech);
 const context={exports:{},require:name=>{if(name!=='./technology')throw Error('Unexpected portfolio dependency');return tech.exports;}};
 const portfolioSource=await readFile('../mohdvara.github.io/src/content.ts','utf8');vm.runInNewContext(compile(portfolioSource),context);
 const snapshot=context.exports.projects.filter(p=>['insurance','campus','rental','wensymes'].includes(p.id)).map(({id,company,role,period,title,summary,result,details})=>({id,company,role,period,title,summary,result,details}));
 const changes=[...corpus.documents,...corpus.answers].filter(r=>r.version!==(r.canonicalQuestion?base.answers:base.documents).find(old=>old.id===r.id)?.version);
 const metadata={version:proposal.version,status:'draft',publicationApproval:'OWNER_REVIEW_REQUIRED',sourceAuthority:proposal.sourceAuthority,portfolioFile:'../mohdvara.github.io/src/content.ts',portfolioFileSha256:hash(portfolioSource),sourceSnapshots:snapshot.map(p=>({projectId:p.id,sha256:hash(JSON.stringify(p))})),unchangedRankingSha256:hash(await readFile('packages/semantic-core/src/retrieval.mjs','utf8')+await readFile('packages/semantic-core/src/hybrid.mjs','utf8')),historicalSourceRecordCount:history.length,changes:changes.map(r=>({id:r.id,kind:r.canonicalQuestion?'answer':'document',version:r.version,status:r.status,proposedApprovalHash:approvalHash(r),sourceTextHash:r.canonicalQuestion?undefined:r.contentHash,citations:r.citations,changeKind:!history.some(h=>h.before.id===r.id)?'new':proposal.revisions[r.id]?'wording-and-citation':r.canonicalQuestion?'citation-rebind-only':'source-refresh'})),approvalInstructions:'Proposed hashes are tooling-generated review targets, not approvals. Obtain owner publication approval for this exact proposal, all rebound citations and any retirement/exclusion changes. Only then update canonical records and approval/publication manifests through the existing review process. No runtime package is generated from this directory.'};
 await mkdir(root,{recursive:true});
 for(const[name,value]of Object.entries({'draft-records':{documents:corpus.documents.filter(d=>d.version==='2'),answers:changes.filter(r=>r.canonicalQuestion),retirementsProposal:proposal.retirementsProposal},'historical-records':history,'portfolio-snapshots':snapshot,'review-manifest':metadata}))await writeFile(`${root}/${name}.json`,JSON.stringify(value,null,2)+'\n');
 const old=new Map(history.map(h=>[h.before.id,h.before]));
 let review='# PACE-RAG v1.6 professional knowledge content review\n\nStatus: **DRAFT — owner publication approval required.** No runtime source, cached answer, index pointer, portfolio package or public release was changed. Proposed status remains draft (retired answers remain retired).\n\nAuthority: '+proposal.sourceAuthority+'\n\nHashes are calculated with the existing approvalHash/normalizeText tooling. They are review targets, not approvals. Current v1 records are preserved in historical-records.json; exact portfolio sections and their hashes are in portfolio-snapshots.json and review-manifest.json.\n\n## Sources (proposed version 2)\n\n';
 for(const d of corpus.documents.filter(d=>Object.hasOwn(proposal.documents,d.id))){const prior=old.get(d.id);review+=`### ${d.id} — ${d.title}\n\nCitation: ${d.canonicalUrl}\n\nBefore (v${prior.version}): ${prior.text}\n\nProposed (v${d.version}): ${d.text}\n\nSource text hash: ${d.contentHash}\n\n`;}
 review+='## All affected answer records\n\nSeven wording revisions, five new entries and eleven citation-only rebindings are listed below. Canonical IDs are retained. Two retired stack-availability answers stay retired; their historical text must not be presented as a current answer.\n\n';
 for(const a of changes.filter(r=>r.canonicalQuestion)){const prior=old.get(a.id);review+=`### ${a.id} (v${a.version}, ${a.status})\n\nQuestion: ${a.canonicalQuestion}\n\nBefore: ${prior?.answerText||'New candidate; no existing record.'}\n\nProposed: ${a.answerText}\n\nAlternatives: ${a.alternatives.map(q=>q.text).join(' | ')||'None'}\n\nCitations: ${a.citations.map(c=>`${c.sourceId} v${c.documentVersion} — ${c.url} — ${c.sourceHash}`).join('; ')}\n\nProposed approval hash: ${approvalHash(a)}\n\n`;}
 review+='## Additional approval boundaries\n\nThe proposal removes only the four refreshed source IDs from retrievalExcludedDocuments after approval, because obsolete source wording is replaced. Existing answerIds retirements, all technology records and all other source scopes remain unchanged. Source licensing must be explicitly renewed for publication; draft source records carry a pending permission label.\n\nThe eight requested questions use five new answers plus alternatives on modernisation, wensymes-work and rental-mobile, avoiding a second duplicate answer for remote rental reporting. RBAC is a boundary answer that states implementation is not established, not an affirmative implementation claim. Unrecognized paraphrases still suggest reviewed questions or abstain.\n\nReview this complete file and review-manifest.json, including citation-only rebindings. Authorizing these portfolio claims previously did not grant record-level cache publication approval. The simulated evaluation reports are separate and must also be reviewed: development Top-1 regresses and semantic Top-3 regresses on both preserved verification sets. No release-quality acceptance is claimed.\n';
 await writeFile(`${root}/REVIEW.md`,review);
 console.log(JSON.stringify({documents:metadata.changes.filter(r=>r.kind==='document').length,answerChanges:metadata.changes.filter(r=>r.kind==='answer').length,changeKinds:Object.fromEntries([...new Set(metadata.changes.map(r=>r.changeKind))].map(k=>[k,metadata.changes.filter(r=>r.changeKind===k).length])),publicationApproved:false},null,2));return metadata;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await stageProfessionalV16();
