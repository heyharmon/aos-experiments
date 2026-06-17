# Notes

Loose, unfiled engineering notes. Each should be filed into the brain (an ADR or
a reference doc) via ./bin/brain and then marked filed. Do not hand-edit
knowledge/.

- id: n1
  status: filed
  note: "Team agreed in standup: cap the sink to at most 8 concurrent page writes to avoid exhausting file handles on large sites, enforced in src/io/sink.ts. Decide and record as an ADR."
