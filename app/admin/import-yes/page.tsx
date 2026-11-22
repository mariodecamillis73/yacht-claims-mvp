"use client";
import {useState} from 'react';
import Link from 'next/link';
import {useLanguage} from '@/components/language-provider';
export default function ImportYes(){
 const {tr}=useLanguage();
 const [source,setSource]=useState<unknown>(null),[digest,setDigest]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 async function send(action:string){
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/admin/import-yes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,source,digest})});
   const text=await r.text();let b;try{b=JSON.parse(text)}catch{throw new Error(tr('The server returned an unexpected response. Refresh the page and try again.'))}if(!r.ok)throw new Error(b.error||tr('Unable to complete request'));
   setDigest(b.digest);setDone(b.completed);
   setMessage(`${tr(b.completed?'Import completed':'Preview')}: ${b.yachts} ${tr('Yachts')}, ${b.claims} ${tr('Claims')}, ${b.comments} ${tr('Comments')}. ${tr('Previous records preserved')}: ${b.collisions.length}. ${tr('Yacht corrections')}: ${b.yachtCorrections.length}.`);
  }catch(e){setMessage(e instanceof Error?e.message:tr('Unable to complete request'))}finally{setBusy(false)}
 }
 return <main className="container page-shell"><h1>{tr('Import from YES')}</h1><p>{tr('YES is the official source. The import preserves original IDs and internal comments. A verified backup is created before changes. No invitations are sent.')}</p>
 <p>{tr('YES claims marked Closed or at 100% are imported as closed. Original statuses are retained in each description. Warranty approval and warranty duration are not inferred.')}</p>
 <label className="section">{tr('YES export')}<input type="file" accept="application/json,.json" disabled={busy} onChange={async e=>{setDigest('');setDone(false);setMessage('');try{const file=e.target.files?.[0];if(file)setSource(JSON.parse(await file.text()))}catch{setSource(null);setMessage(tr('Invalid file'))}}}/></label>
 <p className="inline-actions"><button className="button secondary" disabled={busy||!source} onClick={()=>send('preview')}>{tr('Preview')}</button>{' '}<button className="button" disabled={busy||!digest||done} onClick={()=>send('apply')}>{tr(busy?'Import in progress…':'Import from YES')}</button></p>
 <p role="status" aria-live="polite">{message}</p><Link href="/yachts">{tr('Yachts')}</Link></main>;
}
