# Writing ADRs

ADRs live in the `adrs/` directory at the repository root.

> [!IMPORTANT]
> The template ships with `adrs/*.md` in `.gitignore` so lorem-ipsum sample content (`npm run sample-content`) is never committed. After cloning the template, remove that line so your real ADRs can be committed.

To create a new ADR:

1. Copy the template: `adrs/YYYYMMDD-url-friendly-name.md.template`
2. Rename it with today's date and a descriptive slug, e.g., `adrs/20260313-adopt-graphql.md`
3. Fill in the frontmatter fields:

| Field          | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `date`         | The decision date (`YYYY-MM-DD`)                             |
| `status`       | `accepted` or `deprecated`                                   |
| `practiceArea` | Must match a name in `practiceAreas.json`                    |
| `topics`       | Freeform list of tags (e.g., `development`, `testing`)       |
| `contributors` | People involved in the decision, sorted alphabetically       |
| `title`        | A concise statement of the decision                          |
| `context`      | One or two sentences explaining why this decision was needed |

4. Write the body using `## Decision` and `## Consequences` sections (headings appear in the table of contents).
