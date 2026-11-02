/**
 * "Managing proposals", the team's guide to taking a Labs proposal from the issue to a published image, on the Labs
 * site's /proposals/ page. Rendered only by `islands/Proposals` once `/api/me` says the viewer is a signed-in member,
 * and loaded from there with a dynamic import, so the page's HTML and its first script carry none of it. The text is
 * not secret (the harness's labs-accept playbook says the same in public); it is for the team, so only they see it.
 *
 * Keep it in step with the harness: the commands under "By hand" are the ones `./harness labs accept` writes into
 * accept.sh and after-merge.sh (`scripts/labs.py`, `accept_files`), with the name, issue and repository as shell
 * variables, and the builder environment is the one `labs_builder` in `./harness` passes.
 */
import * as React from 'react';
import CopyButton from '@/components/islands/CopyButton';
import { HARNESS_REPO } from '@/lib/contribute';
import { withBase } from '@/lib/base';
import { LABS_GUIDE_URL, LABS_PROPOSALS_REPO } from '@/lib/site';

const ORG = 'linuxserverlabs-playground';
const TEMPLATE = `https://github.com/${ORG}/docker-template`;
const GETTING_STARTED = `${TEMPLATE}/blob/main/GETTING-STARTED.md`;
const EXAMPLE = `https://github.com/${ORG}/docker-photocraft`;
const PLAYBOOK = 'https://github.com/linuxserver-playground/harness/blob/main/guides/playbooks/labs-accept.md';

