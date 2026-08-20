---
title: 'Embed Demo 4'
date: '2026-04-11'
img: 'nz-2026-election.jpg'
draft: false
unlisted: true
---

Embedding in multiple frames from `pjpscriv.co.nz`. Other approaches:
- [Observable iframe](../observable-embed-demo-1)
- [Observable iframes (multiple)](../observable-embed-demo-2)
- [pjpscriv.co.nz embed](../observable-embed-demo-3)

## Candidate votes

{{< html-demo >}}
<iframe id="nz-elec-chart-1" class="observable-iframe"
    src="https://pjpscriv.co.nz/embed/nz-elec-2026-chart-2/">
</iframe>
{{< /html-demo >}}


## Party Votes

{{< html-demo >}}
<iframe id="nz-elec-chart-2" class="observable-iframe"
    src="https://pjpscriv.co.nz/embed/nz-elec-2026-chart-3/">
</iframe>
{{< /html-demo >}}


## Seats & Vote Percentage

Embed would look like this, but hasn't been created yet.

{{< html-demo >}}
<iframe id="nz-elec-chart-3" class="observable-iframe"
    src="https://pjpscriv.co.nz/embed/nz-elec-2026-chart-3/">
</iframe>
{{< /html-demo >}}


## Iframe Resizer

Need this to deal with the fact that the iframes have different heights for desktop
and mobile views.

{{< html-demo >}}
<script>
  const charts = [
    { id: 'nz-elec-chart-1', heightFn: w => w < 600 ? 719 : 1072 },
    { id: 'nz-elec-chart-2', heightFn: w => w < 600 ? 780 : 1150 },
    { id: 'nz-elec-chart-3', heightFn: w => w < 600 ? 780 : 1150 },
  ];

  for (const { id, heightFn } of charts) {
    const iframe = document.getElementById(id);
    if (!iframe) continue;
    new ResizeObserver(([entry]) => {
      iframe.style.height = heightFn(entry.contentRect.width) + 'px';
    }).observe(iframe);
  }
</script>
{{< /html-demo >}}
