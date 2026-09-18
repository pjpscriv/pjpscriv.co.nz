---
title: 1. Election Night Results Page
date: 2026-09-16
unlisted: true
---

There are five snippets to embed for this page:

{{<toc >}}

## Headline Seats Display

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-seats-only/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}


## Candidate Votes Map

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-candidate-votes/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Party Votes Map

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-party-votes/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Resulting Seat Diagram

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-the-results/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Resize script

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
