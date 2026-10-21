# Loong Chay Wen — portfolio

A personal notebook-style portfolio for a Computer Science / AI undergraduate at APU, featuring ShipSync, Lexi-Lens and academic team projects.

[Current hosted portfolio](https://loong-chay-wen-portfolio.honestmule.chatgpt.site/)

## Run

```powershell
py -3.11 -m http.server 8080 --directory site
```

Open `http://localhost:8080/`. The static entry point is `site/index.html`. No build step or server secret is required. Existing Sites hosting identity, credentials and deployment metadata are intentionally excluded from this GitHub repository. Creating this repository does not migrate hosting.

## Project samples

`site/demos/shipsync/` contains the full interface with a read-only synthetic transport. It does not connect a real mailbox, persist server decisions or send mail.

`site/demos/lexi-lens/` is permanently in sample mode. Prepared text and browser reading tools are available; live AI and capture are unavailable.

The website distinguishes original team capabilities, my original responsibilities and later personal refinements. Full application sources are maintained in separate private personal-edition repositories: [ShipSync personal edition](https://github.com/chaywen/shipsync-personal) and [Lexi-Lens personal edition](https://github.com/chaywen/lexi-lens-personal). These links require access while the repositories remain private. Original team repositories: [ShipSync](https://github.com/chaywen/averis-hackathon-2026) and [Lexi-Lens](https://github.com/chaywen/lexi-lens).

## Ownership and assets

The portfolio includes my résumé and contact details intentionally intended for recruitment. The avatar / illustration and music are assets from the supplied portfolio workspace. Project code retains its original ownership. Font and other third-party notices belong alongside their assets; no blanket MIT licence is added to this repository.

See [verification](docs/VERIFICATION.md). Visual QA in an actual browser and real-service end-to-end checks remain outstanding.
