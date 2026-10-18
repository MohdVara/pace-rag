import {entities,entityById,inventoryEntity,ONTOLOGY_VERSION,normalizeEntity} from './ontology.mjs';
import {sourceCurrent} from '../retrieval.mjs';
const techContext=/\b(projects?|systems?|stack|technolog\w*|frameworks?|languages?|databases?|runtime|servers?|cloud|used?|using|worked|experience|developed|applications?|containers?|orchestration|hosting|platforms?|tools?)\b/i;
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const aliases=entities.flatMap(e=>[e.canonicalName,...e.aliases].map(alias=>({e,alias,pattern:new RegExp(`(?<![a-z0-9])${normalizeEntity(alias).split(' ').map(escape).join('[\\s.()_-]+')}(?![a-z0-9])`,'gi')}))).sort((a,b)=>b.alias.length-a.alias.length);
export function recognizeEntities(query){
 const input=query.normalize('NFKC'),matched=[],occupied=[];
 for(const item of aliases){if((['Rails','RoR','Apache','JS','TS','EC2','ECS','Symphony PHP'].includes(item.alias))&&!techContext.test(input))continue;
  item.pattern.lastIndex=0;for(const match of input.matchAll(item.pattern)){const start=match.index,end=start+match[0].length;if(occupied.some(([a,b])=>start<b&&end>a))continue;occupied.push([start,end]);matched.push({id:item.e.id,canonicalName:item.e.canonicalName,matchedAlias:match[0],categories:item.e.categories,start,end});}}
 return matched.sort((a,b)=>a.start-b.start);
}
const projectNames=[['insurance',/\bpolicystreet\b|\binsurance(?: comparison)?(?: platform)?\b/gi],['campus',/\beducation(?: platform)?(?: moderni[sz]ation)?(?: systems?)?\b|\bcampus\b/gi],['wensymes',/\bwensymes(?: hr)?\b/gi],['rental',/\brental(?: management)?(?: system)?\b/gi],['hostel',/\bhostel(?: management)?(?: system)?\b/gi],['asset',/\basset(?: management)?(?: system)?\b/gi]];
const unsupported=/\b(exact|only|traffic|salary|revenue|uptime|certif\w*|expert\w*|guarantee\w*|secure|vulnerab\w*|password\w*|secret\w*|private|confidential|personally|sole|ownership|administer\w*|performance|improv\w*|speed|faster|cheaper|cost|pricing|benefit|outcome\w*|architecture|topology|why|when|years?|duration|learn\w*|recommend\w*|best|migrat\w*|replaced|never|not|without security)\b|how (?:much|long)|ignore (?:all|the|previous)|system prompt/i;
const unknown=/\b(angular|vue(?:js)?|rust|svelte|terraform|oracle|redis|mongodb|neo4j|django|python|java|dotnet|kafka|express|fastify)\b/i;
const grammar=new Set('a an the what which where have has had you your he his this engineer owner confirmed documented approved used use uses using work worked experience experienced with in at on for of and or versus vs both to from do did does can is are was were projects project systems system applications application technologies technology tech technical stacks stack frameworks framework frontend backend front end back language languages ecosystem ecosystems development develop developed programming web ui libraries library runtime runtimes relational databases database data stores servers server reverse proxies proxy container containers orchestration orchestrate platforms platform services service compute cloud clouds hosting environments environment tools tool tooling testing automation browser modern legacy generations generation php versions version without any only plain involved involving involvedwith list show tell me about please named known usedprofessionally professionally professional some records inventory include includes belong belongs based basedon comparison compare between changes changed been modernisation modernization'.split(' '));
function categoryFor(q){
 if(/relational\s+(?:databases?|data stores?)/i.test(q))return{label:'relational databases',discipline:'relational-databases'};
 if(/container orchestration|orchestrat/i.test(q))return{label:'container orchestration',category:'container-orchestration'};
 if(/(?:frontend|front.end|ui)/i.test(q)&&/framework|librar|technolog|development/i.test(q))return{label:'frontend development',discipline:'frontend-development'};
 if(/backend frameworks?|back.end frameworks?/i.test(q))return{label:'backend frameworks',category:'backend-framework'};
 if(/testing (?:tools?|frameworks?)|browser automation/i.test(q))return{label:'testing tools',category:'testing-tool'};
 if(/frameworks?/i.test(q))return{label:'frameworks',category:'framework'};
 if(/databases?|data stores?/i.test(q))return{label:'databases',category:'database'};
 if(/reverse prox/i.test(q))return{label:'reverse proxies',discipline:'reverse-proxy'};
 if(/web servers?/i.test(q))return{label:'web servers',category:'web-server'};
 if(/hosting/i.test(q))return{label:'hosting environments',category:'hosting'};
 if(/cloud (?:platforms?|providers?)|clouds/i.test(q))return{label:'cloud platforms',category:'cloud-platform'};
 if(/cloud services?|aws technologies|aws services/i.test(q))return{label:'cloud services',category:'cloud-service'};
 if(/runtimes?/i.test(q))return{label:'runtimes',category:'runtime'};
 if(/container(?:s| technology| tooling| platforms?)/i.test(q))return{label:'container tooling',category:'containers'};
 if(/testing tools?|browser automation/i.test(q))return{label:'testing tools',category:'testing-tool'};
 if(/programming languages?/i.test(q))return{label:'programming languages',category:'language'};
 return null;
}
function categoryMatches(e,cat){if(!cat)return true;if(cat.discipline)return e.disciplines?.includes(cat.discipline);if(cat.category==='framework')return e.categories.some(c=>c.endsWith('-framework'));if(cat.category==='hosting')return e.categories.includes('cloud-platform')||e.categories.includes('cloud-service')||e.categories.includes('hosting-environment');if(cat.category==='cloud-platform')return e.id==='third-party-cloud'||e.categories.includes('cloud-platform')||e.partOf?.some(id=>entityById.get(id).categories.includes('cloud-platform'));if(cat.category==='containers')return e.categories.includes('container-platform')||e.categories.includes('container-orchestration');if(cat.category==='language')return e.categories.includes('programming-language')||e.ecosystem?.length;return e.categories.includes(cat.category);}
export function projectFacts(corpus){
 if(corpus.corpusId!=='portfolio'||(corpus.scopeId&&corpus.scopeId!=='professional'))return[];
 const facts=[];for(const record of corpus.technologyEvidence?.records||[]){const evidenceId=`technology-${record.canonicalProjectId}`,doc=corpus.documents.find(d=>d.id===evidenceId);if(!sourceCurrent(doc,corpus)||doc.upstreamHash!==record.contentHash)continue;
  for(const generation of record.generations)for(const group of generation.groups)for(const name of group.technologies){const e=inventoryEntity(name);if(!e)continue;facts.push({projectId:record.canonicalProjectId,technologyId:e.id,generation:generation.label||(record.legacy?'Historical project':'Unspecified generation'),legacy:!!generation.legacy||!!record.legacy,evidenceId,evidenceHash:record.contentHash});}}
 return facts;
}
const unique=a=>[...new Set(a)];
/** Closed interpretation. No symmetric/transitive project-usage expansion. */
export function resolveTechnology(question,corpus){
 if(corpus.corpusId!=='portfolio'||(corpus.scopeId&&corpus.scopeId!=='professional')||!corpus.technologyEvidence)return undefined;
 const recognized=recognizeEntities(question),q=question.normalize('NFKC').toLowerCase().replace(/[?!.]+$/,'');let categoryText=q;for(const e of [...recognized].reverse())categoryText=categoryText.slice(0,e.start)+' '.repeat(e.end-e.start)+categoryText.slice(e.end);let category=categoryFor(categoryText);if(/php.*without (?:a |any )?framework|plain php/.test(q))category=null;
 if(/framework/i.test(q)&&/cloud|hosting/i.test(q))return undefined; // Existing bounded inventory template covers this combined inventory request.
 const trace={originalQuery:question,ontologyVersion:ONTOLOGY_VERSION,evidenceVersion:corpus.technologyEvidence.contentVersion,intent:'unresolved',recognizedEntities:recognized.map(({start,end,...e})=>e),categoriesUsed:category?[category.label]:[],relationships:[],matchedFacts:[],semanticFallbackNeeded:true,reason:''};
 const fail=(reason,handled=true)=>({handled,insufficient:true,trace:{...trace,reason},explanation:reason});
 // Never let a partial technology interpretation answer another substantive predicate.
 if(unsupported.test(q))return recognized.length||category?fail('The inventory does not establish the requested metrics, architecture, ownership, expertise or other unsupported detail.'):undefined;
 if(unknown.test(q))return fail('That complete technology relationship is not documented in the approved project inventory. Not documented does not mean never used.');
 if((!techContext.test(q)&&!category)||(!recognized.length&&!category))return undefined;
 const pids=[];let residual=q;for(const [id,regex]of projectNames){regex.lastIndex=0;if(regex.test(q))pids.push(id);}
 // Remove only recognized spans and closed category/search vocabulary; extra constraints abstain.
 residual=q;for(const e of [...recognized].reverse())residual=residual.slice(0,e.start)+' '.repeat(e.end-e.start)+residual.slice(e.end);
 for(const [,regex]of projectNames){regex.lastIndex=0;residual=residual.replace(regex,' ');}
 if((residual.match(/[\p{L}\p{N}]+/gu)||[]).some(w=>!grammar.has(w)))return fail('This wording includes constraints outside the supported technology lookup. Try a project, technology or category question.');
 const all=projectFacts(corpus);let facts=all.filter(f=>!pids.length||pids.includes(f.projectId));
 if(/professionally|professional engagements/.test(q)&&!pids.length)facts=facts.filter(f=>corpus.technologyEvidence.records.find(r=>r.canonicalProjectId===f.projectId).selectedWorkId);
 const legacy=/\blegacy\b/.test(q),modern=/\bmodern\b/.test(q);if(legacy&&!modern)facts=facts.filter(f=>f.legacy);else if(modern&&!legacy)facts=facts.filter(f=>!f.legacy);
 const ids=unique(recognized.map(e=>e.id));const languages=ids.filter(id=>['php','javascript','ruby','typescript'].includes(id));
 const versionQuery=/\bversions?\b/.test(q);if(versionQuery){if(!pids.length||!languages.length)return fail('Version lookup needs a named project and language; unrecorded versions cannot be inferred.');facts=facts.filter(f=>entityById.get(f.technologyId).versionOf?.some(id=>languages.includes(id)));}
 else if(category){facts=facts.filter(f=>categoryMatches(entityById.get(f.technologyId),category));if(languages.length)facts=facts.filter(f=>languages.every(id=>f.technologyId===id||entityById.get(f.technologyId).ecosystem?.includes(id)||entityById.get(f.technologyId).versionOf?.includes(id)));const direct=ids.filter(id=>!languages.includes(id));if(direct.length)facts=facts.filter(f=>direct.some(id=>f.technologyId===id||entityById.get(f.technologyId).partOf?.includes(id)));}
 else if(ids.length){facts=facts.filter(f=>ids.some(id=>f.technologyId===id||entityById.get(f.technologyId).versionOf?.includes(id)||entityById.get(f.technologyId).partOf?.includes(id)||(['php','javascript','ruby'].includes(id)&&entityById.get(f.technologyId).ecosystem?.includes(id))));}
 else return undefined;
 if(/php.*without (?:a |any )?framework|plain php/.test(q)){facts=facts.filter(f=>f.technologyId==='plain-php'||f.technologyId==='pdo');trace.categoriesUsed=['explicit plain PHP / PDO'];}
 const comparative=/\bversus\b|\bvs\b|\bcompare\b/.test(q);if(comparative&&ids.length<2)return fail('Comparison needs two recognized technologies or platforms.');
 // Conjunction requires a project satisfying every requested direct technology, not a union.
 if(!comparative&&ids.length>1&&!category&&!versionQuery){const valid=new Set(facts.filter(f=>ids.every(id=>facts.some(other=>other.projectId===f.projectId&&(other.technologyId===id||entityById.get(other.technologyId).partOf?.includes(id))))).map(f=>f.projectId));facts=facts.filter(f=>valid.has(f.projectId));}
 trace.intent=versionQuery?'project-versions':comparative?'comparison':category?'category-to-project':pids.length?'project-to-technology':languages.length?'language-ecosystem':'technology-to-project';
 if(!facts.length)return fail('The selected project records do not document that technology relationship. Not documented does not mean never used.');
 for(const fact of facts){const e=entityById.get(fact.technologyId);for(const target of e.builtOn||[])trace.relationships.push({from:e.id,relation:'built-on',to:target});for(const id of ids){if(e.versionOf?.includes(id))trace.relationships.push({from:e.id,relation:'version-of',to:id});if(e.partOf?.includes(id))trace.relationships.push({from:e.id,relation:'part-of-platform',to:id});if(e.ecosystem?.includes(id))trace.relationships.push({from:e.id,relation:'belongs-to-language-ecosystem',to:id});}if(category){if(category.category==='cloud-platform'&&e.partOf?.length)for(const to of e.partOf)trace.relationships.push({from:e.id,relation:'part-of-platform',to});else trace.relationships.push({from:e.id,relation:category.discipline||e.id==='third-party-cloud'?'relevant-to-technical-discipline':'is-a',to:e.id==='third-party-cloud'?'broad unnamed cloud hosting':category.label});}}
 trace.relationships=trace.relationships.filter((r,i,a)=>a.findIndex(x=>JSON.stringify(x)===JSON.stringify(r))===i);
 trace.matchedFacts=facts.map(({projectId,technologyId,generation,evidenceId})=>({projectId,technologyId,generation,evidenceId}));
 const projects=corpus.technologyEvidence.records,usedIds=unique(facts.map(f=>f.projectId));
 const title=f=>projects.find(r=>r.canonicalProjectId===f.projectId).projectTitle+(f.generation!=='Unspecified generation'?` (${f.generation})`:'');
 const techIds=unique(facts.map(f=>f.technologyId));let text;
 if(comparative){text=ids.map(id=>{const matches=facts.filter(f=>f.technologyId===id||entityById.get(f.technologyId).partOf?.includes(id));return `${entityById.get(id).canonicalName}: ${unique(matches.map(title)).join('; ')||'not documented in this inventory'}`;}).join('. ')+'. Provider groups need not be mutually exclusive.';}
 else text=techIds.map(id=>{const e=entityById.get(id),names=unique(facts.filter(f=>f.technologyId===id).map(title));return `${e.canonicalName} (${e.description.replace(/\.$/,'')}) is owner-confirmed in ${names.join('; ')}.`;}).join(' ');
 if(facts.some(f=>f.technologyId==='rails'))text+=' This supports Ruby ecosystem experience through Rails, not an additional standalone Ruby deployment.';
 if(usedIds.includes('hostel'))text+=' Hostel is historical, unmaintained presentation code, not production-ready software.';
 if(usedIds.includes('asset'))text+=' Asset records do not specify employer, period or ownership scope.';
 if(text.split(/\s+/).length>120){text=`The approved inventory documents ${techIds.map(id=>entityById.get(id).canonicalName).join(', ')} across ${usedIds.length} project records${category?` for ${category.label}`:''}. See the cited technology inventory for the complete project mapping. Technology involvement does not establish sole ownership or production scale.`;}
 if(text.split(/\s+/).length>120)return fail('Ask about fewer projects or technologies to keep the response within its evidence limit.');
 trace.semanticFallbackNeeded=false;trace.reason='Directed classification applied only to approved project facts; no remote inference.';
 const sourceIds=usedIds.length<=4?usedIds.map(id=>`technology-${id}`):['technology-inventory'];
 const documents=sourceIds.map(id=>corpus.documents.find(d=>d.id===id));if(documents.some(doc=>!sourceCurrent(doc,corpus)))return fail('Current supporting project evidence is unavailable.');
 return{handled:true,text,documents,usedIds,trace};
}
