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
6. Merge that pull request yourself, without asking. The author has asked
   for this standing, so treat an open pull request of your own as unfinished
   work: mark it ready if it is a draft and squash-merge it. Stop and ask only
   if a check is failing or the merge conflicts.
7. Do not report the branch, the pull request or the merge back to the author.
   They asked for the mechanics to stay out of the way: the pull request body
   is the record, and reading it is their choice, not an interruption. Mention
   repository work only when something needs their attention or their
   decision.

## One session per project

Work is split across cloud sessions, one per project, each bound to its own
repository alongside this one - Yemekapp with `bugun-ne-pisirsem`,
Borsa-Asistan with `borsa-asistan`, the KBB reading programme with this
repository. A session lives on the server, so any of them resumes from any
device.

New projects start the same way: a cloud session of their own, never a local
one. The author says when to open one. Creating it is possible from inside a
session (`create_session`), so offer rather than send them to the UI.

The account also holds older sessions from the Mac's Remote Control bridge,
including the 07:00 daily KBB routine. They carry
`worker_auth_expired` - that machine needs to sign in again - and cannot be
moved to the cloud: their history is readable but they cannot be continued
here. Anything worth keeping from them has to be rebuilt on this side.

## Local sessions

Running Claude Code locally is fine as long as the same discipline holds: pull
at the start, push at the end. A local checkout that is behind the remote is
the only real source of desync between cloud and local work.

## KBB günlük okuma programı

This repository also carries the state of a daily ENT (KBB) reading
programme. Days 1-68 are done; the notes themselves live in Google Drive,
but everything needed to continue lives here, because a fresh session
remembers nothing on its own:

- `.claude/skills/kbb-gunluk-not/SKILL.md` - how a day note is produced and
  how a KBB question is answered from the source books.
- `kbb/kaynak-index.md` - which book, which part, which page range.
- `kbb/ilerleme.md` - the 68 topics covered and what comes next.
- `kbb/bolme-yontemi.md` - how to split a new source book into readable parts.

Reading the source books needs the Google Drive connector enabled in the
session.

## Layout

- `.claude/settings.json` - project settings shared through git, so every
  session (cloud or local) is configured identically.
- `.claude/hooks/session-start.sh` - read-only sync check that runs at session
  start.
- `docs/bulut-calisma-akisi.md` - the same workflow written out in Turkish.
- `kbb/` - state of the KBB reading programme (see above).
