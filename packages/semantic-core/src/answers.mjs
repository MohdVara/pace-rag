import { answerCurrent, sourceCurrent, normalizeQuestion } from './retrieval.mjs';
import { ensure } from '../../knowledge-schema/src/validate.mjs';
const status = doc => doc.provenance==='synthetic'?'synthetic-lab':doc.provenance==='implementation-documentation'?'public-demonstrated':'owner-confirmed';
export function answerSource(doc) {return {sourceId:doc.id,corpusId:doc.corpusId,documentVersion:doc.version,sourceHash:doc.contentHash,title:doc.title,url:doc.canonicalUrl,evidenceStatus:status(doc),sourceType:doc.provenance,approvalScope:doc.approval?.scope||'publication'};}
const sourceFor = (corpus,id) => {const doc=corpus.documents.find(d=>d.id===id);return sourceCurrent(doc,corpus)?answerSource(doc):null;};
const compact = values => [...new Set(values)];
const aliases = [
 ['PHP 5',/\bphp\s*5\b/i],['PHP 8',/\bphp\s*8\b/i],['MySQL 5.7',/\bmysql\s*5\.7\b/i],
 ['React',/\breact(?:js|\.js)?\b/i],['Next.js',/\bnext(?:\.?js)\b/i],['Node.js',/\bnode(?:\.?js)?\b/i],['Laravel',/\blaravel\b/i],['Symfony',/\bsymfony\b/i],['Ruby on Rails',/\bruby\b|\brails\b/i],['Kubernetes',/\bkubernetes\b|\bk8s\b/i],['Docker',/\bdocker\b/i],['Playwright',/\bplaywright\b/i],['PostgreSQL',/\bpostgres(?:ql)?\b/i],['MySQL',/\bmysql\b/i],['Nginx',/\bnginx\b/i],['Apache',/\bapache\b/i],['PHP Data Objects (PDO)',/\bpdo\b|php data objects|php.*without.*framework|plain php/i],['PHPMaker',/\bphpmaker\b/i],['PHP',/\bphp\b/i],['AWS EC2',/\baws\s+ec2\b/i],['AWS ECS',/\baws\s+ecs\b/i],['AWS',/\baws\b|amazon web services/i],['Google Cloud (GCP)',/\bgcp\b|google cloud/i],['Microsoft Azure',/\bazure\b/i],
];
const projects=[['insurance',/policystreet|insurance(?: comparison)?(?: platform)?/i],['campus',/education|campus/i],['wensymes',/wensymes/i],['rental',/rental/i],['hostel',/hostel/i],['asset',/asset management/i]];
const allTech = record => compact(record.generations.flatMap(g=>g.groups.flatMap(group=>group.technologies)));
function followups(corpus,excluded=[],sourceIds=[]) {return corpus.answers.filter(a=>answerCurrent(a,corpus)&&!excluded.includes(a.id)).sort((a,b)=>Number(b.citations.some(c=>sourceIds.includes(c.sourceId)))-Number(a.citations.some(c=>sourceIds.includes(c.sourceId)))).slice(0,3).map(a=>a.canonicalQuestion);}
const unsupported = /\b(exact|traffic|salary|pricing|price|revenue|uptime|certif\w*|expert\w*|guarantee\w*|absent|every|secure|vulnerab\w*|password\w*|secret\w*|immediately|availability|million|scale|topology|undisclosed|confidential|private|personally|sole|administer\w*|designed|implemented security|production.ready)\b|ignore (?:all|the|previous)|system prompt|\bnot\b|\bnever\b|\bdidn['’]?t\b/i;
function compose(question,corpus) {
  if(corpus.corpusId!=='portfolio'||!corpus.technologyEvidence||unsupported.test(question))return null;
  const data=corpus.technologyEvidence;
  const q=normalizeQuestion(question);
  // Closed, evidence-bounded question grammar. Additional requested predicates cannot
  // silently collapse to a simpler technology question (e.g. React + an unknown tool).
  if (/\b(and|with|using|plus)\b.*\b(rust|svelte|angular|terraform|oracle|redis|mongodb|neo4j|vue|django|python|java|dotnet|\.net|go)\b|\b(rust|svelte|angular|terraform|oracle|redis|mongodb|neo4j|vue|django|python|java|dotnet)\b/i.test(q)) return {insufficient:true,explanation:'The approved project technology inventory does not support the complete technology relationship in this question.'};
  if (/^how\b|\b(why|when|version|minor|cheaper|architecture|migration sequence|migrated|migrate|replaced|replace|cost|faster|benefit|best|recommend|certified|expert|built|build|design|security|security controls|traffic|production|learning|learned|how long|years)\b/i.test(q)) return null;
  const projectIds=projects.filter(([,re])=>re.test(q)).map(([id])=>id);
  const requested=aliases.filter(([,re])=>re.test(q)).map(([name])=>name).filter(name=>!(name==='PHP'&&/pdo|plain php|without.*framework|php\s*[58]/i.test(q))&&!(name==='MySQL'&&/mysql\s*5\.7/i.test(q))&&!(name==='AWS'&&/aws\s+ec[2s]/i.test(q)));
  // Do not drop an unrecognized constraint from a fact query. Supported wording
  // is deliberately narrow; richer predicates return to suggestions/evidence review.
  let residual=q;
  for (const [,pattern] of [...aliases,...projects]) residual=residual.replace(new RegExp(pattern.source,'gi'),' ');
  const grammar=new Set('named hosting infrastructure orchestration microsoft amazon for do did does can is are was were to it we us what which where has have had he his you your this engineer owner confirmed professional professionally experience experienced worked work with on at in of and or the a an used use uses using involved involve projects project engagements engagement systems system technologies technology stacks stack frameworks framework cloud clouds platforms platform databases database data stores backend frontend application web servers server tooling engineering tools inventory legacy modern changed changes between generation generations only list tell me about without been management options categories associated associatedwith'.split(' '));
  if ((residual.match(/[a-z0-9]+/g)||[]).some(word=>!grammar.has(word))) return null;
  const stack=/technolog|stack|framework|database|cloud|hosting|infrastructure|orchestrat|backend|frontend|web servers?|engineering tools?/i.test(q);
  const exploratory=/\b(what|which|where|how|have|has|do|does|did|tell|list|show|describe|experience|worked|used|uses|using|involved|involve)\b/i.test(q);
  if(!exploratory||(!stack&&!requested.length))return null;
  if (projectIds.length && !stack && !/which projects|which engagements|where.*used|experience.*with|have.*used/i.test(q)) return null;
  let records=data.records.filter(r=>!projectIds.length||projectIds.includes(r.canonicalProjectId));
  if(/professionally|professional engagements/i.test(q)&&!projectIds.length)records=records.filter(r=>r.selectedWorkId);
  let used=records, answer, factIds=[];
  const has=(value,tech)=>tech==='AWS'?/^AWS /.test(value):tech==='PHP'?/PHP/.test(value):tech==='MySQL'?/^MySQL(?: |$)/.test(value):value===tech;
  if(requested.length) {
    used=records.filter(r=>requested.every(tech=>allTech(r).some(value=>has(value,tech))));
    if(!used.length)return {insufficient:true,explanation:'The owner-confirmed inventory does not establish that project-to-technology relationship. It does not establish absence of experience outside the inventory.'};
    answer=requested.map(tech=>`${tech} is owner-confirmed for ${used.map(r=>{
      const generations=r.generations.filter(g=>g.groups.some(group=>group.technologies.some(value=>has(value,tech))));
      return `${r.projectTitle}${generations.some(g=>g.label)?` (${generations.map(g=>g.label).join(' and ')})`:''}`;
    }).join('; ')}.`).join(' ');
    if(used.some(r=>r.canonicalProjectId==='hostel'))answer+=' Hostel is an unmaintained historical presentation project, not production-ready software.';
    if(used.some(r=>r.canonicalProjectId==='asset'))answer+=' The Asset inventory does not specify an employer, period or ownership scope.';
  } else if(projectIds.length===1) {
    const record=records[0];used=[record];
    let generations=record.generations;
    if(/legacy/.test(q)&&!/modern|changed|between|compar/.test(q))generations=generations.filter(g=>g.legacy);
    else if(/modern/.test(q)&&!/legacy|changed|between|compar/.test(q))generations=generations.filter(g=>!g.legacy);
    if(!generations.length)return {insufficient:true,explanation:'The approved inventory does not define that technology generation for this project.'};
    answer=`${record.projectTitle}: ${generations.map(g=>`${g.label||'confirmed stack'} — ${allTech({generations:[g]}).join(', ')}`).join('. ')}.`;
    if(record.canonicalProjectId==='campus')answer+=' These are separate generation inventories, not a single deployment or a completed migration claim.';
    if(record.note&&record.canonicalProjectId==='hostel')answer+=' Historical, unmaintained presentation code; not production-ready or evidence of modern security practice.';
  } else {
    const group=/databas|\bdata stores\b/i.test(q)?/database|data/i:/cloud|hosting|environments/i.test(q)&&!/framework|technolog|stack/.test(q)?/cloud|hosting/i:/framework/i.test(q)&&!/cloud|platform|technolog|stack/.test(q)?/application|frontend|backend/i:null;
    const includeGroup=item=>!group||group.test(item.label)||(group.source==='cloud|hosting'&&item.technologies.some(value=>/^AWS /.test(value)));
    used=records.filter(r=>r.generations.some(g=>g.groups.some(includeGroup)));
    const technologies=compact(used.flatMap(r=>r.generations.flatMap(g=>g.groups.filter(includeGroup).flatMap(item=>item.technologies)))).filter(value=>group?.source!=='cloud|hosting'||/^(AWS |Google Cloud|Microsoft Azure|On-premises|Third-party)/.test(value));
    if(!technologies.length)return null;
    answer=`The owner-confirmed ${group?'requested technology':'project technology'} inventory includes ${technologies.join(', ')}.`;
    if(records.some(r=>r.canonicalProjectId==='hostel'))answer+=' Plain PHP/PDO in Hostel is historical and unmaintained; PHP 5 and MySQL 5.7 belong to legacy education systems.';
    answer+=' The inventory records technologies involved, without establishing sole infrastructure ownership or deployment scale.';
  }
  factIds=used.map(r=>r.canonicalProjectId);
  if(answer.split(/\s+/).length>120)return {insufficient:true,explanation:'This question spans more verified facts than the concise answer limit; ask about one project or technology.'};
  const sourceIds=used.length<=4?used.map(r=>`technology-${r.canonicalProjectId}`):['technology-inventory'];
  const sources=sourceIds.map(id=>sourceFor(corpus,id));if(sources.some(s=>!s))return null;
  return {answer,origin:'approved-composite',retrievalMethod:'structured-facts',sources,relatedQuestions:['Which projects used React?','Which projects involved AWS?','Which technologies were used in legacy education systems?'].filter(q=>normalizeQuestion(q)!==normalizeQuestion(question)).slice(0,3),evidenceStatus:['owner-confirmed'],explanation:'Deterministic template assembled only from the imported owner-confirmed public technology inventory; no language model used.',corpusVersion:corpus.corpusVersion,answerVersion:data.contentVersion,usedFactIds:factIds,approvalScope:'local-test'};
}
export function cacheAnswer(record,corpus,method='exact-match') {
  if(!answerCurrent(record,corpus))return null;
  const sources=record.citations.map(c=>sourceFor(corpus,c.sourceId)).filter(Boolean).slice(0,4);
  if(sources.length!==record.citations.length)return null;
  return {answer:record.answerText,answerId:record.id,origin:'approved-cache',retrievalMethod:method,sources,relatedQuestions:followups(corpus,[record.id],record.citations.map(c=>c.sourceId)),evidenceStatus:compact(sources.map(s=>s.evidenceStatus)),explanation:'Existing reviewed answer reused with its own supporting citations. Similarity-ranked passages are separate.',corpusVersion:corpus.corpusVersion,answerVersion:record.version,approvalScope:record.approval?.scope||'publication',...(/engagement|contact|availability/.test(record.matchPolicy.intent)&&corpus.corpusId==='portfolio'?{nextAction:{label:'Discuss a relevant engineering need',href:'https://cal.com/mohd-paramasvara/discovery'}}:{})};
}
export function resolveAnswer({question,corpus,retrieval}) {
  // Structured technology facts supersede old stack-availability wording.
  const composite=compose(question,corpus);
  if(composite&&!composite.insufficient)return validateAnswerResult(composite,corpus);
  const cached=retrieval?.selectedAnswer&&cacheAnswer(retrieval.selectedAnswer,corpus,retrieval.reasons?.[0]?.startsWith('Exact')?'exact-match':retrieval.method==='semantic'?'semantic-cache':'lexical-cache');
  if(cached&&!composite?.insufficient)return validateAnswerResult(cached,corpus);
  return {answer:null,origin:'insufficient-evidence',retrievalMethod:'document-retrieval',sources:[],relatedQuestions:(retrieval?.answerCandidates||[]).map(c=>corpus.answers.find(a=>a.id===c.answerId)).filter(a=>a&&answerCurrent(a,corpus)).map(a=>a.canonicalQuestion).slice(0,3),evidenceStatus:['insufficient'],explanation:composite?.explanation||'The approved evidence does not establish a direct answer to this wording. Nearby questions and passages are relevance suggestions, not supporting proof.',corpusVersion:corpus.corpusVersion};
}
export function validateAnswerResult(value,corpus) {
  ensure(value&&value.corpusVersion===corpus.corpusVersion,'Stale answer version');
  ensure(['approved-cache','approved-composite','live-generation','insufficient-evidence'].includes(value.origin),'Invalid answer origin');
  ensure(Array.isArray(value.sources)&&value.sources.length<=4&&Array.isArray(value.relatedQuestions)&&value.relatedQuestions.length<=3,'Invalid answer references');
  if(value.origin==='insufficient-evidence')ensure(value.answer===null&&value.sources.length===0,'Insufficient evidence cannot be an answer');
  else ensure(typeof value.answer==='string'&&value.answer.trim().split(/\s+/).length<=120&&!/\n\s*\n/.test(value.answer)&&value.sources.length>0,'Answer must be one bounded paragraph with sources');
  for(const source of value.sources){const doc=corpus.documents.find(d=>d.id===source.sourceId);ensure(sourceCurrent(doc,corpus)&&source.corpusId===corpus.corpusId&&source.url===doc.canonicalUrl&&source.sourceHash===doc.contentHash&&source.documentVersion===doc.version,'Invalid answer source');}
  if(value.origin==='approved-cache')ensure(corpus.answers.some(a=>a.id===value.answerId&&answerCurrent(a,corpus)&&a.answerText===value.answer),'Cache answer not reviewed');
  if(value.origin==='approved-composite')ensure(corpus.technologyEvidence&&value.usedFactIds?.every(id=>corpus.technologyEvidence.records.some(r=>r.canonicalProjectId===id)),'Composite facts not approved');
  return value;
}
export function validateRemoteGeneration(value,{corpus,requestId,passages}) {
  ensure(value&&value.requestId===requestId&&['generated','insufficient-evidence','unavailable'].includes(value.kind),'Invalid remote response');
  if(value.kind==='generated'){
    ensure(value.corpusId===corpus.corpusId&&value.corpusVersion===corpus.corpusVersion&&Array.isArray(value.claims)&&Array.isArray(value.citations),'Stale generation');
    const ids=new Set(passages.map(p=>p.id));ensure(value.claims.length>0&&value.claims.length<=6&&value.claims.every(c=>typeof c.text==='string'&&c.sourceIds?.length&&c.sourceIds.every(id=>ids.has(id))),'Invalid generated claims');
    ensure(value.claims.map(c=>c.text).join(' ').trim().split(/\s+/).length<=120,'Generated answer exceeds 120 words');
    ensure(value.citations.length>0&&value.citations.length<=4,'Invalid generated citations');
    const citedDocs=new Set(value.citations.map(c=>c.sourceId));
    ensure(value.claims.every(claim=>claim.sourceIds.every(id=>citedDocs.has(passages.find(p=>p.id===id)?.documentId))),'Missing claim citation');
    for(const citation of value.citations){const doc=corpus.documents.find(d=>d.id===citation.sourceId);ensure(sourceCurrent(doc,corpus)&&citation.corpusId===corpus.corpusId&&citation.url===doc.canonicalUrl&&citation.sourceHash===doc.contentHash&&citation.documentVersion===doc.version&&passages.some(p=>p.citation.sourceId===citation.sourceId),'Unauthorized generated source');}
    ensure(value.usage&&['conservative-estimate','provider-token-usage'].includes(value.usage.basis)&&Number.isFinite(value.usage.accountedNeurons)&&value.usage.accountedNeurons>=0,'Invalid provider usage');
  } else if(value.kind==='unavailable')ensure(typeof value.error?.code==='string'&&typeof value.error.message==='string'&&value.error.message.length<1000,'Invalid error response');
  else ensure(typeof value.message==='string'&&value.message.length<1000,'Invalid insufficient response');
  return value;
}
export function generatedAnswer(value,corpus) {
  ensure(value.kind==='generated','No generated answer');
  return validateAnswerResult({answer:value.claims.map(c=>c.text).join(' '),origin:'live-generation',retrievalMethod:'live-rag',sources:value.citations.map(c=>answerSource(corpus.documents.find(d=>d.id===c.sourceId))),relatedQuestions:[],evidenceStatus:compact(value.citations.map(c=>status(corpus.documents.find(d=>d.id===c.sourceId)))),explanation:'Explicit guarded remote generation; source membership was validated. Claim entailment still needs review.',corpusVersion:corpus.corpusVersion,answerVersion:value.modelId},corpus);
}
