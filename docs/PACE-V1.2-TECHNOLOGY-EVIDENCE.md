# PACE v1.2 — Technology evidence

18 October 2026. The owner explicitly supplied and authorized the six-project technology inventory in this task. This is authoritative owner confirmation of technology involvement, not independent certification of proficiency, architecture, operating scale, deployment responsibility or security quality.

## Canonical technology matrix

| Project / stable ID | Generation | Confirmed groups |
| --- | --- | --- |
| Hostel Management System / `hostel` | Historical presentation project | Backend: Plain PHP, PHP Data Objects (PDO). Database: MySQL. |
| Rental Management System / `rental` | Not assigned a generation | Backend: Symfony. Database: MySQL. Web server: Apache. Hosting: third-party cloud provider. |
| Education Platform Modernization / `campus` | Legacy systems | Application: PHPMaker, PHP 5. Database: MySQL 5.7. Web server: Apache. Hosting: on-premises, AWS EC2. |
| Education Platform Modernization / `campus` | Modern systems | Application: Laravel, Node.js, React. Data: PostgreSQL, MySQL. Web servers: Nginx, Apache. Hosting/orchestration: on-premises, AWS ECS, AWS EC2, Kubernetes, third-party cloud provider. |
| PolicyStreet / `insurance` | Not assigned a generation | Frontend: React, Next.js. Backend: Node.js. Database: PostgreSQL. Engineering tools: Docker, Playwright. Infrastructure: Nginx, AWS EC2, AWS ECS. |
| WenSymes / `wensymes` | Not assigned a generation | Application: Laravel, PHP 8. Database: MySQL. Web servers: Apache, Nginx. Containers/orchestration: Docker, Kubernetes. Cloud: Google Cloud (GCP). |
| Asset Management System / `asset` | Not assigned a generation | Application: Ruby on Rails. Database: MySQL. Web server: Nginx. Cloud: Microsoft Azure. |

The education rows describe separate technology generations across the engagement. They do not describe one combined deployment, a migration sequence, a completion status, or replacement of every legacy system. The meetings application and collaborative 2016–2017 HR case receive none of this stack automatically.

WenSymes retains its previously approved Microsoft 365 references in the professional narrative. Microsoft 365 is a workplace service, not a programming framework; it is not silently added to the newly confirmed application stack. General capabilities such as Vue, Django, MongoDB and Neo4j remain legitimate résumé-level capabilities without being assigned to these projects.

## Normalization

The owner's “Symphony PHP” is normalized to **Symfony**. Other canonical names are React, Node.js, Next.js, Ruby on Rails, PHP Data Objects (PDO), Google Cloud (GCP), Microsoft Azure, AWS EC2 and AWS ECS. PHP 5, PHP 8 and MySQL 5.7 retain their explicitly supplied versions. No Symfony/Laravel version, PHP 8 minor version, Kubernetes version, database version beyond MySQL 5.7, or unnamed cloud vendor is added.

## Provenance and bounded historical inspection

All six mappings originate from the owner's inventory dated 18 October 2026. Their technology provenance is attributed separately from the full CV's professional-role/project-background link. No private source repository was inspected or claimed to be public.

Hostel additionally has a [public historical repository](https://github.com/MohdVara/Hostel-Management-System/tree/master). A read-only GitHub API/source inspection on 18 October 2026 resolved master to commit `4e5d12fa53809873a0eb33920bc6912a9d005a5e`:

- [README at inspected commit](https://github.com/MohdVara/Hostel-Management-System/blob/4e5d12fa53809873a0eb33920bc6912a9d005a5e/README.md): describes presentation purposes, lack of production readiness, no ongoing maintenance, possible bugs and omitted safety procedures. The page calls it a historical personal/academic presentation project, not maintained production software.
- [Database wrapper at inspected commit](https://github.com/MohdVara/Hostel-Management-System/blob/4e5d12fa53809873a0eb33920bc6912a9d005a5e/classes/DB.php): contains PDO and a MySQL driver reference. This corroborates historical database-code usage; it does not establish real hosting, deployed database configuration or current secure practice.
- Root contains PHP pages, `classes/`, `core/`, `includes/`, assets and `sql_import/`. No PHP was executed, no database imported, no connection settings disclosed, and no historical implementation copied into the site.

The web-reader failed to fetch the repository, so inspection used unauthenticated GitHub API/raw-source reads. The local source-review record is ignored under `output/pace-v1.2/`. This was a bounded provenance check, not a security audit or runtime verification.

## Updated disclosure authorization

This inventory supersedes the earlier education technology/hosting withholding **only for the listed technology names, explicit versions and broad hosting categories**. The same limited owner confirmation permits the named PolicyStreet, Rental and WenSymes stacks.

It does not authorize internal system identities, campus workflows, student/employee records, SQL objects, infrastructure configuration, diagrams/topology, vulnerabilities, endpoints, private HR modules or payroll rules. It does not establish sole responsibility for every infrastructure component. Existing role dates/titles, insurer counts, quantified performance, team size and commercial outcomes remain unchanged.

Hostel's concise historical note is retained inside the additional-systems disclosure. Asset Management has only its name, supplied stack and owner provenance; no employer, customer, date, role, product capabilities or outcomes are invented. The selected-work hierarchy and existing case-study narratives remain intact.
