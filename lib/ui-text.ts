import { translations, Language } from "./i18n";
// Source-language keys are UI text only. User-authored content is never translated.
const rows = `
Send invitation from aftersales@yyachts.de|Invia invito da aftersales@yyachts.de|Enviar invitación desde aftersales@yyachts.de|Einladung von aftersales@yyachts.de senden
Invitation email sent from aftersales@yyachts.de|Email di invito inviata da aftersales@yyachts.de|Invitación enviada desde aftersales@yyachts.de|Einladung von aftersales@yyachts.de gesendet
This personal link opens only this claim. No access code is required.|Questo link personale apre solo questo claim. Non serve alcun codice di accesso.|Este enlace personal abre solo esta reclamación. No se requiere código de acceso.|Dieser persönliche Link öffnet nur diesen Claim. Kein Zugangscode erforderlich.
Unable to send invitation email|Impossibile inviare l'email di invito|No se puede enviar la invitación|Einladungs-E-Mail konnte nicht gesendet werden

Invitation unavailable|Invito non disponibile|Invitación no disponible|Einladung nicht verfügbar
Wait one minute before requesting another code|Attendi un minuto prima di richiedere un altro codice|Espera un minuto antes de solicitar otro código|Vor dem Anfordern eines neuen Codes eine Minute warten
Unable to deliver verification email|Impossibile inviare l'email di verifica|No se puede enviar el correo de verificación|Bestätigungs-E-Mail konnte nicht gesendet werden
Enter a six digit code|Inserisci un codice di sei cifre|Introduce un código de seis cifras|Sechsstelligen Code eingeben
Invalid or expired code|Codice non valido o scaduto|Código no válido o caducado|Ungültiger oder abgelaufener Code
Code already used|Codice già utilizzato|Código ya utilizado|Code bereits verwendet
Email and password required|Email e password richieste|Se requieren correo y contraseña|E-Mail und Passwort erforderlich
Too many attempts. Try again in 15 minutes|Troppi tentativi. Riprova tra 15 minuti|Demasiados intentos. Reintenta en 15 minutos|Zu viele Versuche. In 15 Minuten erneut versuchen
Invalid session|Sessione non valida|Sesión no válida|Ungültige Sitzung
Sign in again after credential update|Accedi nuovamente dopo l'aggiornamento delle credenziali|Vuelve a iniciar sesión tras cambiar las credenciales|Nach Änderung der Zugangsdaten erneut anmelden
Email verification required|È richiesta la verifica email|Se requiere verificación por correo|E-Mail-Verifizierung erforderlich
Claim details updated|Dati claim aggiornati|Datos de reclamación actualizados|Claim-Daten aktualisiert
Claim submitted for director validation|Claim inviato per la validazione del direttore|Reclamación enviada para validación del director|Claim zur Freigabe durch den Direktor eingereicht
Director approval|Approvazione del direttore|Aprobación del director|Genehmigung durch den Direktor

Yacht {name} ({hull}) created.|Yacht {name} ({hull}) creato.|Yate {name} ({hull}) creado.|Yacht {name} ({hull}) erstellt.
The claim was saved, but {count} attachment(s) could not be uploaded. Retry the remaining files below or open the claim.|Il claim è salvato, ma {count} allegati non sono stati caricati. Riprova oppure apri il claim.|La reclamación está guardada, pero no se pudieron subir {count} adjuntos. Reintenta o abre la reclamación.|Der Claim wurde gespeichert, aber {count} Anhänge konnten nicht hochgeladen werden. Erneut versuchen oder Claim öffnen.
Expires {date}|Scade il {date}|Caduca el {date}|Läuft ab am {date}
Sign in required|Accesso richiesto|Inicio de sesión necesario|Anmeldung erforderlich
Session expired|Sessione scaduta|Sesión caducada|Sitzung abgelaufen
Invalid credentials|Credenziali non valide|Credenciales no válidas|Ungültige Zugangsdaten
Invalid email or password|Email o password non valide|Correo o contraseña incorrectos|Ungültige E-Mail oder Passwort
Unable to complete request|Impossibile completare la richiesta|No se puede completar la solicitud|Anfrage konnte nicht abgeschlossen werden
Account unavailable|Account non disponibile|Cuenta no disponible|Konto nicht verfügbar
Director required|Accesso direttore richiesto|Se requiere acceso de director|Direktorzugriff erforderlich
Not permitted|Operazione non consentita|Operación no permitida|Nicht erlaubt
Invalid user fields|Dati utente non validi|Datos de usuario no válidos|Ungültige Benutzerdaten
Email already registered|Email già registrata|Correo ya registrado|E-Mail bereits registriert
Unknown yacht|Yacht sconosciuto|Yate desconocido|Unbekannte Yacht
User not found|Utente non trovato|Usuario no encontrado|Benutzer nicht gefunden
Yacht not found|Yacht non trovato|Yate no encontrado|Yacht nicht gefunden
Claim not found|Claim non trovato|Reclamación no encontrada|Claim nicht gefunden
Invalid yacht fields|Dati yacht non validi|Datos del yate no válidos|Ungültige Yachtdaten
Invalid claim fields|Dati claim non validi|Datos de reclamación no válidos|Ungültige Claim-Daten
A yacht with this hull number already exists|Esiste già uno yacht con questo numero di scafo|Ya existe un yate con este número de casco|Eine Yacht mit dieser Rumpfnummer ist bereits vorhanden
Delivery date and warranty duration must be supplied together|Inserisci insieme data di consegna e durata della garanzia|Introduce juntos la fecha de entrega y la duración de garantía|Auslieferungsdatum und Garantiedauer müssen zusammen angegeben werden
Invalid delivery date|Data di consegna non valida|Fecha de entrega no válida|Ungültiges Auslieferungsdatum
This yacht was changed by another session. Reload before saving|Lo yacht è stato modificato da un'altra sessione. Ricarica prima di salvare|Otra sesión ha modificado el yate. Recarga antes de guardar|Die Yacht wurde in einer anderen Sitzung geändert. Vor dem Speichern neu laden
Invalid supplier fields|Dati fornitore non validi|Datos del proveedor no válidos|Ungültige Lieferantendaten
Supplier not found|Fornitore non trovato|Proveedor no encontrado|Lieferant nicht gefunden
Invalid update|Modifica non valida|Cambio no válido|Ungültige Änderung
No changes supplied|Nessuna modifica inserita|No se han indicado cambios|Keine Änderungen angegeben
Invalid deadline|Scadenza non valida|Fecha objetivo no válida|Ungültiger Zieltermin
Choose an active yard team member|Scegli un membro attivo del cantiere|Elige un miembro activo del astillero|Wählen Sie ein aktives Werftmitglied
Director approval required|È richiesta l'approvazione del direttore|Se requiere aprobación del director|Genehmigung des Direktors erforderlich
This status change is not allowed|Questo cambio di stato non è consentito|Este cambio de estado no está permitido|Diese Statusänderung ist nicht erlaubt
The claim changed. Refresh and try again|Il claim è cambiato. Aggiorna e riprova|La reclamación ha cambiado. Actualiza y reintenta|Der Claim wurde geändert. Aktualisieren und erneut versuchen
Rejection reason required|È necessario indicare il motivo del rifiuto|Indica el motivo del rechazo|Ablehnungsgrund erforderlich
Claim has already been validated. Refresh the page|Il claim è già stato validato. Aggiorna la pagina|La reclamación ya está validada. Actualiza la página|Der Claim wurde bereits freigegeben. Seite aktualisieren
Email delivery is not configured|L'invio email non è configurato|El envío de correo no está configurado|E-Mail-Versand ist nicht konfiguriert
Invalid invitation|Invito non valido|Invitación no válida|Ungültige Einladung
Invalid comment|Commento non valido|Comentario no válido|Ungültiger Kommentar
File required|È necessario selezionare un file|Selecciona un archivo|Datei erforderlich
Maximum file size is 5 MB|La dimensione massima del file è 5 MB|El tamaño máximo es 5 MB|Maximale Dateigröße: 5 MB
Document not available|Documento non disponibile|Documento no disponible|Dokument nicht verfügbar
Cannot deactivate your own account|Non puoi disattivare il tuo account|No puedes desactivar tu propia cuenta|Das eigene Konto kann nicht deaktiviert werden

Director|Direttore|Director|Direktor
Staff|Personale cantiere|Personal del astillero|Werftpersonal
Representative|Rappresentante yacht|Representante del yate|Yachtvertreter
Supplier|Fornitore|Proveedor|Lieferant
Use at least 8 characters, including a letter, a number and a special character. Uppercase letters are optional.|Usa almeno 8 caratteri, con una lettera, un numero e un carattere speciale. Le maiuscole sono facoltative.|Usa al menos 8 caracteres con una letra, un número y un carácter especial. Las mayúsculas son opcionales.|Mindestens 8 Zeichen mit einem Buchstaben, einer Zahl und einem Sonderzeichen. Großbuchstaben sind optional.

1 year|1 anno|1 año|1 Jahr
2 years|2 anni|2 años|2 Jahre
Actions|Azioni|Acciones|Aktionen
Activate|Attiva|Activar|Aktivieren
Active|Attivo|Activo|Aktiv
Administrator access required|Accesso amministratore richiesto|Se requiere acceso de administrador|Administratorzugriff erforderlich
Approve|Approva|Aprobar|Genehmigen
Assigned yachts|Yacht assegnati|Yates asignados|Zugewiesene Yachten
Attachment visibility|Visibilità allegati|Visibilidad de adjuntos|Sichtbarkeit der Anhänge
Brand|Marca|Marca|Marke
Cancel|Annulla|Cancelar|Abbrechen
Cancel / Back to yacht|Annulla / Torna allo yacht|Cancelar / Volver al yate|Abbrechen / Zurück zur Yacht
Captain (optional)|Comandante (facoltativo)|Capitán (opcional)|Kapitän (optional)
Captain|Comandante|Capitán|Kapitän
Check your email. The code expires in 10 minutes.|Controlla la tua email. Il codice scade tra 10 minuti.|Revisa tu correo. El código caduca en 10 minutos.|Prüfen Sie Ihre E-Mail. Der Code läuft in 10 Minuten ab.
Claim access link|Link di accesso al claim|Enlace de acceso a la reclamación|Claim-Zugangslink
Claim filters|Filtri claim|Filtros de reclamaciones|Claim-Filter
Claim not found.|Claim non trovato.|Reclamación no encontrada.|Claim nicht gefunden.
Claims|Claim|Reclamaciones|Claims
Color code|Codice colore|Código de color|Farbcode
Comments|Commenti|Comentarios|Kommentare
Company|Società|Empresa|Unternehmen
Contact name|Nome referente|Nombre del contacto|Kontaktname
Copy link|Copia link|Copiar enlace|Link kopieren
Copy this link and send it to the authorized email address:|Copia questo link e invialo all'indirizzo email autorizzato:|Copia este enlace y envíalo al correo autorizado:|Kopieren Sie diesen Link und senden Sie ihn an die autorisierte E-Mail-Adresse:
Create access link|Crea link di accesso|Crear enlace de acceso|Zugangslink erstellen
Create account|Crea account|Crear cuenta|Konto erstellen
Create claim|Crea claim|Crear reclamación|Claim erstellen
Create yacht|Crea yacht|Crear yate|Yacht erstellen
Current status|Stato attuale|Estado actual|Aktueller Status
Deactivate|Disattiva|Desactivar|Deaktivieren
Dealer|Dealer|Distribuidor|Händler
Delivered|Consegnato|Entregado|Ausgeliefert
Delivery to customer|Consegna al cliente|Entrega al cliente|Kundenauslieferung
Director access required|Accesso direttore richiesto|Se requiere acceso de director|Direktorzugriff erforderlich
Director approval is required before this claim can advance or close.|Il direttore deve approvare il claim prima che possa avanzare o essere chiuso.|El director debe aprobar la reclamación antes de avanzar o cerrarla.|Der Direktor muss den Claim vor dem Fortschritt oder Abschluss genehmigen.
Director validation|Validazione del direttore|Validación del director|Freigabe durch den Direktor
Each attachment must be non-empty and no larger than 5 MB.|Ogni allegato deve contenere dati e non superare 5 MB.|Cada adjunto debe contener datos y no superar 5 MB.|Jeder Anhang muss Daten enthalten und darf höchstens 5 MB groß sein.
Edit supplier|Modifica fornitore|Editar proveedor|Lieferant bearbeiten
Edit yacht|Modifica yacht|Editar yate|Yacht bearbeiten
Edit yacht details|Modifica dati yacht|Editar datos del yate|Yachtdaten bearbeiten
Email|Email|Correo electrónico|E-Mail
Equipment|Equipaggiamenti|Equipos|Ausrüstung
Expired|Scaduto|Caducado|Abgelaufen
Expires in days|Scadenza tra giorni|Caduca en días|Läuft ab in Tagen
Hull number|Numero di scafo|Número de casco|Rumpfnummer
Inactive|Disattivato|Inactivo|Inaktiv
Inactive member — choose another|Utente disattivato: scegli un altro responsabile|Usuario inactivo: elige otro responsable|Inaktiver Benutzer: anderen Verantwortlichen wählen
Internal history|Cronologia interna|Historial interno|Interner Verlauf
Internal operations, customer access and supplier portal|Gestione interna, accesso clienti e portale fornitori|Gestión interna, acceso de clientes y portal de proveedores|Interne Verwaltung, Kundenzugang und Lieferantenportal
Leave delivery blank if the yacht has not yet been delivered. Enter power with its unit, e.g. kW, hp or BTU/h.|Lascia vuota la consegna se lo yacht non è ancora consegnato. Indica l'unità della potenza, ad esempio kW, hp o BTU/h.|Deja la entrega vacía si el yate aún no se ha entregado. Indica la unidad de potencia, p. ej. kW, hp o BTU/h.|Auslieferung bei noch nicht ausgelieferten Yachten leer lassen. Leistung mit Einheit angeben, z. B. kW, hp oder BTU/h.
Letters, numbers, dots, hyphens and underscores|Lettere, numeri, punti, trattini e underscore|Letras, números, puntos, guiones y guiones bajos|Buchstaben, Zahlen, Punkte, Bindestriche und Unterstriche
Loading claim...|Caricamento claim…|Cargando reclamación…|Claim wird geladen…
Loading yacht overview...|Caricamento scheda yacht…|Cargando ficha del yate…|Yachtübersicht wird geladen…
Loading yachts…|Caricamento yacht…|Cargando yates…|Yachten werden geladen…
Logging in...|Accesso in corso…|Iniciando sesión…|Anmeldung läuft…
Login|Accedi|Iniciar sesión|Anmelden
Model|Modello|Modelo|Modell
My Yacht|Il mio yacht|Mi yate|Meine Yacht
New supplier|Nuovo fornitore|Nuevo proveedor|Neuer Lieferant
Next|Successivo|Siguiente|Weiter
No claims yet.|Nessun claim registrato.|No hay reclamaciones registradas.|Noch keine Claims vorhanden.
No suppliers registered.|Nessun fornitore registrato.|No hay proveedores registrados.|Keine Lieferanten registriert.
No yacht assigned or available.|Nessuno yacht assegnato o disponibile.|No hay yates asignados o disponibles.|Keine Yacht zugewiesen oder verfügbar.
No yachts assigned to this account.|Nessuno yacht assegnato a questo account.|No hay yates asignados a esta cuenta.|Diesem Konto sind keine Yachten zugewiesen.
No yachts yet. Create the first yacht to start registering claims.|Nessuno yacht registrato. Crea il primo yacht per registrare i claim.|No hay yates. Crea el primero para registrar reclamaciones.|Noch keine Yachten. Erstellen Sie die erste Yacht, um Claims zu erfassen.
Not specified|Non specificato|Sin especificar|Nicht angegeben
Open saved claim|Apri claim salvato|Abrir reclamación guardada|Gespeicherten Claim öffnen
Open yachts|Apri yacht|Abrir yates|Yachten öffnen
Opening the link requires verification via email.|L'apertura del link richiede la verifica via email.|Abrir el enlace requiere verificación por correo.|Das Öffnen des Links erfordert eine E-Mail-Verifizierung.
Owner / company (optional)|Armatore / società (facoltativo)|Armador / empresa (opcional)|Eigner / Unternehmen (optional)
Owner / company|Armatore / società|Armador / empresa|Eigner / Unternehmen
Paint type|Tipo di pittura|Tipo de pintura|Lacktyp
Painting systems|Cicli di pitturazione|Sistemas de pintura|Lacksysteme
Participant|Partecipante|Participante|Teilnehmer
Password|Password|Contraseña|Passwort
Pending assessment|In attesa di valutazione|Pendiente de evaluación|Bewertung ausstehend
Phone (optional)|Telefono (facoltativo)|Teléfono (opcional)|Telefon (optional)
Photos and documents|Foto e documenti|Fotos y documentos|Fotos und Dokumente
Photos and documents (optional, max 5 MB each, up to 10 files)|Foto e documenti (facoltativi, max 5 MB ciascuno, fino a 10 file)|Fotos y documentos (opcionales, máx. 5 MB cada uno, hasta 10 archivos)|Fotos und Dokumente (optional, max. 5 MB je Datei, bis zu 10 Dateien)
Photos and documents can be added to each claim.|Foto e documenti possono essere aggiunti a ciascun claim.|Se pueden añadir fotos y documentos a cada reclamación.|Fotos und Dokumente können jedem Claim hinzugefügt werden.
Please sign in|Accedi al tuo account|Inicia sesión|Bitte anmelden
Please sign in to view yachts|Accedi per visualizzare gli yacht|Inicia sesión para ver los yates|Zum Anzeigen der Yachten anmelden
Please sign in to view your yachts|Accedi per visualizzare i tuoi yacht|Inicia sesión para ver tus yates|Zum Anzeigen Ihrer Yachten anmelden
Power (include unit)|Potenza (indicare unità)|Potencia (indicar unidad)|Leistung (mit Einheit)
Power|Potenza|Potencia|Leistung
Previous|Precedente|Anterior|Zurück
Product brand|Marca prodotto|Marca del producto|Produktmarke
Reject|Respingi|Rechazar|Ablehnen
Rejection reason|Motivo del rifiuto|Motivo del rechazo|Ablehnungsgrund
Representatives receive access when assigned to this yacht in Users.|I rappresentanti ricevono accesso quando vengono assegnati allo yacht nella sezione Utenti.|Los representantes reciben acceso al asignarlos al yate en Usuarios.|Vertreter erhalten Zugriff durch Zuweisung zur Yacht unter Benutzer.
Response|Risposta|Respuesta|Antwort
Retry remaining attachments|Riprova allegati rimanenti|Reintentar adjuntos pendientes|Verbleibende Anhänge erneut versuchen
Revoke access|Revoca accesso|Revocar acceso|Zugriff widerrufen
Revoked|Revocato|Revocado|Widerrufen
Role|Ruolo|Rol|Rolle
Save supplier|Salva fornitore|Guardar proveedor|Lieferant speichern
Select next status|Seleziona prossimo stato|Selecciona el siguiente estado|Nächsten Status wählen
Select no more than 10 attachments.|Seleziona al massimo 10 allegati.|Selecciona un máximo de 10 adjuntos.|Höchstens 10 Anhänge auswählen.
Send verification code|Invia codice di verifica|Enviar código de verificación|Bestätigungscode senden
Serial Nr|Numero di serie|Número de serie|Seriennummer
Share this claim|Condividi questo claim|Compartir esta reclamación|Diesen Claim teilen
Sign in with your assigned account.|Accedi con l'account che ti è stato assegnato.|Accede con la cuenta asignada.|Melden Sie sich mit Ihrem zugewiesenen Konto an.
Submit response|Invia risposta|Enviar respuesta|Antwort senden
Supplier assignment records responsibility. To grant access, use Share this claim separately.|L'assegnazione al fornitore registra la responsabilità. Per concedere accesso, usa separatamente Condividi questo claim.|Asignar un proveedor registra la responsabilidad. Para conceder acceso, usa Compartir esta reclamación.|Die Lieferantenzuweisung erfasst die Zuständigkeit. Zugriff wird separat über Diesen Claim teilen gewährt.
Supplier directory|Anagrafica fornitori|Directorio de proveedores|Lieferantenverzeichnis
Supplier pending|In attesa del fornitore|Pendiente del proveedor|Wartet auf Lieferant
Target completion|Scadenza prevista|Fecha objetivo|Zieltermin
The claim starts as New / Pending director validation. Attachments follow the visibility selected above.|Il claim viene creato come Nuovo / In attesa di validazione del direttore. Gli allegati seguono la visibilità selezionata.|La reclamación se crea como Nueva / Pendiente de validación del director. Los adjuntos respetan la visibilidad seleccionada.|Der Claim startet als Neu / Freigabe ausstehend. Anhänge erhalten die ausgewählte Sichtbarkeit.
The invitation grants access to shared comments, photos and documents only.|L'invito consente l'accesso solo a commenti, foto e documenti condivisi.|La invitación permite acceder solo a comentarios, fotos y documentos compartidos.|Die Einladung gewährt nur Zugriff auf geteilte Kommentare, Fotos und Dokumente.
This invitation is unavailable or expired.|Questo invito non è disponibile o è scaduto.|Esta invitación no está disponible o ha caducado.|Diese Einladung ist nicht verfügbar oder abgelaufen.
Unable to connect|Impossibile connettersi|No se puede conectar|Verbindung nicht möglich
Unable to load assignment options|Impossibile caricare le opzioni di assegnazione|No se pueden cargar las opciones de asignación|Zuweisungsoptionen konnten nicht geladen werden
Unable to load claim|Impossibile caricare il claim|No se puede cargar la reclamación|Claim konnte nicht geladen werden
Unable to load yacht|Impossibile caricare lo yacht|No se puede cargar el yate|Yacht konnte nicht geladen werden
Unable to load yachts|Impossibile caricare gli yacht|No se pueden cargar los yates|Yachten konnten nicht geladen werden
Unable to login|Accesso non riuscito|No se puede iniciar sesión|Anmeldung fehlgeschlagen
Upload photo or document (max 5 MB)|Carica foto o documento (max 5 MB)|Subir foto o documento (máx. 5 MB)|Foto oder Dokument hochladen (max. 5 MB)
Users and yacht access|Utenti e accesso agli yacht|Usuarios y acceso a yates|Benutzer und Yachtzugriff
Verification code|Codice di verifica|Código de verificación|Bestätigungscode
Verify access using a code sent to the email address authorized by the yard.|Verifica l'accesso con il codice inviato all'indirizzo email autorizzato dal cantiere.|Verifica el acceso con el código enviado al correo autorizado por el astillero.|Bestätigen Sie den Zugriff mit dem Code an die von der Werft autorisierte E-Mail-Adresse.
Verify and open claim|Verifica e apri claim|Verificar y abrir reclamación|Bestätigen und Claim öffnen
Warranty|Garanzia|Garantía|Garantie
Warranty expiry (from delivery)|Scadenza garanzia (dalla consegna)|Vencimiento de garantía (desde entrega)|Garantieende (ab Auslieferung)
Warranty expiry|Scadenza garanzia|Vencimiento de garantía|Garantieende
Warranty until|Garanzia fino al|Garantía hasta|Garantie bis
YYachts · Claim access|YYachts · Accesso al claim|YYachts · Acceso a reclamaciones|YYachts · Claim-Zugriff
Yacht|Yacht|Yate|Yacht
Yacht Overview|Scheda yacht|Ficha del yate|Yachtübersicht
Yacht details|Dati yacht|Datos del yate|Yachtdaten
Yacht name|Nome yacht|Nombre del yate|Yachtname
Yacht not found.|Yacht non trovato.|Yate no encontrado.|Yacht nicht gefunden.
Yacht warranty duration|Durata garanzia yacht|Duración de garantía del yate|Dauer der Yachtgarantie
Yacht warranty|Garanzia yacht|Garantía del yate|Yachtgarantie
Yard access required|Accesso cantiere richiesto|Se requiere acceso del astillero|Werftzugriff erforderlich
Year built|Anno di costruzione|Año de construcción|Baujahr
Your account cannot create claims|Il tuo account non può creare claim|Tu cuenta no puede crear reclamaciones|Ihr Konto kann keine Claims erstellen
or ask the yard to assign your yacht.|oppure chiedi al cantiere di assegnarti lo yacht.|o pide al astillero que te asigne el yate.|oder bitten Sie die Werft, Ihnen die Yacht zuzuweisen.
Engine|Motore|Motor|Motor
Genset|Generatore|Generador|Generator
Bow thruster|Elica di prua|Hélice de proa|Bugstrahlruder
Stern thruster|Elica di poppa|Hélice de popa|Heckstrahlruder
Propeller(s)|Elica/e|Hélice(s)|Propeller
Air conditioning|Aria condizionata|Aire acondicionado|Klimaanlage
Watermaker|Dissalatore|Potabilizadora|Wassermacher
Hull painting system|Ciclo pitturazione scafo|Sistema de pintura del casco|Rumpflacksystem
Deck painting system|Ciclo pitturazione coperta|Sistema de pintura de cubierta|Decklacksystem
First name|Nome|Nombre|Vorname
Last name|Cognome|Apellidos|Nachname
Technical profile|Profilo tecnico|Perfil técnico|Technisches Profil
Field|Campo|Campo|Feld
Value|Valore|Valor|Wert
Unit|Unità|Unidad|Einheit
New field|Nuovo campo|Nuevo campo|Neues Feld
Add document|Aggiungi documento|Añadir documento|Dokument hinzufügen
New custom field|Nuovo campo personalizzato|Nuevo campo personalizado|Neues benutzerdefiniertes Feld
Remove field|Rimuovi campo|Eliminar campo|Feld entfernen
Section|Sezione|Sección|Bereich
No documents yet.|Nessun documento caricato.|No hay documentos.|Noch keine Dokumente.
`;
export const uiText: Record<string, Record<Language, string>> = {};
for (const [key, value] of Object.entries(translations.en)) {
  uiText[value] = Object.fromEntries(
    (["en", "it", "es", "de"] as Language[]).map((lang) => [
      lang,
      translations[lang][key as keyof typeof translations.en],
    ]),
  ) as Record<Language, string>;
}
for (const row of rows.trim().split("\n").filter(Boolean)) {
  const [en, it, es, de] = row.split("|");
  if (!en || !it || !es || !de) throw new Error("Invalid translation row");
  uiText[en] = { en, it, es, de };
}
export function translateText(
  text: string,
  language: Language,
  values?: Record<string, string | number>,
): string {
  const interpolate = (text: string) =>
    text.replace(/\{(\w+)\}/g, (match, key) => String(values?.[key] ?? match));
  const aliases: Record<string, string> = {
    director: "Director",
    staff: "Staff",
    representative: "Representative",
    supplier: "Supplier",
    dealer: "Dealer",
    shared: "Shared with authorized participants",
    internal: "Internal to yard",
    not_covered: "Not covered",
    supplier_pending: "Waiting for supplier",
    in_progress: "In progress",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    new: "New",
    assigned: "Assigned",
    closed: "Closed",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    covered: "Covered",
    goodwill: "Goodwill",
  };
  text = aliases[text] || text;
  if (language === "en") return interpolate(text);
  if (uiText[text]) return interpolate(uiText[text][language]);
  // Punctuation belongs to the label; identifiers and user text are passed through.
  const match = text.match(/^(· )?(.*?)(:|:)$/);
  if (match && uiText[match[2]])
    return (match[1] || "") + uiText[match[2]][language] + ":";
  return text;
}
