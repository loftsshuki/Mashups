import { spawnSync } from "node:child_process"

const requireDb=process.env.RC_REQUIRE_DB==="1"
const hasDb=Boolean(process.env.FOUNDATION_PG_PORT && process.env.FOUNDATION_PG_USER)
const steps=[
 ["lint",["npm","run","lint"]],
 ["typecheck",["npm","run","typecheck"]],
 ["unit",["npm","test"]],
 ["build",["npm","run","build"]],
 ["browser-smoke",["npm","run","test:e2e:smoke"]],
]
if(hasDb) steps.splice(3,0,["database",["npm","run","test:studio:db"]])
else if(requireDb){console.error("RC database verification required but FOUNDATION_PG_PORT/FOUNDATION_PG_USER are missing.");process.exit(2)}
else console.warn("RC database verification skipped because isolated PostgreSQL is not configured.")

for(const [label,[command,...args]] of steps){
 console.log(\`\\n=== RC verify: \${label} ===\`)
 const result=spawnSync(command,args,{stdio:"inherit",shell:process.platform==="win32",env:process.env})
 if(result.status!==0){console.error(\`RC verification failed at \${label}.\`);process.exit(result.status??1)}
}
console.log("\\nRC repository verification completed. Hosted services, real audio, payments, and physical-device evidence are separate gates.")
