# PHNX-Chess V0

*29. April 2026 · Writing · Blog · Schach*

Grundlagen und erster Release von PHNX-Chess V0.

## Was habe ich gebaut?

Mit **PHNX** habe ich eine eigene Schach‑Engine entwickelt, die von Grund auf auf Effizienz ausgelegt ist. Die erste Version (v0) legt das Fundament: Sie definiert eine boardzentrierte Darstellung mithilfe von Bitboards, implementiert grundlegende Zugtypen und unterscheidet zwischen Pseudo‑legalen und legalen Zügen. Wie ich auf diese "dumme" Idee gekommen bin und worauf es bei einer Schach-Engine ankommt, probiere ich in diesem Artikel zu erklären!

## Positionsdarstellung mit Bitboards

Eine der effizientesten Methoden, eine Schachposition darzustellen, sind sogenannte *Bitboards*. Eine *Bitboard*‑Repräsentation nutzt für das 8×8‑Brett eine 64‑Bit‑Ganzzahl. Jedes der 64 Felder entspricht einem Bit: Bit 0 repräsentiert **A1**, Bit 63 **H8**. Setzt man ein Bit auf 1, befindet sich dort eine Figur; 0 bedeutet leer. Für jede Farbe und jeden Figurentyp wird ein eigenes *Bitboard* geführt (also 2x6). Für Bewegungen auf dem Brett shiften wir die gesetzten Bits eines Bitboards um einen gewünschten Wert, sodass das gesetzte Bit an der Zielposition gesetzt ist. 

Hier ein kompacktes Beispiel für Bitboard-Operationen:

```cpp
constexpr Bitboard PawnsSecondRank  = 0xff00ULL;
constexpr Bitboard PawnsThirdRank   = PawnsSecondRank << 8;
```
> PawnsThirdRank hat nun den Wert 0xff0000.
> Wir haben die Bauern alle einen Rang nach oben geschoben, angenommen A1 = least significant Bit. 

Für nicht gleitende Figuren wie König, Springer und Bauern lassen sich Angriffs-Bitboards durch Shifts, Masken oder Lookup-Tabellen sehr direkt berechnen. Für gleitende Figuren wie Läufer, Turm und Dame müssen zusätzlich Blocker berücksichtigt werden; dafür nutzen viele Engines vorberechnete Lookup-Verfahren wie Magic Bitboards oder verwandte Techniken. Bitweise Operationen wie Popcount (Anzahl gesetzter Bits) und Bitscan (Index des niedrigsten Bits) werden genutzt, um schnell Figuren zu zählen oder iterativ über gesetzte Bits zu gehen.
[Wiki](https://www.chessprogramming.org/Bitboards)

## Aufbau eines Zuges
Ein Zug wird typischerweise als strukturierter Datensatz gespeichert. Er enthält mindestens den Ausgangs‑ und Zielindex (0 – 63), eine *Flag* zur Unterscheidung (normale Bewegung, Schlagzug, Rochade, Promotion, en Passant). In meiner Engine besteht ein Zug aus 16 Bits. Die unteren 6 Bits speichern das Zielfeld, die nächsten 6 Bits das Startfeld. Die oberen 4 Bits kodieren Sonderinformationen wie Promotion-Typ und Move-Kategorie. Um an die Infos innerhalb dieser Datenstruktur zu kommen nutzen wir einfache Bitoperationen:

```cpp
U16 data;

__forceinline constexpr Square g_FromSq() const {
    return Square((data >> 6) & 0x3F);
}
__forceinline constexpr Square g_ToSq() const {
    return Square(data & 0x3F);
}
__forceinline constexpr U16 g_FromTo()          const { return data & 0xFFF; }
__forceinline constexpr MoveType g_TypeOf()     const { return MoveType(data & (3 << 14)); }
__forceinline constexpr PieceType g_PromoType() const { return PieceType(((data >> 12) & 3) + KNIGHT); }
__forceinline constexpr U16 g_Raw()             const { return data; }
```

Damit lassen sich alle Standard‑ und Sonderzüge kodieren. Bei der Generierung werden diese Strukturen in eine MoveList geschrieben, die später vom Suchalgorithmus verarbeitet wird.
[Wiki](https://www.chessprogramming.org/Encoding_Moves)

## Zuggenerierung: Pseudo-legal vs legal

Die Engine erzeugt zunächst pseudo‑legale Züge. Diese berücksichtigen nur die Figurenbewegung und schlagen gegnerische Figuren, prüfen aber nicht, ob der eigene König im Schach bleibt. Erst im zweiten Schritt werden diese Züge auf Legalität geprüft. 

Pseudo‑legale Generatoren erzeugen alle Züge ohne Rücksicht auf Königsangriffe; das Bewegen des Königs nach f8 in einem Beispiel erzeugt einen Zug, der den König ins Schach stellt. Um legale Züge zu erhalten, prüft man nach dem Ausführen des Zuges, ob der König im Schach stünde – oder generiert gleich nur legale Züge, indem man gefährliche Felder und Pins berücksichtigt.

Die Ermittlung legaler Züge lässt sich in vier Hauptphasen gliedern:

1. **Königszüge:** Der König darf nicht auf ein von gegnerischen Figuren angegriffenes Feld ziehen. Dazu berechnet die Engine zunächst das Angriffs‑Bitboard des Gegners, indem sie temporär den eigenen König entfernt.
2. **Schachevaden:** Befindet sich der König im Schach, werden Capture‑ und Push‑Masken berechnet, um die Checking‑Figur zu schlagen oder den Strahlweg eines Schach gebenden Sliders zu blockieren. Wenn mehr als ein Angreifer vorhanden ist (Doppelschach), sind nur Königszüge erlaubt.
3. **Pins:** Figuren, die absolut zum König gepinnt sind, dürfen nur entlang der Strahlrichtung des pinnings beweglichen Sliders ziehen oder schlagen. Um Pin‑Rays zu ermitteln, werden die Strahlen von gegnerischen Slidern mit den Strahlen vom eigenen König in entgegengesetzter Richtung geschnitten.
4. **Andere Züge:** Alle übrigen Figuren können pseudo‑legale Züge ausführen, die anschließend durch die Capture‑ und Push‑Masken sowie die Pin‑Information gefiltert werden. Spezialfälle wie Rochaden und en‑Passant‑Züge benötigen zusätzliche Prüfungen – vor allem, weil en Passant zu entdecktem Schach führen kann.

PHNX-Chess verfolgt genau diesen Ansatz indem zuerst alle pseudo-legalen Züge generiert und dann gefikltert werden.
[Wiki](https://www.chessprogramming.org/Move_Generation)

## Abschluss und Ausblick

Mit Version 0 wird eine solide Grundlage geschaffen: Die Engine kann Stellungen in effizienten Bitboards darstellen und sowohl pseudo‑legale als auch legale Züge zuverlässig generieren. Im kommenden Abschnitt (Version 1) werden diese Rohdaten genutzt, um die Suche zu optimieren.

GitHub‑Projekt: Da das Repository privat ist, führt der folgende Link zur Profilseite des Projekts. Dort ist der Quellcode hinterlegt: [Github](github.com/Sp3ctr402)