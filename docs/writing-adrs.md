# Writing ADRs

ADRs are markdown files in your project's decisions directory — `<input>/decisions/` by default, or wherever `dirs.decisions` points (see [Customizing](customizing.md)).

To create a new ADR:

1. Start from the template the package ships at `node_modules/@lullabot/eleventy-decision-records/src/YYYYMMDD-decision-template.md`
2. Name it with the decision's date and a descriptive slug, e.g. `docs/decisions/20260313-adopt-graphql.md`
3. Fill in the frontmatter fields:

| Field          | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `date`         | The decision date (`YYYY-MM-DD`)                             |
| `status`       | `accepted` or `deprecated`                                   |
| `practiceArea` | Must match a configured practice area name exactly           |
| `topics`       | Freeform list of tags (e.g., `development`, `testing`)       |
| `contributors` | People involved in the decision, sorted alphabetically       |
| `title`        | A concise statement of the decision                          |
| `context`      | One or two sentences explaining why this decision was needed |

4. Write the body using `## Decision` and `## Consequences` sections (headings appear in the table of contents).

Every field above is required. `date` in particular is read by the listing pages and the search index, and a record without one will fail the build.

The filename date is a convention that keeps records sorted on disk; the `date` frontmatter field is what the site actually orders and displays by.
