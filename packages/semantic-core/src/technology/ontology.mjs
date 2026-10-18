// General classifications only. Project experience is NEVER stored in this registry.
export const ONTOLOGY_VERSION='pace-ontology-v1.3.0';
const e=(id,canonicalName,aliases,categories,description,source,relations={})=>({id,canonicalName,aliases,categories,description,source,...relations});
/** @type {import('../../../knowledge-schema/src/contracts').TechnologyEntity[]} */
export const entities=[
 e('php','PHP',[],['programming-language'],'PHP programming language.','https://www.php.net/manual/en/intro-whatis.php'),
 e('php-5','PHP 5',[],['programming-language'],'PHP 5 version family.','https://www.php.net/manual/en/migration70.php',{versionOf:['php']}),
 e('php-8','PHP 8',[],['programming-language'],'PHP 8 version family.','https://www.php.net/releases/8.0/en.php',{versionOf:['php']}),
 e('plain-php','Plain PHP',[],['programming-language'],'Explicit plain PHP usage; no framework is established.','https://www.php.net/manual/en/intro-whatis.php',{ecosystem:['php']}),
 e('javascript','JavaScript',['JS'],['programming-language'],'JavaScript programming language.','https://developer.mozilla.org/en-US/docs/Web/JavaScript'),
 e('typescript','TypeScript',['TS'],['programming-language'],'Language extending JavaScript; usage is not inferred from JavaScript tools.','https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',{relatedTo:['javascript']}),
 e('ruby','Ruby',[],['programming-language'],'Ruby programming language.','https://www.ruby-lang.org/en/about/'),
 e('symfony','Symfony',['Symfony PHP','Symphony PHP'],['backend-framework'],'PHP web framework.','https://symfony.com/what-is-symfony',{ecosystem:['php']}),
 e('laravel','Laravel',[],['backend-framework'],'PHP web framework.','https://laravel.com/docs',{ecosystem:['php']}),
 e('rails','Ruby on Rails',['Rails','RoR'],['backend-framework'],'Ruby web framework.','https://rubyonrails.org/',{ecosystem:['ruby']}),
 e('react','React',['ReactJS','React.js','React js'],['frontend-library'],'JavaScript UI library.','https://react.dev/',{ecosystem:['javascript'],disciplines:['frontend-development']}),
 e('next','Next.js',['NextJS','Next js'],['frontend-framework'],'React-based web framework.','https://nextjs.org/docs',{ecosystem:['javascript'],builtOn:['react'],disciplines:['frontend-development']}),
 e('node','Node.js',['NodeJS','Node js'],['runtime'],'JavaScript runtime; not a frontend or backend framework.','https://nodejs.org/en/about',{ecosystem:['javascript']}),
 e('mysql','MySQL',['MySQL DB'],['database'],'Relational database management system.','https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html',{disciplines:['relational-databases']}),
 e('mysql-5.7','MySQL 5.7',[],['database'],'Version-specific MySQL relational database.','https://dev.mysql.com/doc/refman/5.7/en/what-is-mysql.html',{versionOf:['mysql'],disciplines:['relational-databases']}),
 e('postgres','PostgreSQL',['Postgres','PostgreSQL DB'],['database'],'Relational database management system.','https://www.postgresql.org/about/',{disciplines:['relational-databases']}),
 e('apache','Apache HTTP Server',['Apache'],['web-server'],'HTTP web server; not every Apache Foundation technology.','https://httpd.apache.org/'),
 e('nginx','Nginx',[],['web-server'],'Web server and reverse proxy.','https://nginx.org/en/',{disciplines:['reverse-proxy']}),
 e('docker','Docker',[],['container-platform'],'Container development and runtime tooling; not Kubernetes.','https://docs.docker.com/get-started/docker-overview/'),
 e('kubernetes','Kubernetes',['K8s'],['container-orchestration'],'Container orchestration platform.','https://kubernetes.io/docs/concepts/overview/'),
 e('aws','AWS',['Amazon Web Services'],['cloud-platform'],'Cloud platform.','https://aws.amazon.com/what-is-aws/'),
 e('ec2','AWS EC2',['Amazon EC2','EC2'],['cloud-service'],'AWS cloud compute service.','https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html',{partOf:['aws']}),
 e('ecs','AWS ECS',['Amazon ECS','ECS'],['cloud-service','container-orchestration'],'AWS managed container orchestration service.','https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html',{partOf:['aws']}),
 e('gcp','Google Cloud',['Google Cloud (GCP)','Google Cloud Platform','GCP'],['cloud-platform'],'Google Cloud platform.','https://cloud.google.com/docs/overview'),
 e('azure','Microsoft Azure',['Azure'],['cloud-platform'],'Microsoft cloud platform.','https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-azure'),
 e('on-premises','On-premises',['On premises','On-premise'],['hosting-environment'],'On-premises hosting environment, not a cloud platform.','https://csrc.nist.gov/pubs/sp/800/145/final'),
 e('third-party-cloud','Third-party cloud provider',[],['hosting-environment'],'Broad hosting category; provider identity is not specified.','https://csrc.nist.gov/glossary/term/cloud_provider'),
 e('phpmaker','PHPMaker',[],['developer-tool'],'PHP-oriented code-generation/development tool; not Laravel or Symfony.','https://phpmaker.dev/',{ecosystem:['php']}),
 e('pdo','PHP Data Objects',['PHP Data Objects (PDO)','PHP PDO','PDO'],['database-access'],'PHP database-access interface, not a framework.','https://www.php.net/manual/en/book.pdo.php',{ecosystem:['php']}),
 e('playwright','Playwright',[],['testing-tool'],'Browser automation and testing framework.','https://playwright.dev/'),
];
export const entityById=new Map(entities.map(x=>[x.id,x]));
export const categoryLabels={
 'programming-language':'programming language','frontend-library':'frontend library','frontend-framework':'frontend framework','backend-framework':'backend framework','runtime':'runtime','database':'database','web-server':'web server','container-platform':'container tooling','container-orchestration':'container orchestration','cloud-platform':'cloud platform','cloud-service':'cloud service','testing-tool':'testing tool','database-access':'database access','developer-tool':'developer tool','hosting-environment':'hosting environment',
};
export const normalizeEntity=text=>text.normalize('NFKC').toLowerCase().replace(/[.()_-]/g,' ').replace(/\s+/g,' ').trim();
const exact=new Map();for(const x of entities)for(const alias of [x.canonicalName,...x.aliases]){const key=normalizeEntity(alias);if(exact.has(key)&&exact.get(key)!==x.id)throw new Error('Ambiguous inventory alias');exact.set(key,x.id);}
export function inventoryEntity(text){return entityById.get(exact.get(normalizeEntity(text)));}
export function validateOntology(registry=entities){
 const byId=new Map(registry.map(e=>[e.id,e]));if(byId.size!==registry.length)throw new Error("Duplicate ontology ID");
 const valid=new Set(Object.keys(categoryLabels));
 for(const x of registry){if(!/^[a-z0-9.-]+$/.test(x.id)||!x.categories.length||!x.categories.every(c=>valid.has(c)))throw new Error('Invalid ontology entity');for(const field of ['ecosystem','builtOn','partOf','versionOf','relatedTo'])for(const id of x[field]||[])if(!byId.has(id)||id===x.id)throw new Error('Invalid ontology reference');if(new URL(x.source).protocol!=='https:')throw new Error('Invalid ontology source');}
 for(const field of ['builtOn','partOf','versionOf']){const visit=(id,path=new Set())=>{if(path.has(id))throw new Error('Ontology cycle');for(const next of byId.get(id)[field]||[])visit(next,new Set([...path,id]));};registry.forEach(x=>visit(x.id));}
 return true;
}
validateOntology();
