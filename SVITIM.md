# Zammad pro Svítím pro tebe — náš fork

Soukromá kopie [Zammadu](https://github.com/zammad/zammad) s úpravami pro zákaznickou podporu
**Svítím pro tebe / Oranžovka** (Torf Group s.r.o.). Běží na serveru `svit`,
https://podpora.svitimprotebe.cz.

**Není to GitHub „fork"** — fork veřejného projektu musí být veřejný. Je to soukromý repozitář,
do kterého se přebírají verze z oficiálního Zammadu (remote `upstream`).

## Větve

| větev | co v ní je |
|---|---|
| `svitim` | **naše hlavní větev** = oficiální Zammad + naše úpravy. Z ní se staví obraz pro server. |
| `upstream-stable` | čistá kopie oficiální větve `stable`, nikdy do ní necommitujeme |

Základ: commit `dcc41d25` (7.2.0, přesně verze, která běží na serveru od 24. 9. 2026).

## Přebírání nových verzí Zammadu

```
git fetch upstream
git branch -f upstream-stable upstream/stable
git checkout svitim && git merge upstream-stable     # konflikty řešit, pak testy
```
Po každé opravné verzi 7.2.x; velký skok (7.3) až po vyzkoušení na zkušebním Zammadu.
**Na ostrý server nikdy bez zkušebního Zammadu.**

## Jak psát úpravy, aby šlo přebírat nové verze

- Úpravy dávat **do nových souborů** (pluginy, vlastní komponenty) a do souborů Zammadu sahat
  co nejméně — každý zásah do jejich souboru je budoucí konflikt.
- Každá úprava odpovídá položce v poradníku
  `Nextcloud: IT-(automatizace-a-claude)/030_.../Vývoj SW na zákaznickou podporu/03_Vyber-nastroje/13_Poradnik-pro-fork-Zammadu.md`.
- Upstream pravidla platí dál, viz `AGENTS.md` (copyright hlavička, `i18n/*.po` neupravovat —
  české překlady řešíme v tabulce `translations` na serveru, ne v kódu).

## Pravidla pro popisy změn (commit message)

Zadal Filip 3. 10. 2026 podle rady Vládi: *„vždycky kde to bylo, co to bylo a krátký popis naší
komunikace."* Píše se **česky**. Šablona je v `.gitmessage-svitim`
(`git config commit.template .gitmessage-svitim`).

```
<oblast>: <co se změnilo, max 70 znaků>

Co a kde:
<které soubory / části aplikace, co přesně se změnilo>

Proč:
<jaký problém to řeší, co by se stalo bez toho>

Zadání:
<datum> Filip: „<citace nebo shrnutí zadání>“ (poradník bod č. X)
<případně: co jsme zvažovali a zamítli>

Co-Authored-By: Claude ... <noreply@anthropic.com>
```

**Oblasti:** `chat`, `ai`, `kb` (znalostní báze), `prehledy`, `mobil`, `bezpecnost`, `preklad`,
`upstream` (převzetí verze Zammadu), `nasazeni`, `docs`.

**Příklad:**
```
chat: Enter odesílá zprávu u chatových ticketů

Co a kde:
app/frontend/apps/desktop/.../ArticleReply — u ticketu s kanálem „chat“ Enter odešle,
Shift+Enter nový řádek. U mailů beze změny (Enter = nový řádek).

Proč:
Operátor v chatu odpovídá rychle a Enter jako nový řádek ho brzdí; v Zammadu na to
nastavení není (prohledána všechna ui_*).

Zadání:
30. 9. 2026 Filip: „já to ale chci v chatu, v mailu ne.“ (poradník bod 11)
```

Jedna úprava = jeden commit. Převzetí verze Zammadu = samostatný commit `upstream: …`.

## Sestavení a nasazení na zkušební Zammad

```
~/bin/sestav-fork.sh
```
Sestaví obraz `zammad-svitim:svitim-<commit>` (asi 16 min, s nižší prioritou a hlídáním
Nextcloudu) a pustí ho na **zkušebním Zammadu** (`~/zammad-zkusebni`, `127.0.0.1:8081`,
obnovený ze zálohy, pošta/chat/AI vypnuté). Na ostrý server až po otestování a Filipově OK.
Prohlížení: ve VS Code (Remote SSH) záložka **Ports → Forward 8081** → http://localhost:8081
