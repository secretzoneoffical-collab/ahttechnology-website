# AHT Project Portal — Security and Acceptance Test Plan

**Status:** Test cases prepared; production execution is blocked until the migrations are safely reconciled and applied, and test accounts are provisioned in a non-production environment.

## Test identities
Create in a dedicated staging project:
- Admin A: active profile, role `admin`.
- Staff A: active profile, role `staff`, assigned to Project A only.
- Staff B: active profile, role `staff`, not assigned to Project A.
- Customer A: active profile linked to CRM Customer A.
- Customer B: active profile linked to CRM Customer B.
- Suspended Customer: status `suspended`.

Use two projects:
- Project A belongs to Customer A and is assigned to Staff A.
- Project B belongs to Customer B and is assigned to Staff B.

## Required authorization tests

| Actor | Operation | Expected |
|---|---|---|
| Anonymous | Read projects/tasks/files | Denied |
| Customer A | Read Project A | Allowed |
| Customer A | Read Project B by list or guessed UUID | Denied / empty |
| Customer A | Read internal tasks, updates, or files in Project A | Denied |
| Customer A | Read customer-visible tasks, updates, and files in Project A | Allowed |
| Customer A | Insert/update/delete projects, stages, tasks, updates, file metadata, or team links | Denied |
| Customer B | Read Project A | Denied |
| Staff A | Read Project A and its internal work records | Allowed |
| Staff A | Update a task assigned to Staff A | Allowed |
| Staff A | Update a task assigned to Staff B or unassigned | Denied |
| Staff A | Change task title, description, stage, priority, due date, assignee, project, creator, or customer-visible flag | Denied by trigger |
| Staff A | Create an internal project update | Allowed |
| Staff A | Create a customer-visible update | Denied |
| Staff A | Read Project B | Denied |
| Staff B | Read Project A | Denied |
| Staff A | Upload a file to Project A | Denied (current policy is Admin-only) |
| Staff A | Upload a file to Project B | Denied |
| Customer A | Download customer-visible file in Project A | Allowed |
| Customer A | Download internal file in Project A | Denied |
| Customer A | Download a guessed object path from Project B | Denied |
| Admin A | Manage all projects and publish customer-visible updates | Allowed |
| Admin A | Upload, remove, or change customer visibility of project files | Allowed |
| Suspended Customer | Read any project resource | Denied |

## Functional acceptance
- Admin can create a project linked to an existing CRM customer.
- Admin can link one active customer Auth account to the CRM record.
- Admin can assign/remove active staff members.
- Admin can add stages, tasks, progress updates, and project files.
- Admin can control customer visibility per stage, task, update, and file.
- Customer dashboard lists only projects belonging to its linked CRM customer.
- Staff dashboard lists only projects assigned to that staff account.
- Customer project detail renders only customer-visible records.
- Private file downloads use short-lived signed URLs and the private Storage bucket.
- Inactive users are denied at both application and RLS layers.

## Test execution record
No production user accounts or real customer data were used for this review. The project migrations are now installed in the live Supabase project, but the identity-based cases above still require controlled test identities in a non-production environment. Anonymous table grants, project-table RLS activation, private bucket configuration, and zero Security Advisor findings have been verified separately. Record each result, actor, timestamp, and evidence before declaring the portal production-ready.
