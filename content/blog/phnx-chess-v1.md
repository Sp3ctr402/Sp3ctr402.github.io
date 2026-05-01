# PHNX-Chess V1

*30. April 2026 · Writing · Blog · Schach*

Verbesserte Suche durch Move Ordering.

## Motivation

Die Version 0 generierte Züge korrekt, aber die Suche durch den Spielbaum erfolgte in beliebiger Reihenfolge. Bei einem **Alpha‑Beta‑Suchalgorithmus** bestimmt die Reihenfolge der Züge maßgeblich den Zeitaufwand: je eher ein guter (also den besten zu erwartenden) Zug getestet wird, desto stärker werden die Grenzen (Alpha und Beta) verengt, wodurch viele Unterbäume gar nicht mehr untersucht werden müssen. Version 1 implementiert deshalb ein Move‑Ordering, das bewährte Heuristiken nutzt, um aussichtsreiche Züge zuerst zu prüfen. [Wiki](https://www.chessprogramming.org/Alpha-Beta)

## Heuristiken für Move Ordering

Das Chessprogramming‑Wiki beschreibt mehrere verbreitete Heuristiken, die nacheinander angewendet werden:

- **PV‑Zug (Principal Variation):** Der beste Zug aus der Vorgängeriteration der iterativen Tiefensuche. Wird er am Anfang getestet, ist die Wahrscheinlichkeit für ein schnelles cut‑off hoch.
- **Hash‑Zug:** Wenn ein Zug im Transpositionstable (TT) gespeichert ist, wird er bevorzugt untersucht.
- **Gewinnbringende Schlagzüge:** Unter den Schlagzügen werden jene nach dem MVV‑LVA‑Prinzip (Most Valuable Victim – Least Valuable Aggressor) sortiert. Ein Schlag, bei dem eine kleine eigene Figur eine große gegnerische Figur schlägt, wird höher priorisiert.
- **Gleichwertige Schlagzüge und Remiszüge:** Züge, die materiell neutral oder leicht nachteilig sind, werden danach sortiert.
- **Killer‑Züge:** Züge, die in derselben Suchtiefe bereits einen Beta‑Abbruch verursacht haben. Sie werden heuristisch als gut angenommen.
- **History‑Heuristik:** Für stille Züge ohne Schlag wird eine Tabelle geführt, wie oft ein Zug (Start‑Ziel‑Paar) auf einer Suchebene zu einem Cut‑off führte. Züge mit höherem „History‑Score“ werden früher getestet.

Die praktische Umsetzung in der Engine speichert diese Heuristik‑Werte in separaten Tabellen. Beim Generieren von Zügen werden die Züge mit Scores versehen und sortiert. Dadurch erreichen starke Züge früher die Alpha‑Beta‑Grenzen, was die Zahl der durchsuchten Knoten drastisch reduziert. [Wiki](https://www.chessprogramming.org/Move_Ordering)

## Wirkung

Die Engine schafft es in eine größere Tiefe (also weiter in die "Zukunft") zu schauen, da viele Züge furch Pruning herausgefiltert werden. Das reduziert die Anzahl an Nodes die untersucht werden, wodurch eben die größere Tiefe erreicht werden kann. Dies hat eine signifikante Steigerung der Spielstärke zur Folge.

## Fazit

Mit Move Ordering beginnt die Engine, nicht nur korrekt, sondern auch effizienter zu rechnen. Die heuristischen Priorisierungen sind klassische Werkzeuge in modernen Schachengines und bilden die Grundlage für weitere Optimierungen. [Github](github.com/Sp3ctr402)