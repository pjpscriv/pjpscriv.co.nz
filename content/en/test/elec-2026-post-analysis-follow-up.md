---
title: 4. Post-Election Analysis Follow Up
date: 2026-11-26
unlisted: true
---

Five snippets for this page — same as the analysis post, but pulling from the follow-up notebook (with special votes).

{{<toc >}}


## Candidate Votes by Electorate Type

Urban vs Medium-City vs Rural Vs Māori

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-candidate-votes-electorate-type-follow-up/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Candidate Votes Tables

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-candidate-votes-tables-follow-up/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Party Vote (Relative Lean)

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-party-votes-relative-lean-follow-up/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Party Vote Table

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-party-vote-table-follow-up/"
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
