#!/usr/bin/env bash
# The data snapshots, everything `npm run data` writes, live on the `data` branch and never on main.
#
#   scripts/snapshot.sh restore   fetch the branch and lay its files over the checkout (`npm run snapshot`): the
#                                 Deploy before it refreshes, the checks and anyone building locally before a build
#   scripts/snapshot.sh publish   replace the branch's one commit with the snapshots as they are now (the Deploy only)
#
# The branch only ever holds one commit: each publish replaces it with a new root commit, so the snapshots' history
# never grows, main's history holds only what people write, and the editor's branches and pull requests never carry
# data. The refresh is incremental (it fetches only the builds the snapshot lacks, which keeps it under the Pages rate
# limit), so the Deploy restores before it refreshes.
#
# Only the Deploy publishes, one run at a time (its concurrency group), so the lease should never fail. If something
# else did publish in between, this run's changes are merged onto that commit, three-way against the commit restore
# laid down, as the hub's scripts/commit_data.sh does; a conflict fails the run rather than dropping either side.
#
# With no history there is no revert, and a lost snapshot can only be rebuilt by a full refresh, which the Pages
# rate limit punishes. So the first publish of each UTC day is kept as refs/data-history/<date> for a week (roll back
# by force-pushing one to refs/heads/data), and a publish that would drop more than a tenth of the files, the mark of
# a refresh against a broken hub, is refused unless ALLOW_SHRINK=1.
set -euo pipefail

cd "$(dirname "$0")/.."
branch=data
base_ref=refs/snapshot/base # the commit restore laid down: publish's lease and merge base
# Every path the refresh writes. imagedocs/ also holds a hand-written README.md, which stays on main.
paths=(src/data src/assets/logos src/assets/team src/assets/proot-apps src/content/moddocs)
imagedocs=src/content/imagedocs

files() { git ls-tree -r --name-only "$1" | wc -l; }

# Refuses to replace $1 with $2 when that drops more than a tenth of the files.
guard() {
  local before after
  before=$(files "$1")
  after=$(files "$2")
  if [ "${ALLOW_SHRINK:-}" != 1 ] && [ $((after * 10)) -lt $((before * 9)) ]; then
    echo "::error::snapshots: refusing to publish $after files over $before (ALLOW_SHRINK=1 if that is intended)"
    exit 1
  fi
}

# Keeps $1 as today's refs/data-history/<date> unless today already has one, and drops those older than a week.
keep() {
  local day cutoff ref
  day=$(date -u +%F)
  cutoff=$(date -u -d '7 days ago' +%F)
  git ls-remote --exit-code origin "refs/data-history/$day" >/dev/null && return
  git push --quiet origin "$1:refs/data-history/$day"
  git ls-remote origin 'refs/data-history/*' | while read -r _ ref; do
    if [[ "${ref##*/}" < "$cutoff" ]]; then git push --quiet origin ":$ref"; fi
  done
}

restore() {
  # In the workflows' partial clone (`filter: blob:none`) the files arrive with `git archive` below, in one batch.
  git fetch --quiet origin "+refs/heads/$branch:$base_ref"
  # Clear what an earlier restore or refresh left, so a file the snapshot no longer has does not linger.
  rm -rf "${paths[@]}"
  find "$imagedocs" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
  git archive "$base_ref" | tar -x
  echo "snapshots from $(git log -1 --format='%h, %cr' "$base_ref")"
}

publish() {
  local base tree ours theirs merged index existing=() path attempt
  base=$(git rev-parse --verify "$base_ref^{commit}")
  # A separate index, so main's own index never sees the snapshots.
  index=$(mktemp -d)/index
  for path in "${paths[@]}" "$imagedocs"; do [ -e "$path" ] && existing+=("$path"); done
  GIT_INDEX_FILE=$index git add --force -- "${existing[@]}"
  GIT_INDEX_FILE=$index git rm --cached --quiet --ignore-unmatch -- "$imagedocs/README.md"
  tree=$(GIT_INDEX_FILE=$index git write-tree)
  if [ "$tree" = "$(git rev-parse "$base^{tree}")" ]; then
    echo "snapshots: nothing changed"
    return
  fi
  ours=$(git commit-tree "$tree" -m "Refresh data snapshots")
  for attempt in 1 2 3; do
    guard "$base" "$ours"
    if git push --force-with-lease="$branch:$base" origin "$ours:refs/heads/$branch"; then
      git update-ref "$base_ref" "$ours"
      keep "$ours" || echo "::warning::snapshots: could not keep today's copy in refs/data-history/"
      return
    fi
    if [ "$attempt" = 3 ]; then
      echo "::error::snapshots: the data branch kept moving; gave up after 3 attempts"
      exit 1
    fi
    sleep $((attempt * 3))
    git fetch --quiet origin "$branch"
    theirs=$(git rev-parse FETCH_HEAD)
    if ! merged=$(git merge-tree --write-tree --merge-base="$base" "$ours" "$theirs"); then
      echo "::error::snapshots: another publish changed the same files"
      echo "$merged"
      exit 1
    fi
    base=$theirs
    ours=$(git commit-tree "${merged%%$'\n'*}" -m "Refresh data snapshots")
  done
}

case "${1:-}" in
  restore) restore ;;
  publish) publish ;;
  *)
    echo "usage: $0 restore|publish" >&2
    exit 2
    ;;
esac
