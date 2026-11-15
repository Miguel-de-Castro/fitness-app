# Landing page

Página estática (HTML e CSS puros, sem build, sem JavaScript, sem CDN) que apresenta o projeto. O app em si roda só localmente; esta pasta não faz parte do build do app.

## Ver localmente

Qualquer servidor estático serve, por exemplo:

```bash
npx serve landing
```

ou `python -m http.server 8080 --directory landing`. Abra o endereço indicado.

## Deploy na Vercel

1. Crie um projeto novo importando este repositório.
2. Em **Root Directory**, informe `landing`.
3. **Framework Preset**: Other. Deixe Build Command e Output Directory vazios.

Os cabeçalhos de segurança (CSP restrita, `X-Frame-Options`, etc.) e `cleanUrls` vêm de `landing/vercel.json`.

## Imagens e licenças

Os prints em `static/` vêm de `docs/screenshots/` e mostram um ícone neutro no lugar das animações dos exercícios, que são © Gym visual e não podem ser redistribuídas. As fontes Geist e JetBrains Mono (OFL 1.1) estão em `static/fonts/` com suas licenças.

A imagem de compartilhamento (`static/og.png`) é referenciada por URL absoluta do `raw.githubusercontent.com`, que só funciona depois do merge na `main`. Se mudar de domínio, atualize as metas `og:image` e `twitter:image` em `index.html`.
