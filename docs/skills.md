# Skills

Skills extend Claude Code with specialized domain knowledge. They are installed globally at `~/.claude/skills/`.

## Installed Skills

| Skill | Description | Source |
|---|---|---|
| `find-skills` | Discover & install skills from skills.sh | `vercel-labs/skills` |
| `nextjs-app-router-patterns` | Next.js 15 App Router patterns & best practices | `wshobson/agents` |
| `nextjs-best-practices` | General Next.js conventions | `sickn33/antigravity-awesome-skills` |

## Managing Skills

```bash
# Search for skills
npx skills find <query>

# Install a skill globally
npx skills add <owner/repo@skill> -g -y

# Check for updates
npx skills check

# Update all
npx skills update
```

Browse: https://skills.sh

## Useful Searches for This Project

```bash
npx skills find tailwind
npx skills find react forms
npx skills find typescript
npx skills find accessibility
```
