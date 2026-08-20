---
title: Conjugation
layout: single
draft: false
---

How French verbs are conjugated across different tenses and moods - differentiating between whether they are: 
- <span>known</span>
- <span class="kinda-know">kinda known</span>
- <span class="unknown">unknown</span>

(by me)

<table>
  <thead>
    <tr>
      <th></th>
      <th colspan="2">Form</th>
    </tr>
    <tr>
      <th>Mood</th>
      <th class="group">Simple</th>
      <th class="group">Composé</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="group">Infinitive</td>
      <td>Infinitive</td>
      <td>Past Infinitive</td>
    </tr>
    <tr>
      <td class="group" rowspan="4">Indicative</td>
      <td>Present</td>
      <td>Passé composé</td>
    </tr>
    <tr>
      <td>Imperfect</td>
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
      <td class="group">Conditional</td>
      <td>Conditional</td>
      <td>Past conditional</td>
    </tr>
    <tr>
      <td class="group">Imperative</td>
      <td>Imperative</td>
      <td class="unknown">Past imperative</td>
    </tr>
    <tr>
      <td class="group" rowspan="2">Subjunctive</td>
      <td>Subjunctive</td>
      <td class="kinda-know">Past subjunctive</td>
    </tr>
    <tr>
      <td class="unknown">Imperfect subj.</td>
      <td class="unknown">Plus-que-parfait subj.</td>
    </tr>
  </tbody>
</table>

> There is a Past conditional 2ⁿᵈ form but I'm leaving it out here because it's too damn niche.

## Participles

Weird lil guys who aren't really(?) their own conjugation, but are used
in other conjugations.

<table>
  <thead>
    <tr>
      <th>Simple</th>
      <th>Composé</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Past participle</td>
      <td>-</td>
    </tr>
    <tr>
      <td>Present participle</td>
      <td class="kinda-know">Perfect participle</td>
    </tr>
  </tbody>
</table>

> The gerund is a thing, but I decided to leave it out here seeing as it's 
> pretty much just the present/perfect participles with *en* at the front.


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
