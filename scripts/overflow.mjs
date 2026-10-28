import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(url, { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const W = document.documentElement.clientWidth;
  // Content inside a box that scrolls or clips (a code block, a wide table's wrapper) is wider than the screen on
  // purpose: only the box has to fit. A box clips an absolutely positioned descendant only when it is, or is inside,
  // that descendant's containing block, so an sr-only span in a static `truncate` cell still widens the page.
  const CLIPS = ['auto', 'scroll', 'hidden', 'clip'];
  const contained = (el) => {
    const own = getComputedStyle(el).position;
    if (own === 'fixed') return true;
    let escaping = own === 'absolute';
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if ((!escaping || cs.position !== 'static') && CLIPS.includes(cs.overflowX)) {
        // Clipped by `a`, so it sticks out only as far as `a` does.
        return a.getBoundingClientRect().right <= W + 1 || contained(a);
      }
      if (cs.position === 'fixed') return true;
      if (cs.position === 'absolute') escaping = true;
      else if (cs.position !== 'static') escaping = false;
    }
    return false;
  };
  const out = [];
  const over = (el) => {
    const rc = el.getBoundingClientRect();
    return rc.right > W + 1 && rc.width > 0 && !contained(el);
  };
  for (const el of document.querySelectorAll('body *')) {
    // Report the outermost box that sticks out; its children stick out because it does.
    if (over(el) && !(el.parentElement && over(el.parentElement))) {
      const rc = el.getBoundingClientRect();
      out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 90)} right=${Math.round(rc.right)} w=${Math.round(rc.width)}`);
    }
  }
  return { scrollW: document.documentElement.scrollWidth, out: out.slice(0, 15) };
});
console.log(r.scrollW, '\n' + r.out.join('\n'));
await b.close();
