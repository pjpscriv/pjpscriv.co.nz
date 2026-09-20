---
title: 3. Post-Election Analysis
date: 2026-09-16
unlisted: true
---

Three snippets for this page.

{{<toc >}}


## Candidate Votes by Electorate Type

Urban vs Medium-City vs Rural Vs Māori

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-candidate-votes-electorate-type/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Party Vote (Relative Lean)

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-party-votes-relative-lean/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

### Resize script

Add in to the page so the `<iframe>`s can resize correctly:

{{< html-demo >}}
<script>
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://pjpscriv.co.nz') return;
    try {
      const msg = JSON.parse(e.data);
      if (msg.context === 'iframe.resize') e.source.frameElement.height = msg.height;
    } catch {}
  });
</script>
{{< /html-demo >}}
