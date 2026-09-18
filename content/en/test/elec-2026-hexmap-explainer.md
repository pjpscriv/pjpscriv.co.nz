---
title: 2. Hexmap Explainer Post
date: 2026-09-16
unlisted: true
---


**Hexmap Explainer**
- Geographic Map vs Hexmap


## Geographic Map vs Hexmap

> *Land doesn't vote, people do.* 

{{< html-demo >}}
<iframe
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-geo-vs-hex-map/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

### Resize script

Add in to the page so the `<iframe>` can resize correctly:

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
