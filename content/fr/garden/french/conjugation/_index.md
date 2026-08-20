---
title: Conjugaison
layout: single
draft: false
---

Comment les verbes français se conjuguent selon les différents temps et modes - en différenciant selon que je les :
- <span>maîtrise</span>
- <span class="kinda-know">maîtrise à peu près</span>
- <span class="unknown">ne maîtrise pas</span>

<table>
  <thead>
    <tr>
      <th></th>
      <th colspan="2">Forme</th>
    </tr>
    <tr>
      <th>Mode</th>
      <th class="group">Simple</th>
      <th class="group">Composé</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="group">Infinitif</td>
      <td>Infinitif</td>
      <td>Infinitif passé</td>
    </tr>
    <tr>
      <td class="group" rowspan="4">Indicatif</td>
      <td>Présent</td>
      <td>Passé composé</td>
    </tr>
    <tr>
      <td>Imparfait</td>
      <td>Plus-que-parfait</td>
    </tr>
    <tr>
      <td>Futur simple</td>
      <td>Futur antérieur</td>
    </tr>
    <tr>
      <td class="kinda-know">Passé simple</td>
      <td class="unknown">Passé antérieur</td>
    </tr>
    <tr>
      <td class="group">Conditionnel</td>
      <td>Conditionnel présent</td>
      <td>Conditionnel passé</td>
    </tr>
    <tr>
      <td class="group">Impératif</td>
      <td>Impératif présent</td>
      <td class="unknown">Impératif passé</td>
    </tr>
    <tr>
      <td class="group" rowspan="2">Subjonctif</td>
      <td>Subjonctif présent</td>
      <td class="kinda-know">Subjonctif passé</td>
    </tr>
    <tr>
      <td class="unknown">Subjonctif imparfait</td>
      <td class="unknown">Subjonctif plus-que-parfait</td>
    </tr>
  </tbody>
</table>

> Il existe un Conditionnel passé 2ᵉ forme mais je le laisse de côté ici car c'est vraiment trop pointu.

## Participes

De petits trucs bizarres qui ne sont pas vraiment(?) des conjugaisons à part entière, mais qui sont utilisés dans d'autres conjugaisons.

<table>
  <thead>
    <tr>
      <th>Simple</th>
      <th>Composé</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Participe passé</td>
      <td>-</td>
    </tr>
    <tr>
      <td>Participe présent</td>
      <td class="kinda-know">Participe parfait</td>
    </tr>
  </tbody>
</table>

> Le gérondif existe, mais j'ai décidé de le laisser de côté ici car c'est à peu près juste les participes présent/parfait avec *en* devant.


{{< page-css >}}
<style>
  .group {
    opacity: 0.5;
    font-weight: normal;
    font-style: italic;
  }
  
  .unknown {
    opacity: 0.3;
    text-decoration: line-through;
  }
  
  .kinda-know {
    opacity: 0.5;
  }
  
  tbody tr:has(> .group) {
    border-top: 1px solid var(--border-color);
  }

  blockquote {
    margin-top: 2em;
  }
</style>
{{< /page-css >}}
