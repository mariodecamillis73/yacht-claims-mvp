# YY ASM — riprendere il progetto da un altro account ChatGPT

Questa guida serve a cambiare l'account con cui lavori con ChatGPT, mantenendo lo stesso software, repository e servizio online. Non richiede di ricreare YY ASM o di spostare il database, se conservi l'accesso agli attuali account GitHub e Render.

## Prima di lasciare il vecchio account

1. Conserva l'accesso al tuo account GitHub e a Render, oltre a YES System. Le credenziali di YY ASM e quelle Microsoft 365 sono separate.
2. Verifica che le ultime modifiche siano salvate nel repository e che PROJECT_STATUS.md indichi l'ultimo risultato realmente verificato online.
3. Scarica questi documenti dal repository: PROJECT_STATUS.md, MIGRATION_HANDOFF.md, AGENTS.md e STAGING_DEPLOYMENT.md.
4. Scarica dai file salvati di questo account l'archivio privato `YES-export-2026-11-16.zip`. Contiene i dati originali estratti da YES: 39 yacht, 878 claim, 2.027 commenti/voci di cronologia e le impronte dei file. Contiene dati aziendali: conservalo in un luogo aziendale autorizzato, separato dal codice.
5. Conserva un backup verificato del database online e degli allegati. I backup sul disco Render sono una protezione aggiuntiva, non una copia esterna. Il cambio di account ChatGPT non sostituisce questa precauzione.
6. Conserva password e metodi MFA nel gestore password autorizzato. Non inserirli nei documenti di passaggio.

## Nel nuovo account ChatGPT

1. Crea un progetto chiamato **YY ASM** e carica i documenti del punto 3. Se occorre lavorare sui dati originali, carica anche l'archivio YES in un ambiente autorizzato.
2. Collega GitHub e Render usando gli stessi account esterni che possiedono il progetto. Verifica che sia disponibile l'accesso al repository e al servizio indicati sotto. Questi collegamenti vanno verificati nel nuovo account: non presumere che passino insieme ai documenti.
3. Per consultare YES, configura nuovamente l'accesso sicuro ed eventualmente la procedura personale `access-yes-system`. Non trasferire cookie, sessioni browser o password tramite chat o repository.
4. Incolla il messaggio di ripresa riportato sotto.
5. Prima di autorizzare nuovi caricamenti, fai verificare l'ultimo commit live, i conteggi esistenti e il registro di importazione. Un'importazione già eseguita non deve essere duplicata.

## Collegamenti e riferimenti

| Elemento | Riferimento |
| --- | --- |
| Software online | https://yy-asm-staging.onrender.com |
| Codice | https://github.com/mariodecamillis73/yacht-claims-mvp |
| Branch attualmente usato da Render | `feature/staging-ready` — verificare prima di lavorare, non presumere `main` |
| Stato aggiornato | https://github.com/mariodecamillis73/yacht-claims-mvp/blob/feature/staging-ready/PROJECT_STATUS.md |
| Servizio Render | `yy-asm-staging` / `srv-dbk68oe7bikc7399cql0` |
| Fonte ufficiale migrazione | YES System, https://www.yes.navy/client/ |
| Accesso amministratore YY ASM | `aftersales@yyachts.de` — password nel canale sicuro personale, non in questo file |
| Database online | SQLite su disco persistente Render; non sostituirlo con database di sviluppo |

## Messaggio pronto da incollare

> Riprendiamo YY ASM, il gestionale After Sales di YYachts. Leggi prima PROJECT_STATUS.md, MIGRATION_HANDOFF.md, AGENTS.md e STAGING_DEPLOYMENT.md. Il repository è mariodecamillis73/yacht-claims-mvp; il branch attualmente collegato a Render è feature/staging-ready. Verifica il servizio yy-asm-staging e l'ultimo commit effettivamente live prima di modificare dati. YES System è la fonte ufficiale della migrazione: conserva gli ID YES originali, l'associazione yacht/claim, Date of Delivery, Engine, Generator, Hull Paint e commenti. Controlla il registro dell'importazione prima di ripeterla. Non eliminare dati o azzerare il database. Mantieni le quattro lingue EN/IT/ES/DE, Prev/Next e i permessi per singolo claim. Salva regolarmente codice e stato del lavoro su GitHub. Non considerare la cronologia della vecchia chat o le vecchie sessioni di accesso automaticamente disponibili. Dimmi cosa risulta completato e riparti dal primo punto ancora aperto.

## Limiti da controllare al momento del passaggio

- La guida è un metodo di continuità basato su file e servizi esterni; non promette una migrazione automatica della cronologia o di tutte le impostazioni fra account ChatGPT.
- Le funzioni disponibili nel nuovo account dipendono dal relativo piano, workspace, plugin e autorizzazioni. Verificarle prima di disattivare l'account precedente.
- L'invio email reale da aftersales@yyachts.de richiede configurazione e autorizzazione del servizio email. Il pulsante di recupero password non elimina questo requisito.
- L'archivio YES include i nomi degli allegati presenti nei commenti, ma non i file binari degli allegati. Non confonderlo con un backup completo del database YY ASM.
- Lo stato delle attività cambia: PROJECT_STATUS.md deve prevalere sulle fotografie storiche contenute nelle conversazioni.

Riferimento ufficiale per l'organizzazione di progetti, chat, file e istruzioni in ChatGPT: https://learn.chatgpt.com/docs/projects?surface=app . Per il trasferimento operativo di YY ASM seguire i riferimenti GitHub/Render sopra, senza presupporre una funzione di trasferimento automatico tra account.
