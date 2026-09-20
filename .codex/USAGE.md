# Usage diagnostics

This file is for deliberate usage investigations, not normal tasks.

When the user asks why Codex usage is high:
1. Record model + effort + whether fast mode/subagents were used.
2. Note how much broad repo discovery was required.
3. Note expensive verification loops: full build, E2E, CI/log inspection.
4. If RTK is installed, inspect `rtk gain --weekly` and `rtk discover --all --since 7`.
5. Remember RTK measures estimated terminal-output reduction, not total plan consumption.
6. Recommend the smallest change that removes repeated work: router update, narrower test, skill, or cheaper helper.

Do not create persistent per-task logs unless the user explicitly asks for measurement.
