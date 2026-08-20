---
title: 'Embed Demo 2'
date: '2025-12-13T13:22:05-05:00'
img: 'nz-2026-election.jpg'
draft: false
unlisted: true
---

Embedding with <u>multiple</u> Observable `<iframe>`s. 

Other approaches:
- [Observable iframe](../observable-embed-demo-1)
- [pjpscriv.co.nz embed](../observable-embed-demo-3)
- [pjpscriv.co.nz embeds (multiple)](../observable-embed-demo-4)

## Geo vs Hexamap

```html
<iframe
    frameborder="0"
    width="100"
    src="https://observablehq.com/embed/145c825f4a902622?cells=md_1,viewof chart_style,area_types_swatches,chart">
</iframe>
```

{{<observable-iframe
    notebook="145c825f4a902622"
    cells=`
        md_1,
        viewof chart_style,
        area_types_swatches,
        chart
    `
>}}

## Candidate Votes

```html
<iframe
    frameborder="0"
    width="100%"
    src="https://observablehq.com/embed/145c825f4a902622?cells=md_2,viewof candidate_chart_style,candidate_votes_legend,candidate_hexmap">
</iframe>
```

{{<observable-iframe
    notebook="145c825f4a902622"
    cells=`
        md_2,
        viewof candidate_chart_style,
        candidate_votes_legend,
        candidate_hexmap
    `
>}}

## Party Votes

```html
<iframe
    frameborder="0"
    width="100%"
    src="https://observablehq.com/embed/145c825f4a902622?cells=md_3,md_4,viewof party_chart_style,party_vote_legend,party_chart">
</iframe>
```

{{<observable-iframe
    notebook="145c825f4a902622"
    cells=`
        md_3,
        md_4,
        viewof party_chart_style,
        party_vote_legend,
        party_chart,
    `
>}}

## Party Votes (Relative Lean)

```html
<iframe
    frameborder="0"
    width="100%"
    src="https://observablehq.com/embed/145c825f4a902622?cells=md_5,md_6,viewof rel_party_chart_style,rel_party_vote_legend,rel_party_chart">
</iframe>
```

{{<observable-iframe
    notebook="145c825f4a902622"
    cells=`
        md_5,
        md_6,
        viewof rel_party_chart_style,
        rel_party_vote_legend,
        rel_party_chart
    `
>}}