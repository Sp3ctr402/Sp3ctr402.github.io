# Sauberer Deploy-Flow mit Vite und GitHub Pages

Vite ist lokal schnell, GitHub Pages ist als Hosting robust und günstig. Die wichtige Stelle liegt **nicht im Framework**, sondern im sauberen Ablauf zwischen Entwicklung und Deployment.

## Der Kern des Flows

- `src/` enthält die eigentliche Anwendung
- `public/` enthält statische Assets und Content-Dateien
- `dist/` ist das Build-Ergebnis
- GitHub Actions baut und veröffentlicht automatisch

## Warum das sinnvoll ist

Wenn Entwicklung und Auslieferung sauber getrennt sind, entstehen weniger Fehler:

- keine versehentlich hochgeladenen Quellpfade
- keine weiße Seite durch falschen Veröffentlichungsordner
- konsistente Produktionsbuilds

## Praktischer Vorteil

Für GitHub Pages ist das ideal, weil die Plattform nur statische Dateien ausliefert. Die Build-Arbeit übernimmt dabei die Action.

```bash
npm run build
```

Der lokale Build ist wichtig, wenn du vor dem Push prüfen willst, ob die Produktionsversion korrekt aussieht.
