# Repository1

A personal learning repository. Every piece of work here is meant to live in
git, because that is the only thing that survives between sessions.

## Cloud-first workflow

Work on this repository is done from Claude Code in the cloud
(claude.ai/code, the desktop app or the mobile app). Cloud sessions run in an
ephemeral container: the repository is cloned fresh when the session starts and
the container is reclaimed once the session ends. Nothing on that disk is
persistent.

The consequence is simple and it drives every rule below: **the remote branch
is the state of the work, not the container.**

## Rules for any session

1. Start by reading the sync report the `SessionStart` hook prints. If it says
   the branch is behind, pull before editing anything.
2. Work on a branch, never directly on `master`.
3. Commit in small, self-describing steps.
4. Push before the session ends - `git push -u origin <branch>`. Unpushed work
   is lost work.
5. Open a pull request for the branch so the change has a reviewable home.

## Local sessions

Running Claude Code locally is fine as long as the same discipline holds: pull
at the start, push at the end. A local checkout that is behind the remote is
the only real source of desync between cloud and local work.

## Layout

- `.claude/settings.json` - project settings shared through git, so every
  session (cloud or local) is configured identically.
- `.claude/hooks/session-start.sh` - read-only sync check that runs at session
  start.
- `docs/bulut-calisma-akisi.md` - the same workflow written out in Turkish.
