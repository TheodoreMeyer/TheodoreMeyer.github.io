# TheodoreMeyer.github.io

- Repository for all my site data.
- Can be found at: [theodoremeyer.github.io](https://theodoremeyer.github.io) and [Theo.2bameyer.net](https://theo.2bameyer.net).


## Main features:
- An easy Catan game tracker.
- School: (/class-tool/)
   - A timer
   - A seating chart
   - group maker
   - Wheel Spin
- Projects
  - Contains official documentation for the below projects:
      - [Simple Voice Geyser](https://theo.2bameyer.net/projects/simplevoicegeyser/)



## Built by:
- Reactjs vite app:
     - Custom code to compile Markdown, html, and jsx into static pages compatible with gh-pages. (May later be released as a library)
- Docs:
     - Cross Repository doc system to easily pull docs from other projects. 

## Static assets

Use `pages/` for source files that generate website routes. JSX, Markdown, and HTML files under `pages/` are discovered and rendered as pages by the custom build system. Use the top-level `static/` directory for downloads and other files that should be served as-is, without page discovery or content transformation.

Vite serves `static/` directly during development and copies its contents into the root of `dist/` during a production build. The directory structure below `static/` is preserved. For example, the filesystem path `static/server/packs/s3.zip` becomes the production filesystem path `dist/server/packs/s3.zip` and is available at the public URL `/server/packs/s3.zip` when the site base is `/`.

Add ZIP files, PDFs, images, or any other static resources under `static/`, creating nested directories as needed. Reference a resource from JSX with a URL such as `<a href="/server/packs/s3.zip">Download</a>` or `<img src="/images/logo.png" alt="Logo" />`. Markdown and HTML content can use the same public URL in a link or image, for example `[Download the server pack](/server/packs/s3.zip)`.

The public URL is separate from the source filesystem path: URLs are based on the path relative to `static/`. If Vite is configured with a non-root `base` (for example, when deploying below a repository path on GitHub Pages), prefix the public path with that base, such as `/repository/server/packs/s3.zip`. This site currently uses Vite's default root base and deploys as a user site, so `static/server/packs/s3.zip` is available at `/server/packs/s3.zip` on the domain.

## Contributing
- You may contribute to this repository by submitting a pull request. 
- Please ensure that your contributions adhere to the existing code style and conventions.

### How to:
- Fork the repo
- clone it locally
- run yarn install.
   - If you don't have yarn, run 'npm install yarn' to get it.

## TODO:
- Testing
- Finish server pages
