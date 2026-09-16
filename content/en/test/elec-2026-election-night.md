---
title: 1. Election Night Results Page
date: 2026-09-16
unlisted: true
---

Notes:
- This will be populated by live data


**Election Night Results Page**

{{<toc excludeIDs="resize-script">}}

Numbers up the top of the page?


## Candidate Votes Map

{{< html-demo >}}
<iframe
    class="pjpscriv-iframe"
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-candidate-votes/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Party Votes Map

{{< html-demo >}}
<iframe
    class="pjpscriv-iframe"
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-party-votes/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Resulting Seat Diagram

{{< html-demo >}}
<iframe
    class="pjpscriv-iframe"
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-the-results/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

### Resize script

Add in to the page so the `<iframe>`s can resize correctly:

{{< html-demo >}}
<script>
  (function() {
    const iframes = document.querySelectorAll('iframe.pjpscriv-iframe');
    const origin = 'https://pjpscriv.co.nz';
    window.addEventListener("message", (e) => {
      if (e.origin !== origin) return;
      const msg = JSON.parse(e.data);
      if (msg.context === 'iframe.resize') {
        for (const iframe of iframes) {
          if (e.source === iframe.contentWindow) {
            iframe.height = msg.height;
          }
        }
      }
    });
  })();
</script>
{{< /html-demo >}}
