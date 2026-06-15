# Todos

- [x] The brain and agent architectures do not prescribe technology decisions except as in-line tips/examples. Let's review these in-line examples, list out all instances of them.

- [x] Recipes: The brain and agent architectures do not prescribe technology decisions except as in-line tips/examples. What I want to do is write 'recipe' docs that do prescribe specific technology and implementation decisions and a build plan. Recipe is a great analogy for an implementation doc. It's like a spec or a PRD but simple, friendly and clear. A user should be able to provide claude code or other coding agent with a recipe and kick off an agent implementation. I don't know if there should be seperate recipes for brain recipes or if both agent(s) and brain should be in one recipe. It seems like there could be a good case for seperate recipes that are combined. For example, an agent(s) recipe could recommend one or more brain recipes that are compatible with one be most ideal for the specific recipe. Perhaps our first recipe should be a simple and generic multi purpose agent and brain recipe or recipes combo. Then we can imagine some highly contextual recipes based on specific roles or use cases. Another thing to consider is that a recipe could be for a single 'role' as defined in the agent architecture doc and role recipes can be combined to build a team of roles. I like this idea because it makes recipes modular enabling someone to implement one recipe then other recipes as their need or organization need grows. Let's talk about this.

- [ ] What does the brain architecture doc say about ingesting data into the brain?

- [ ] Should AGENT_ARCHITECTURE.md be renamed ROLE_ARCHITECTURE.md given that roles are a concept higher and more important than agent?

- [ ] Does the brain architecture (or agent architecture) mention SQLite anywhere?

- [ ] Brain + Role + Kit: Separate brain recipes and role recipes; kits curate a brain + role(s) for a use case. Role recipes declare a brain dependency. Maximum modularity, mirrors the two-doc architecture.