/** A shell block with a copy button; `children` is the text exactly as it is copied. */
function Code({ label, children }: { label: string; children: string }) {
  const text = children.replace(/^\n+|\s+$/g, '');
  return (
    <div className="not-prose my-4 flex items-start gap-1 rounded-md border border-[var(--raft-hair)] bg-[var(--raft-code-bg)] py-1 pr-1 pl-4">
      <pre className="min-w-0 flex-1 overflow-x-auto py-2 font-mono text-[0.8125rem] leading-6" tabIndex={0} aria-label={label}>
        <code>{text}</code>
      </pre>
      <CopyButton text={text} label={`Copy: ${label}`} />
    </div>
  );
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const C = ({ children }: { children: React.ReactNode }) => <code>{children}</code>;

const LIFECYCLE: { title: string; who: string; body: React.ReactNode }[] = [
  {
    title: 'A proposal comes in',
    who: 'anyone',
    body: (
      <>
        Someone files the proposal form in <C>proposals</C>; the issue gets the <C>proposal</C> label.
      </>
    ),
  },
  {
    title: 'Check and labels',
    who: 'automatic',
    body: (
      <>
        A workflow checks the form against the real upstream, keeps one comment up to date and labels it <C>meets-bar</C> or <C>needs-info</C>.
      </>
    ),
  },
  {
    title: 'Try it',
    who: 'a member',
    body: <>Build the image and run it sandboxed on your machine, then do the first run the proposal describes.</>,
  },
  {
    title: 'Accept',
    who: 'a member',
    body: (
      <>
        Create <C>docker-&lt;name&gt;</C> pending approval, open its first pull request with the image, and label the issue <C>accepted</C>.
      </>
    ),
  },
  {
    title: 'Review the build report',
    who: 'the team',
    body: (
      <>
        The pull request builds to the quarantined <C>untrusted-pr/</C> namespace and posts its report: tests, screenshots, packages.
      </>
    ),
  },
  {
    title: 'Merge',
    who: 'a member',
    body: (
      <>
        <C>release.branch: main</C> makes <C>main</C> live; the merge's build renders the generated files and releases.
      </>
    ),
  },
  {
    title: 'After the merge',
    who: 'a member',
    body: (
      <>
        Remove the <C>labs-pending</C> topic and dispatch the first build if the merge did not start one.
      </>
    ),
  },
  {
    title: 'Published',
    who: 'automatic',
    body: (
      <>
        Labs control finds the image within 30 minutes; it ships as <C>ghcr.io/{ORG}/&lt;name&gt;</C> and the Labs hub and site follow its first release.
      </>
    ),
  },
];

const GUIDE_SECTIONS = [
  { id: 'manage-lifecycle', title: 'The lifecycle at a glance' },
  { id: 'manage-falls-short', title: 'When a proposal falls short' },
  { id: 'manage-harness', title: 'Recommended: the harness with an AI agent' },
  { id: 'manage-by-hand', title: 'By hand, step by step' },
  { id: 'manage-review', title: 'Reviewing the first pull request' },
];

const H3 = ({ n, children }: { n: number; children?: React.ReactNode }) => <h3 id={GUIDE_SECTIONS[n].id}>{children ?? GUIDE_SECTIONS[n].title}</h3>;

export default function ManagingProposals() {
  return (
    <section className="raft-container scroll-mt-24 pt-16" aria-labelledby="managing-proposals">
      <div className="max-w-2xl">
        <h2 id="managing-proposals" className="text-2xl font-semibold tracking-tight md:text-[2rem] md:leading-tight">
          Managing proposals
        </h2>
        <p className="mt-3 text-muted-foreground">
          How the team takes a proposal from the issue to a published image. The harness does the work with an AI agent and is the way we recommend; every step
          it takes is written out below for members who would rather run it by hand.
        </p>
      </div>

      <nav aria-label="Managing proposals" className="raft-panel mt-8 max-w-[46rem] p-4">
        <p className="font-mono text-[0.6875rem] tracking-wide text-muted-foreground uppercase">In this guide</p>
        <ol className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {GUIDE_SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="inline-flex gap-2 py-0.5 text-muted-foreground hover:text-foreground">
                <span className="font-mono text-primary" aria-hidden="true">
                  {i + 1}.
                </span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="post-body prose mt-10 max-w-[46rem] dark:prose-invert">
        <H3 n={0} />
        <ol className="not-prose mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {LIFECYCLE.map((step, i) => (
            <li key={step.title} className="raft-panel flex gap-3 p-4">
              <span className="font-mono text-sm font-semibold text-primary" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 font-medium">
                  {step.title}
                  <span className="font-mono text-[0.6875rem] font-normal text-muted-foreground">{step.who}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-[0.8125rem] [&_code]:[overflow-wrap:anywhere]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p>
          The images between accept and merge are the <a href="#pending">images in review</a> at the top of this page, listed there by the <C>labs-pending</C>{' '}
          topic.
        </p>

        <H3 n={1} />
        <p>
          Only proposals labelled <C>meets-bar</C> are worth a trial. The check's comment on the issue says what passed and what did not.
        </p>
        <ul>
          <li>
            <strong>
              <C>needs-info</C>: ask on the issue.
            </strong>{' '}
            Say exactly what is missing (a licence GitHub detects, a stable release, an asset per architecture, a first-run description) and that editing the
            issue runs the check again. Some gaps are only shown by the trial: the check cannot see an app that needs a companion container or a vendor account.
          </li>
          <li>
            <strong>A trial that fails: comment with what you saw,</strong> with the log lines, and what would fix it. Leave it open while the proposer can fix
            it.
          </li>
          <li>
            <strong>Close it when it will not qualify, with the reason.</strong> Name the rule of the bar it misses (a personal-account repository, no approved
            licence, no stable releases, needs companion containers, a shell for a paid service) and link the{' '}
            <a href={withBase('/propose/#what-qualifies')}>bar</a> so the proposer can come back once it holds.
          </li>
        </ul>
        <Code label="Close a proposal that will not qualify">{`
gh issue close <issue> -R ${LABS_PROPOSALS_REPO} --reason "not planned" \\
  --comment "Closing: <the rule it misses, and why>. The bar is at ${LABS_GUIDE_URL}#what-qualifies; reopen or file again once it holds."
`}</Code>

        <H3 n={2} />
        <p>
          The <Ext href={HARNESS_REPO}>harness</Ext> knows the whole path: it scaffolds the image from the issue, tries it in a sandbox and writes the commands
          that accept it, without running any of them. Clone it and start your agent there; <C>./harness whoami</C> confirms you are a member of the Labs org.
        </p>
        <Code label="Start the harness">{`
gh repo clone linuxserver-playground/harness && cd harness
./harness doctor
claude   # or any agent that reads AGENTS.md
`}</Code>
        <p>
          Then ask in plain words ("What Labs proposals are waiting?", "Try proposal 12.", "Accept it.", "The Labs PR for photocraft merged, finish it."), or
          run the commands yourself:
        </p>
        <Code label="The harness's Labs commands">{`
./harness labs try <issue>              # scaffold, build and run it sandboxed
./harness labs try --stop <name>        # remove the trial container, its volume and the image
./harness labs accept <issue>           # write accept.sh and after-merge.sh; runs nothing
bash .harness/labs/<name>/accept.sh     # after reading it
bash .harness/labs/<name>/after-merge.sh
`}</Code>
        <ul>
          <li>
            <strong>Try.</strong> <C>labs try</C> writes the image into <C>.harness/labs/&lt;name&gt;/</C> (from the proposer's working repository when the form
            names one), renders it with builder as a Labs repository, runs <C>builder check</C>, builds the amd64 image and runs it with no host mounts, none of
            your credentials and ports on 127.0.0.1 only. It prints every guess as a TODO. Fix them in the scaffold and run it again: your edits there survive
            every run (<C>--fresh</C> writes it again from the issue). Do the first run and write what you clicked into{' '}
            <C>.harness/labs/&lt;name&gt;/.proposal/try.md</C>; it goes into the pull request.
          </li>
          <li>
            <strong>Accept.</strong> <C>labs accept</C> refreshes the render and check, warns about a name collision, a repository that exists, a missing trial
            or an issue that is not <C>meets-bar</C>, and writes <C>accept.sh</C>, <C>after-merge.sh</C> and the pull request body (<C>.proposal/pr-body.md</C>
            ). Fill in its AI-use line, read <C>accept.sh</C> line by line, then run it: it creates a public repository, so a person decides.
          </li>
          <li>
            <strong>After the merge,</strong> run <C>after-merge.sh</C>.
          </li>
        </ul>
        <p>
          The playbook the agent follows is <Ext href={PLAYBOOK}>labs-accept.md</Ext>.
        </p>

        <H3 n={3} />
        <p>
          The same path without the harness. Every command below is one <C>accept.sh</C> or <C>after-merge.sh</C> runs. You need <C>gh</C> signed in as a
          member, git and Docker. Set the names once and the blocks after copy as they are.
        </p>
        <Code label="Set the names">{`
name=<name>          # the proposal's image name
issue=<issue>        # the proposal's issue number
proposer=<login>     # who filed it, credited in maintainers
repo=${ORG}/docker-$name
`}</Code>

        <h4 id="manage-write">1. Write the image</h4>
        <p>
          Start from the proposer's working repository when the form names one, or from <Ext href={TEMPLATE}>docker-template</Ext>'s starter kit. Its{' '}
          <Ext href={GETTING_STARTED}>GETTING-STARTED.md</Ext> walks through <C>image.yml</C>, both Dockerfiles and <C>root/</C> for a web app, and the selkies
          variant in <C>variants/selkies/</C> for a desktop app. <Ext href={EXAMPLE}>docker-photocraft</Ext> is the worked example of a finished one.
        </p>
        <Code label="Start from the starter kit">{`
git clone --depth 1 ${TEMPLATE}.git "labs-$name" && cd "labs-$name"
image=$PWD
`}</Code>
        <p>
          What a Labs <C>image.yml</C> needs, which builder's Labs checks enforce:
        </p>
        <ul>
          <li>
            <C>maintainers</C> with the proposer's login (credit and mentions, never access);
          </li>
          <li>
            a typed release source such as <C>github_release</C> that follows stable releases, with <C>require_assets</C> naming each file the Dockerfiles
            download, and the version passed in as <C>build.version_arg</C>;
          </li>
          <li>
            both Dockerfiles <C>FROM</C> a playground base image (<C>ghcr.io/linuxserver-playground/baseimage-*</C>), and an app: no <C>kind: tool</C> or{' '}
            <C>base</C>.
          </li>
        </ul>

        <h4 id="manage-render">2. Render and check it with builder</h4>
        <p>
          The builder image renders the generated files (README, AGENTS.md, LICENSE and the workflows) as the live build would for a Labs repository, and its
          check applies the Labs profile when <C>GITHUB_REPOSITORY</C> names the Labs org.
        </p>
        <Code label="Render and check with builder">{`
labs_builder() {
  docker run --rm -v "$image":/repo --user "$(id -u):$(id -g)" \\
    -e GITHUB_REPOSITORY=${ORG}/docker-$name \\
    -e BUILDER_SITE_URL=https://${ORG}.github.io/site \\
    -e BUILDER_HUB_URL=https://${ORG}.github.io/hub \\
    ghcr.io/linuxserver-playground/builder:latest "$@"
}
docker pull ghcr.io/linuxserver-playground/builder:latest
labs_builder render
labs_builder check --drift warn
`}</Code>

        <h4 id="manage-try">3. Build and try it locally</h4>
        <p>
          Run it as the harness does: no host mounts (<C>/config</C> stays an anonymous volume), none of your environment, and ports on 127.0.0.1 only. Use{' '}
          <C>-f Dockerfile.aarch64</C> on an arm64 machine. Wait for <C>[ls.io-init] done.</C> in the log, check that the web port answers below 500, then do
          the first run the proposal describes.
        </p>
        <Code label="Build and run it sandboxed">{`
docker build --pull -t "labs-try/$name" "$image"
docker run -d --name "try-$name" -e PUID="$(id -u)" -e PGID="$(id -g)" -e TZ=Etc/UTC \\
  -p 127.0.0.1:<port>:<port> "labs-try/$name"
docker logs -f "try-$name"     # until [ls.io-init] done., then Ctrl-C
curl -sk -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:<port>/
`}</Code>
        <p>
          A selkies desktop app also needs <C>--shm-size=1gb</C> and is on <C>https://127.0.0.1:3001</C>. Clean up when you are done:
        </p>
        <Code label="Remove the trial">{`
docker rm -fv "try-$name" && docker rmi "labs-try/$name"
`}</Code>

        <h4 id="manage-create">4. Create the repository, pending approval</h4>
        <p>
          Its first <C>main</C> is docker-template's <C>pending</C> branch (the "Image pending approval" README and the generated <C>pr-report.yml</C>, no{' '}
          <C>image.yml</C>, so nothing builds there), plus one <C>[skip ci]</C> commit that links the proposal and adds the generated <C>build.yml</C>, so the
          first pull request touches no generated file and still has a workflow to run. Create the repository empty, never with <C>--template</C>: the
          template's <C>main</C> is the starter kit.
        </p>
        <Code label="Prepare the pending main">{`
cd "$image/.."
git clone --branch pending --single-branch ${TEMPLATE}.git "docker-$name" && cd "docker-$name"
sed -i "s|^Proposal: .*|Proposal: https://github.com/${LABS_PROPOSALS_REPO}/issues/$issue|" README.md
mkdir -p .github/workflows
cp "$image/.github/workflows/build.yml" .github/workflows/build.yml
cmp -s "$image/.github/workflows/pr-report.yml" .github/workflows/pr-report.yml ||
  cp "$image/.github/workflows/pr-report.yml" .github/workflows/pr-report.yml
git add -A
git commit -m "Link the proposal and add the build workflow [skip ci]"
`}</Code>
        <p>
          Then the repository, its Pages site (control cannot change repository settings) and the <C>labs-pending</C> topic, which lists it on this page as in
          review:
        </p>
        <Code label="Create the repository">{`
gh repo create "$repo" --public --description "<one line about the app>"
git remote set-url origin "https://github.com/$repo.git"
git push origin HEAD:main
gh api -X POST "repos/$repo/pages" -f build_type=workflow
gh api -X PUT "repos/$repo/environments/github-pages" --input - <<<'{"deployment_branch_policy":null}'
gh repo edit "$repo" --add-topic labs-pending
`}</Code>

        <h4 id="manage-pr">5. Open the first pull request</h4>
        <p>
          The image goes up on a branch, <C>initial</C>: <C>image.yml</C>, the Dockerfiles and <C>root/</C> only. The generated files stay out (the pull
          request's build fails one that is there); the live build renders them after the merge.
        </p>
        <Code label="Push the image and open the pull request">{`
git switch -c initial
cp "$image/image.yml" "$image/Dockerfile" .
[ -f "$image/Dockerfile.aarch64" ] && cp "$image/Dockerfile.aarch64" .
cp -r "$image/root" . && rm -f root/donate.txt
git add -A
git commit -m "Add the $name image"
git push -u origin initial
gh pr create -R "$repo" --base main --head initial --title "Add the $name image" --body-file ../pr-body.md
`}</Code>
        <p>
          Write <C>pr-body.md</C> first, beside the repository (the command reads <C>../pr-body.md</C>). It carries:
        </p>
        <ul>
          <li>
            <C>Closes {LABS_PROPOSALS_REPO}#&lt;issue&gt;</C>, so the merge closes the proposal;
          </li>
          <li>
            credit to the proposer (@login), who is in <C>maintainers</C>;
          </li>
          <li>what is here: the version source, base image and platforms;</li>
          <li>your trial notes: what came up and what you clicked, and anything still to check;</li>
          <li>an AI-use line when an agent helped (the tool and what it did).</li>
        </ul>

        <h4 id="manage-accepted">6. Mark the proposal accepted</h4>
        <Code label="Label and answer the proposal">{`
gh issue edit "$issue" -R ${LABS_PROPOSALS_REPO} --add-label accepted
gh issue comment "$issue" -R ${LABS_PROPOSALS_REPO} --body "Accepted: $repo is created and its first pull request holds the image: <pull request URL>. Its build posts a report comment there with the tests, screenshots and a pull command. Follow it, and send changes as pull requests from a fork."
`}</Code>

        <h4 id="manage-after">7. After the merge</h4>
        <p>
          Take it off the in-review list, and dispatch the first live build if none ran: a brand-new repository runs a workflow for only one of its first
          pushes.
        </p>
        <Code label="Finish after the merge">{`
gh repo edit "$repo" --remove-topic labs-pending
if [ -z "$(gh run list -R "$repo" --branch main --workflow build.yml --limit 1 --json databaseId --jq '.[].databaseId')" ]; then
  gh workflow run build.yml -R "$repo" --ref main -f reason=manual
fi
gh run list -R "$repo" --limit 3
`}</Code>
        <p>Labs control discovers the image within 30 minutes; the Labs hub and this site follow its first release.</p>

        <H3 n={4} />
        <p>
          The pull request's build publishes to <C>ghcr.io/{ORG}/untrusted-pr/&lt;name&gt;</C>: quarantined, unreviewed by design, and deleted when the pull
          request closes. A branch in the org's own repository needs no <C>safe-to-publish</C>.
        </p>
        <ul>
          <li>
            <strong>The report comment.</strong> Tests per architecture (every s6 service stays up, the web endpoint answers below 500, the declared ports
            listen, no known failure lines in the runtime's logs), screenshots, the package table and the pull command. Do not merge while a test fails.
          </li>
          <li>
            <strong>Pull it and run it</strong> with the comment's pull command, sandboxed as in step 3, and do the first run yourself.
          </li>
          <li>
            <strong>Builder's Labs checks</strong> run in the build: <C>maintainers</C> named, an app, a typed source on stable releases with{' '}
            <C>require_assets</C>, playground base images, and no generated file in the pull request.
          </li>
          <li>
            <strong>
              Read the Dockerfiles and <C>root/</C>
            </strong>{' '}
            as any pull request: downloads come from the release by the version argument, state lives under <C>/config</C>, and telemetry is off or can be
            turned off.
          </li>
          <li>
            <strong>The proposer's changes</strong> come as pull requests from a fork into <C>initial</C>. Their workflows need approval, and a fork's image is
            published only once a member adds <C>safe-to-publish</C> (removed again on every push).
          </li>
        </ul>
        <p>
          <strong>Who merges:</strong> a team member, once the build is green and another member has reviewed it. Nobody outside the team has push access to a
          Labs repository, the app's own developers included; <C>maintainers</C> is credit, not access. Once <C>image.yml</C> is on <C>main</C>, every change
          goes up as a pull request.
        </p>
      </div>
    </section>
  );
}
