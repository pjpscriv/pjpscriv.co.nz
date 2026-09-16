---
title: 3. Post-Election Analysis
date: 2026-09-16
unlisted: true
---


**Post-election Analysis**
- Candidate votes by electorate type
- Party Vote (Relative Lean)


## Candidate Votes by Electorate Type

Urban vs Medium-City vs Rural Vs Māori

{{< html-demo >}}
<iframe
    class="pjpscriv-iframe"
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-candidate-votes-electorate-type/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Party Vote (Relative Lean)

{{< html-demo >}}
<iframe
    class="pjpscriv-iframe"
    src="https://pjpscriv.co.nz/obs-embed/nz-2026-election-party-votes-relative-lean/"
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
