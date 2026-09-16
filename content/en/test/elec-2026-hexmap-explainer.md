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
    class="pjpscriv-iframe"
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-geo-vs-hex-map/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

### Resize script

Add in to the page so the `<iframe>` can resize correctly:

{{< html-demo >}}
<script>
  (function() {
    const iframe = document.querySelector('iframe.pjpscriv-iframe');
    const origin = 'https://pjpscriv.co.nz';
    window.addEventListener("message", (e) => {
      if (e.origin === origin && e.source === iframe.contentWindow) {
        const msg = JSON.parse(e.data);
        if (msg.context === 'iframe.resize') {
          iframe.height = msg.height;
        }
      }
    });
  })();
</script>
{{< /html-demo >}}
