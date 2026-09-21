import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
const port=process.env.FOUNDATION_PG_PORT,user=process.env.FOUNDATION_PG_USER
if(!port||!/^\d+$/.test(port)||!user)throw new Error('Use an isolated loopback PostgreSQL cluster and set FOUNDATION_PG_PORT/USER.')
const executable=process.platform==='win32'?'psql.exe':'psql'
const database=`studio_test_${randomUUID().replaceAll('-','')}`
const run=(db,extra)=>execFileSync(executable,['-X','-q','-h','127.0.0.1','-p',port,'-U',user,'-v','ON_ERROR_STOP=1','-d',db,...extra],{stdio:'inherit',timeout:180000})
run('postgres',['-c',`CREATE DATABASE ${database}`])
try{
 run(database,['-f',fileURLToPath(new URL('../supabase/tests/foundation_controls.test.sql',import.meta.url))])
 run(database,['-f',fileURLToPath(new URL('../supabase/tests/studio_actions.test.sql',import.meta.url))])
 run(database,['-f',fileURLToPath(new URL('../supabase/tests/fake_hosted_journey.test.sql',import.meta.url))])
 run(database,['-f',fileURLToPath(new URL('../supabase/tests/native_safety.test.sql',import.meta.url))])
}finally{run('postgres',['-c',`DROP DATABASE ${database} WITH (FORCE)`])}
