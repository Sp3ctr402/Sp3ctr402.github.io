# Warum Markdown für den Blog der pragmatische Weg ist

Markdown ist für eine persönliche Seite ein sehr sauberer Content-Workflow. Der Text bleibt leichtgewichtig, versionierbar und kann ohne CMS gepflegt werden.

## Vorteile

- schnell zu schreiben
- gut in Git nachvollziehbar
- technisch unabhängig vom UI
- leicht später in andere Systeme überführbar

## Für diese Seite besonders relevant

Der Blog soll **ohne Seitenreload** funktionieren, aber trotzdem angenehm pflegbar bleiben. Markdown ist dafür ein guter Mittelweg zwischen Einfachheit und Struktur.

## Konsequenz für die Architektur

Die Übersicht arbeitet mit Metadaten, die Detailansicht lädt den eigentlichen Markdown-Inhalt nach.
