# pjpscriv.co.nz

My personal website! Built with [Hugo](https://gohugo.io/), using a custom theme.

## Development

The site is structured using Hugo's content, layout, and data directories. Most pages and components are managed through Hugo's templating system, with some custom HTML/CSS/JavaScript for additional features.

To run the local development server, run:
```shell
npm start
```

Work to do defined in [TASKS.md](./TASKS.md).

### Linting

This project uses [Stylelint](https://stylelint.io/) for CSS linting. The configuration lives in [`.stylelintrc.json`](/.stylelintrc.json).

To set up Stylelint simply run:
```shell
npm install
```

Then it can be run with either of these commands:

```shell
npm run lint:css
npm run lint:css:fix
```

This also gives in-IDE linting for VS Code if you have the [Stylelint extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) installed.


## Deployment

The website is deployed to [GitHub Pages](https://pages.github.com) via [@peaceiris/actions-hugo](https://github.com/peaceiris/actions-hugo).

_Originally created during the 2019 [Summer of Tech](https://www.summeroftech.co.nz/) git tutorial, using the [fluxfederation/hello-summer](https://github.com/fluxfederation/hello-summer) template._
