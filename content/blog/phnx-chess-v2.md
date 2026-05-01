# PHNX-Chess V2

*01. Mai 2026 · Writing · Blog · Schach*

Verbesserte Bewertung & V2.1 – Inkrementelle Evaluation.

## Wie bewertet eine Schach‑Engine?

Eine Schach‑Engine muss jeder Stellung eine numerische Bewertung zuweisen. Diese Bewertung ist eine heuristische Funktion, die die relative Qualität der Position misst – sie schätzt, wie wahrscheinlich ein Sieg, Remis oder Verlust ist. In der Praxis wird die Bewertung als Summe mehrerer Feature‑Termen modelliert. Der wichtigste Beitrag ist fast immer das materielle Gleichgewicht: das Verhältnis von Figurenwerten wie Dame, Turm, Läufer, Springer und Bauern. Weitere häufige Features sind:

- **Standort der Figuren:** Gute Felder (z. B. zentrale Felder für Springer) erhöhen den Wert, schlechte Felder verringern ihn. Diese Informationen werden oft in Piece‑Square Tables (PSQT) kodiert.
- **Mobilität:** Wie viele legale Züge hat die Seite? Eine höhere Mobilität deutet auf mehr Möglichkeiten hin.
- **Bauernstruktur:** Doppelte, blockierte oder isolierte Bauern werden bestraft, weil sie langfristige Schwächen darstellen.
- **Königssicherheit:** Offene Linien zum König oder fehlende Bauernschilde werden negativ bewertet.
- **Spielphase:** Im Endspiel werden Schwerfiguren und Bauern anders bewertet als im Mittelspiel; daher interpolieren viele Engines zwischen unterschiedlichen Tabellen.

