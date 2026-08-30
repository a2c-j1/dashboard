# Branching strategy

This repository uses `dev` as the default branch and integration branch. The
`main` branch represents production-ready code. Direct pushes to either branch
are not part of the normal workflow; changes enter through pull requests.

## Branches and pull requests

| Branch                         | Created from | Pull request target | Merge method |
| ------------------------------ | ------------ | ------------------- | ------------ |
| `feature/<issue>-<summary>`    | `dev`        | `dev`               | Squash merge |
| `fix/<issue>-<summary>`        | `dev`        | `dev`               | Squash merge |
| `release/<version>`            | `dev`        | `main`              | Squash merge |
| `hotfix/<issue>-<summary>`     | `main`       | `main`              | Squash merge |
| `main` → `dev` synchronization | `main`       | `dev`               | Merge commit |

Use a short, descriptive summary and keep issue references in the branch name
when an issue exists. Existing `codex/*` branches do not need to be renamed;
during the transition, open their pull requests against `dev`.

After a release or hotfix is merged into `main`, open a synchronization pull
request from `main` to `dev`. This is the one normal exception to the squash
merge rule: use a merge commit so the production history is preserved in the
development branch. Delete short-lived feature, fix, release, and hotfix
branches after their pull requests are merged.

## Protected branches

Both `main` and `dev` require pull requests and the required CI checks before
merging. The required checks are `checks`, `Semgrep security scan`, and
`branch-topology`; they must pass for the latest commit on the pull request
branch. `branch-topology` rejects pull requests whose source and target do not
match the allowed routes in the table above, so the branch flow is enforced by
GitHub rather than relying on this document.

This is a single-maintainer repository, so `main` and `dev` require zero
approving reviews while still requiring a pull request. For both branches:

- all pull-request conversations must be resolved;
- force pushes and branch deletion are prohibited; and
- administrators are subject to the rules and should not bypass them as part
  of normal operation.

Branch protection settings are maintained in GitHub. The repository default
branch is `dev`; do not change the protected branch roles without updating this
document and reviewing the release workflow.

GitHub automatically deletes a pull request's head branch after it is merged.
Keep a branch only when it has an explicit, documented reason to remain.

## Typical workflows

### Feature or bug fix

1. Create `feature/<issue>-<summary>` or `fix/<issue>-<summary>` from `dev`.
2. Open a pull request back to `dev`.
3. Wait for both required checks, resolve all comments, then squash merge.
4. Delete the short-lived branch.

### Release

1. Create `release/<version>` from `dev` and open a pull request to `main`.
2. After the checks pass, squash merge into `main`.
3. Open `main` → `dev` as a synchronization pull request and merge it with a
   merge commit after the required check and review pass.
4. Delete the release branch.

### Emergency fix

1. Create `hotfix/<issue>-<summary>` from `main` and open a pull request to
   `main`.
2. After the checks pass, squash merge into `main`.
3. Open `main` → `dev` as a synchronization pull request and merge it with a
   merge commit after the required check and review pass.
4. Delete the hotfix branch.

Do not bypass branch protection with direct pushes or force pushes. Deployment
approvals, signed commits, CODEOWNERS requirements, and merge queues are not
part of this policy.
