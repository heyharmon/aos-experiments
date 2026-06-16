# Agent OS — document set

A technology-agnostic vision for organizing AI work by **agents**, and for the **brain** that work runs on. Two peer architecture docs.

| Doc | What it is | Answers |
| --- | --- | --- |
| `OVERVIEW.md` | **The 2-minute digest** | The whole thing, distilled — start here. |
| `AGENT_ARCHITECTURE.md` | **Vision & invariants — the system** | *What* the agent system is and *why* — agents, roles, loops, telemetry, autonomy, evaluation, improvement. |
| `BRAIN_ARCHITECTURE.md` | **Vision & invariants — the brain** | *What* the context substrate is and *why* — the two areas, OKF, the conventions agents read and write through. |
| `TOOLS.md` | **Building block: tools** | How an agent reaches beyond the brain (Gmail, a data API): the tool/account/grant model, consequence-tagged actions, CLI-first and caching. A part agents use, not a third peer. |

## Get started

You don't build from these docs by hand. A coding agent does it for you.

1. Open a coding agent (Claude Code or similar) in an empty folder.
2. Paste this:

   ```
   Read recipes/kits/starter-kit.md from <this repo> and build it for me here.
   ```

3. Answer its questions. Done — you have a working brain plus a personal assistant.

That's the [Starter Kit](./recipes/kits/starter-kit.md), the smallest end-to-end system. Grow it later by adding more agents onto the same brain. To pick different parts, see [`recipes/README.md`](./recipes/README.md).

## On the Open Knowledge Format (OKF)

The brain's one format commitment is [OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf): the knowledge layer conforms to it (markdown + YAML frontmatter).