Die Bewertung wird aus Sicht der zu ziehenden Seite zurückgegeben, sodass NegaMax oder Alpha‑Beta‑Search mit symmetrischer Bewertung arbeiten kann. [Wiki](https://www.chessprogramming.org/Evaluation)

## Evaluation in frühen Versionen (V0/V1)

In frühen Versionen einer Engine konzentriert sich die Bewertung häufig nur auf das Material. Eine einfache Bewertungsfunktion könnte etwa lauten:
```cpp
int material_score(const Position& pos) {
    return 100 * (pos.count(WHITE, PAWN)   - pos.count(BLACK, PAWN))
         + 300 * (pos.count(WHITE, KNIGHT) - pos.count(BLACK, KNIGHT))
         + 300 * (pos.count(WHITE, BISHOP) - pos.count(BLACK, BISHOP))
         + 500 * (pos.count(WHITE, ROOK)   - pos.count(BLACK, ROOK))
         + 900 * (pos.count(WHITE, QUEEN)  - pos.count(BLACK, QUEEN));
}
```
Diese Funktion zählt die Anzahl jeder Figur und multipliziert sie mit einem festen Wert. In V0 und V1 der PHNX‑Engine war die Bewertung im Wesentlichen materialbasiert – eventuell ergänzt durch einfache Bonusterme für Bauernstrukturen oder Mobilität. Der Vorteil solcher Funktionen: Sie sind schnell und leicht zu implementieren. Ihr Nachteil: Sie unterscheiden nicht zwischen guten und schlechten Feldern für die Figuren und berücksichtigen die Spielphase kaum und gehen auf viele wichtige Dinge einer Position gar nicht ein (Königssicherheit, Schachmatt, Fianchettos etc).

## Piece-Square Tables (PSQT) - die Rettung ?

Piece‑Square Tables sind Tabellen, die jedem Feld für jede Figur einen Wert zuweisen. Für jede Farb‑ und Figurenart existiert eine Tabelle mit 64 Einträgen. Die Werte geben an, wie günstig der Standort ist. Figuren werden für zentralere oder aktivere Felder belohnt, für Rand‑ und Eckfelder bestraft. Moderne Engines verwenden zwei Sätze solcher Tabellen – einen fürs Mittelspiel und einen fürs Endspiel – und interpolieren die Werte abhängig von der Spielphase. Das ermöglicht es, dass sich die Bedeutung eines Feldes im Verlauf der Partie ändert.

Die folgenden Ausschnitte aus der Datei EvalData.hpp illustrieren das Konzept. Die Arrays MG_PIECE_VALUE und EG_PIECE_VALUE enthalten die Grundwerte der Figuren. Die Arrays MG_PSQT und EG_PSQT definieren die Piece‑Square Tables für Mittel- und Endspiel:
```cpp
namespace __EVALDATA {
    constexpr int GAME_PHASE_MAX = 24;

    // Materialwerte für Mittelspiel und Endspiel
    constexpr Value MG_PIECE_VALUE[PIECE_TYPE_NB] = { 0, 82, 337, 365, 477, 1025, 0, 0 };
    constexpr Value EG_PIECE_VALUE[PIECE_TYPE_NB] = { 0, 94, 281, 297, 512, 936, 0, 0 };

    // Spielphaseninkremente für jede Figur
    constexpr int GAME_PHASE_INC[PIECE_TYPE_NB] = { 0, 0, 1, 1, 2, 4, 0, 0 };

    // Piece‑Square Tables für das Mittelspiel (nur Bauern und Springer gezeigt)
    inline constexpr Value MG_PSQT[PIECE_TYPE_NB][SQUARE_NB] = {
        /* NONE_PT */ { /* 64 Nullen */ },
        /* PAWN */    { 0, 0, 0, 0, 0, 0, 0, 0,
                        -35, -1, -20, -23, -15, 24, 38, -22,
                        -26, -4, -4, -10, 3, 3, 33, -12,
                        /* … weitere Reihen … */ },
        /* KNIGHT */  { -105, -21, -58, -33, -17, -28, -19, -23,
                        -29, -53, -12,  -3,  -1, 18, -14, -19,
                        /* … weitere Reihen … */ },
        /* … */
    };

    // Endspiel‑Piece‑Square Tables sind ähnlich aufgebaut in EG_PSQT
}
```

Jeder Eintrag repräsentiert einen Bonus oder Malus in Zentipawns (1/100 Bauer). Für einen Springer erhöht sich der Score beispielsweise, wenn er zentral platziert wird, und sinkt, wenn er am Brettrand steht. Die relativ komplexen Tabellen (wie im Code oben) stammen oft aus Tuning‑Experimenten oder aus bekannten Sätzen wie PeSTO.

## Inkrementelle Evaluation (V2.1)

Beim Durchsuchen des Spielbaums in Alpha‑Beta‑Suche werden Millionen von Stellungen erzeugt. Eine naive Bewertungsfunktion würde jede Stellung vollständig neu berechnen. Das ist ineffizient, denn ein einzelner Zug verändert nur wenige Figuren und Felder. Hier setzt die inkrementelle Bewertung an: Statt die gesamte Summe von Material und PSQT bei jedem Zug zu berechnen, merkt sich die Engine den derzeitigen Evaluationsscore und aktualisiert ihn nur für die betroffenen Figuren. Das Chessprogramming‑Wiki betont, dass sich PSQT‑Werte dank ihrer Tabellennatur sehr gut inkrementell updaten lassen. Weitere globale Variablen wie Material oder Hash‑Keys werden ähnlich geführt.

In EvalData.hpp gibt es dazu Funktionen wie _PieceScore, die die Einzelbewertung für eine Figur auf einem Feld liefern. Beim Ausführen eines Zuges wird dieser Wert von der Ausgangsposition abgezogen und für das Zielfeld (und ggf. eine geschlagene Figur) addiert. Das folgende vereinfachte Beispiel zeigt, wie dies in einer Engine aussehen könnte:
```cpp
void Position::make_move(const Move& mv) {
    Piece moved     = board[mv.from];
    Piece captured  = board[mv.to];

    // Entferne Bewertung des ziehenden Stücks vom alten Feld
    evalScore -= __EVALDATA::_PieceScore(moved, mv.from);

    // Wenn ein Gegenspieler geschlagen wurde, entferne dessen Score
    if (captured != NO_PIECE)
        evalScore -= __EVALDATA::_PieceScore(captured, mv.to);

    // Setze das Stück auf das neue Feld und addiere dessen Score
    board[mv.to] = moved;

    evalScore += __EVALDATA::_PieceScore(moved, mv.to);
    // ggf. mehr Logik für Promotions, Rochaden etc.
}
```
Dieser inkrementelle Ansatz soll die Zeit pro Bewertung reduzieren und hält die Cache‑Lokalisierung hoch, weil dieselben Datenstrukturen wiederverwendet werden. Besonders in tiefen Suchen summiert sich dieser Vorteil.

## Fazit

Eine starke Evaluierungsfunktion ist das Herzstück jeder Schach‑Engine. Während frühe Versionen meist nur das Material berücksichtigten, erweitert Version 2 die Bewertung um ortsabhängige Boni (PSQT), Spielphasen‑Interpolation und spezielle Heuristiken wie das Mop‑Up (das forcieren des gegnerischen Königs in eine Spielfeldecke) zum konsequenten Verwerten gewonnener Stellungen. Die inkrementelle Evaluation in Version 2.1 reduziert zudem den Rechenaufwand und beschleunigt die Suche erheblich. Diese Konzepte bilden die Grundlage vieler moderner Engines und sind hervorragende Lernbeispiele für das Design effizienter Bewertungsfunktionen. [Github](github.com/Sp3ctr402)