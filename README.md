# Zahlenjagd

Zahlenjagd ist ein lokales OBS-Abenteuerspiel für Twitch. Der Chat wählt die Route durch zwei Akte, sammelt Stärke und verfolgt den Rivalen bis zur Neonspitze. Die Karte lässt sich vor jedem Lauf neu würfeln.

## Testversion 0.1

1. Das Windows-ZIP aus der [Testversion 0.1](https://github.com/Timur18o4/Zahlenjagd/releases/tag/v0.1.0) in einen beschreibbaren Ordner entpacken. Voraussetzung ist Node.js 22 oder neuer.
2. `Zahlenjagd-starten.cmd` doppelklicken. Die [Regie](http://127.0.0.1:8793/) öffnet sich im Browser.
3. In OBS eine Browserquelle mit `http://127.0.0.1:8793/overlay` anlegen. Breite auf 1920, Höhe auf 1080 stellen und „Audio über OBS steuern“ aktivieren.
4. Mit **Handtest starten** die Route selbst wählen. Für Zuschauer unter **Twitch-Kanal** den Namen oder Link eintragen, **Kanal verbinden** anklicken und nach dem Verbindungsaufbau **Chat-Runde starten** wählen.

Der erste gültige Befehl von `!a` bis `!e` entscheidet an jeder Kreuzung. Während eines Kampfs oder eines Wegwechsels wartet das Spiel auf den nächsten Wegpunkt.

**Zahlenjagd beenden** in der Regie stoppt das lokale Programm. Der ausgewählte Twitch-Kanal bleibt im Unterordner `data` gespeichert.

Die [Anleitung](Anleitung.txt) beschreibt Spielregeln und OBS-Einrichtung. Die [Musik-Credits](Musik-Credits.txt) enthalten Urheber, Lizenzen und den Kopiertext für Stream- oder VOD-Beschreibungen.
