---
title: Observable Proxy Test
date: 2026-09-16
unlisted: true
---

**TODO:** Probably want to remove the need for the custom CSS - this won't work when embedding in other sites

{{< html-demo >}}
<iframe
    class="pjpscriv-iframe"
    src="https://pjpscriv.co.nz/obs-embed/nz-elec-2023/"
    style="width: 100%; border: 0;">
</iframe>
{{< /html-demo >}}

## Resize script

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
