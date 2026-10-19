import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {loadContent,chunksFor} from './indexing/content.mjs';
import {scopeCorpus} from '../packages/semantic-core/src/scope.mjs';
import {retrieve} from '../packages/semantic-core/src/retrieval.mjs';
import {resolveAnswer,validateAnswerResult} from '../packages/semantic-core/src/answers.mjs';
import {entityById} from '../packages/semantic-core/src/technology/ontology.mjs';
export async function workedExample(){
 const data=await loadContent('portfolio',{release:true});
 const pointer=JSON.parse(await readFile('apps/rag-lab/public/knowledge/portfolio/current.json','utf8'));
 const corpus=scopeCorpus({...data,corpusVersion:pointer.corpusVersion,chunks:chunksFor(data,pointer.corpusVersion)},'professional');
 const question='Which PHP frameworks have you used?';
 const answer=resolveAnswer({question,corpus,retrieval:retrieve({question,corpus})});
 validateAnswerResult(answer,corpus);
 if(answer.origin!=='approved-composite'||!answer.entityTrace||answer.entityTrace.semanticFallbackNeeded)throw Error('Worked example no longer resolves from approved facts');
 const trace=answer.entityTrace;
 return {schemaVersion:1,softwareVersion:JSON.parse(await readFile('package.json','utf8')).version,corpusVersion:corpus.corpusVersion,evidenceHash:data.technologyEvidence.contentHash,question,origin:answer.origin,category:{language:trace.recognizedEntities.map(e=>e.canonicalName).join(', '),categories:trace.categoriesUsed},technologies:[...new Set(trace.matchedFacts.map(f=>entityById.get(f.technologyId).canonicalName))],mappings:trace.matchedFacts.map(f=>({projectId:f.projectId,projectTitle:data.technologyEvidence.records.find(r=>r.canonicalProjectId===f.projectId).projectTitle,technology:entityById.get(f.technologyId).canonicalName,generation:f.generation,sourceId:f.evidenceId})),answer:answer.answer,sources:answer.sources,trace,workersAiInferenceCalls:0,measurement:'Local deterministic build-time execution against the publication-approved registry; not a captured production session.'};
}
export async function writeWorkedExample(output='dist/lab'){
 const value=await workedExample();
 await mkdir(resolve(output,'examples'),{recursive:true});await writeFile(resolve(output,'examples/php-frameworks.json'),JSON.stringify(value,null,2)+'\n');
 return value;
}
