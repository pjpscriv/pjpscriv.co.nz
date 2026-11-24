---
title: 3. Special Votes Follow Up Post
date: 2026-11-24
unlisted: true
---

There are five snippets to embed for this page:

{{<toc >}}

## Overall Results

New iframe link.

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-the-results-follow-up/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Candidate Votes Map

Another new iframe link.

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-candidate-votes-follow-up/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Party Votes Map

A third new iframe link.

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-party-votes-follow-up/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Hexmap Demonstration

Same as original.

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-geo-vs-hex-map/"
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
