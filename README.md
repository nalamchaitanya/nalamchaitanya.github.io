# Chaitanya Nalam's website

A Jekyll academic website using the AcademicPages / Minimal Mistakes theme from
[Siyue Liu's website](https://siyueliu112.github.io). The theme files are stored
locally; see [THEME.md](THEME.md) for source and license details.

## Edit content

- `_config.yml`: name, profile photo, contact links, and site settings.
- `_includes/biography.md`: biography shared by the home and About pages.
- `_data/publications.yml`: publications shared by the home and Publications pages.
- `_data/teaching.yml`: teaching assistance courses and semesters on the home page.
- `_data/navigation.yml`: links across the top of the site.
- `images/Profile.jpg`: existing profile photo.
- `_sass/_custom.scss`: small site-specific style adjustments.

Clicking Email reveals the plain text from `author.email_display` in
`_config.yml`. This uses a native disclosure control and works without
JavaScript; it does not open an email application.

The existing `/about/` and `/publications/` URLs remain available. Original travel
writing and legacy Jemdoc source files are retained.

## Preview locally

With Ruby and Bundler installed:

```sh
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --host 127.0.0.1
```

Open <http://127.0.0.1:4000>. Restart the server after changing `_config.yml`.

To check the production build:

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

Analytics uses the existing property and loads only in production, preserving
the site's Do Not Track setting. No remote theme or unsupported custom plugin
is required for GitHub Pages.
