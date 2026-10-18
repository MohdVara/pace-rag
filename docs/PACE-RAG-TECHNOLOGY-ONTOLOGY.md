# Technology ontology — PACE-RAG v1.3

## Audit and implemented boundary

The existing six-project export in `content/portfolio/technology-evidence.json` is the sole project-to-technology authority. It includes generation-specific education records, PHP 5 / PHP 8 / MySQL 5.7 and broad hosting labels. The earlier `answers.mjs` composer used literal regex aliases and a closed inventory grammar. It could not distinguish PHP framework categories from PDO/PHPMaker, or classify JavaScript roles and AWS service relationships. No project facts or existing content approvals were changed for TOER.

`packages/semantic-core/src/technology/ontology.mjs` defines 30 general entities under `pace-ontology-v1.3.0`; TypeScript contracts define categories and directed references. This is a compact curated registry, not a graph database or an LLM. It has no runtime definition lookup. Build-time validation covers IDs, category names, foreign references, directed hierarchy cycles and coverage of every confirmed inventory string. The approved immutable indexes remain `c7c3b24acc7a674c` (portfolio) and `e3f32e81448fdea7` (Lab); no embedding model was replaced.

## General knowledge versus experience

The ontology knows general categories: Symfony/Laravel are PHP frameworks; Rails belongs to Ruby; React is a JavaScript UI library; Next.js is a React-based framework; Node.js is a runtime; MySQL/PostgreSQL are relational databases; PDO is database access; PHPMaker is a development tool. Docker is container tooling; Kubernetes and ECS support orchestration; EC2 is compute. On-premises is a hosting environment, not a cloud platform. A third-party provider remains unnamed.

Those definitions cannot create project associations. `projectFacts` derives facts only from the owner export and current approved project-source snapshots, preserving `upstreamHash`, generation and evidence ID. Project usage is never propagated along a `builtOn` or sibling-service relationship. The professional source alone can compose experience answers. General definitions remain separate from project citations.

Definitions are agent-curated general knowledge for local review. Each entity retains a primary reference, readable at `/pace-rag/technology-ontology.html`. Key classifications were checked against [Symfony](https://symfony.com/what-is-symfony), [React](https://react.dev/), [Next.js](https://nextjs.org/docs), [Node.js](https://nodejs.org/en/about), [PHP PDO](https://www.php.net/manual/en/book.pdo.php), [AWS ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html), [AWS EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html), [Docker](https://docs.docker.com/get-started/docker-overview/) and [Kubernetes](https://kubernetes.io/docs/concepts/overview/) on 19 October 2026. Links substantiate general definitions, not the owner's work. No reference article was imported into the experience cache.

## Directed semantics

| Relation | Permitted use | Prohibited inference |
| --- | --- | --- |
| Category / discipline | Select documented technologies in a requested category | Node becomes a framework; PDO becomes a framework |
| Language ecosystem | Explain Ruby evidence through a documented Rails project; PHP through its documented tools | Additional standalone language deployment, duration or expertise |
| Built on | Describe Next.js as React-based | Every React project used Next.js; unlisted direct React project facts |
| Part of platform | Group explicitly documented EC2/ECS under AWS | EC2 implies ECS; ECS implies Kubernetes |
| Version of | Include an explicitly recorded MySQL 5.7 fact in MySQL results | Assign an unrecorded version to an unversioned project |

Relations are bounded direct lookups. No unrestricted transitive graph traversal is used. Practical frontend questions may include React alongside Next.js while preserving their different classifications. Cloud summaries may include a separately described unnamed cloud provider; that label never becomes AWS/GCP/Azure and on-premises remains separate.

## Maintenance

Add stable entity IDs, accurate aliases, category/relationship references and primary provenance in the registry. Add a unit regression for ambiguity and a separately worded evaluation example. Run ontology validation, the full tests, technology evaluation, build and browser checks. The indexer fails on an unmapped confirmed inventory name. New project facts must go through the existing owner-confirmed evidence/export and review flow, not this ontology. Do not rewrite approval hashes, infer TypeScript from adjacent tools, add employer associations or enable live AI as part of a registry change.

See [entity resolution](PACE-RAG-ENTITY-RESOLUTION.md), [evaluation](PACE-RAG-TECHNOLOGY-EVALUATION.md) and [QA](PACE-RAG-TOER-QA.md).
