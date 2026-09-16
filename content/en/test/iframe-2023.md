---
title: Iframe Test
date: 2026-09-16
---

Checking to see what the tooltip looks like in the iframe embedding of the 2023 viz.

{{<observable-iframe
    notebook="@pjpscriv/nz-electorate-hexmap"
    cells=`
        md_2,
        viewof candidate_chart_style,
        candidate_votes_legend,
        candidate_hexmap
    `
>}}
