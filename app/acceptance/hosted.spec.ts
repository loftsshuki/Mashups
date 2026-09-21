import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
// Explicit opt-in: this test creates a private project, renders, and may publish.
// It never invents a listening review, source grant, or service credential.
const enabled=process.env.MASHUPS_ACCEPTANCE_WRITE_OK==='staging-only'
const base=(process.env.MASHUPS_STAGING_ORIGIN??'').replace(/\/$/,'')
const token=process.env.MASHUPS_CREATOR_TOKEN
const left=process.env.MASHUPS_APPROVED_LEFT_ID,right=process.env.MASHUPS_APPROVED_RIGHT_ID
const readyPublication=process.env.MASHUPS_REVIEWED_PUBLICATION_ID
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
async function assertStaging(){
 expect(base,'Explicit staging HTTPS origin required').toMatch(/^https:\/\//)
 expect(new URL(base).origin).toBe(base)
 expect(['mashups.agency','www.mashups.agency','mashups.com','www.mashups.com']).not.toContain(new URL(base).hostname)
}
test('real catalog save, render, reload, candidate playback and selection',async({browser,request})=>{
 test.skip(!enabled||!token||!left||!right,'Requires opt-in staging and creator token plus two authorized source IDs.')
 await assertStaging();expect(left).toMatch(uuid);expect(right).toMatch(uuid)
 const id=randomUUID()
 const created=await request.post(`${base}/api/green/studio`,{headers:{Authorization:`Bearer ${token}`},data:{action:'create',projectId:id,title:`Acceptance ${id}`,leftId:left,rightId:right}})
 expect(created.status()).toBe(200);expect((await created.json()).project.id).toBe(id)
 const creator=await browser.newContext({viewport:{width:393,height:851}})
 // Attach credentials only to our same-origin studio API, never third-party assets.
 await creator.route('**/api/green/studio*',async route=>{
  const url=new URL(route.request().url())
  if(url.origin===base)await route.continue({headers:{...route.request().headers(),authorization:`Bearer ${token}`}})
  else await route.continue()
 })
 const page=await creator.newPage()
 try{
  await page.goto(`${base}/create?mode=catalog&project=${id}`)
  await expect(page.getByTestId('catalog-project-status')).toContainText('draft')
  await page.getByRole('button',{name:'Generate three real arrangements'}).click()
  await expect(page.getByTestId('catalog-project-status')).toContainText('rendering')
  await expect(page.locator('audio')).toHaveCount(3,{timeout:840000})
  await page.reload();await expect(page.locator('audio')).toHaveCount(3)
  await page.locator('audio').first().evaluate((audio:HTMLAudioElement)=>audio.play())
  await expect.poll(()=>page.locator('audio').first().evaluate((audio:HTMLAudioElement)=>audio.currentTime)).toBeGreaterThan(0)
  await page.getByRole('button',{name:'Keep this version'}).first().click()
  await page.reload();await expect(page.getByRole('button',{name:'Kept'})).toHaveCount(1)
  // No automated positive review is submitted. The unreviewed render must not publish.
  await expect(page.getByRole('button',{name:'Publish mashup'})).toBeDisabled()
 }finally{await creator.close()}
})
test('reviewed publication plays anonymously and a separate creator can fork it',async({browser,request})=>{
 test.skip(!enabled||!token||!readyPublication,'Requires a publication already approved by actual independent listeners.')
 await assertStaging();expect(readyPublication).toMatch(uuid)
 const listener=await browser.newContext({viewport:{width:390,height:844}})
 try{
  const page=await listener.newPage();await page.goto(`${base}/listen/${readyPublication}`)
  await expect(page.getByRole('region',{name:'Source credits'})).toBeVisible()
  await page.getByLabel('Play published mashup').evaluate((audio:HTMLAudioElement)=>audio.play())
  await expect.poll(()=>page.getByLabel('Play published mashup').evaluate((audio:HTMLAudioElement)=>audio.currentTime)).toBeGreaterThan(0)
  const range=await request.get(`${base}/api/green/publications/${readyPublication}/audio`,{headers:{Range:'bytes=0-1'}})
  expect(range.status()).toBe(206);expect((await range.body()).length).toBe(2)
  const link=page.getByRole('link',{name:'Make your version'});await expect(link).toHaveAttribute('href',`/create?mode=catalog&fork=${readyPublication}`)
  const child=randomUUID();const result=await request.post(`${base}/api/green/studio`,{headers:{Authorization:`Bearer ${token}`},data:{action:'fork',parentId:readyPublication,projectId:child}})
  expect(result.status()).toBe(200);expect((await result.json()).project).toMatchObject({id:child,parentProjectId:readyPublication,status:'draft',selectedCandidateId:null,candidates:[]})
 }finally{await listener.close()}
})
