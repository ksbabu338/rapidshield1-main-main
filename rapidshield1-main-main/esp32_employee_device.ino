/*
  RapidShield — Employee Speaker Device (BUZZER TEST VERSION)
  =============================================================
  Uses a passive buzzer instead of I2S DAC + Speaker.
  No MAX98357A needed. Just: ESP32 + buzzer + button + LED.

  Wiring:
    Passive Buzzer:
      (+) → GPIO 22
      (-) → GND

    SOS Button:
      One leg → GPIO 4
      Other leg → GND (internal pull-up used)

    Status LED:
      GPIO 2 (built-in LED on most DevKits)
*/

#include <WiFi.h>
#include <WiFiUdp.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — Change per device
// ═══════════════════════════════════════════════════════════════

#define DEVICE_ID "SPK_EMP_01"

const char* WIFI_SSID = "RapidShield_Net";
const char* WIFI_PASS = "rapidshield2025";

const char* RPI_IP = "192.168.4.1";
const int RPI_SOS_PORT = 8080;
const int UDP_PORT = 9999;

// ═══════════════════════════════════════════════════════════════
// PIN DEFINITIONS
// ═══════════════════════════════════════════════════════════════

#define BUZZER_PIN 22
#define SOS_BUTTON_PIN 4
#define STATUS_LED_PIN 2

// LEDC channel for buzzer PWM
#define BUZZER_CHANNEL 0

// ═══════════════════════════════════════════════════════════════
// GLOBALS
// ═══════════════════════════════════════════════════════════════

WiFiUDP udp;
bool alertActive = false;
String currentAlertType = "";
int currentFloor = 0;
String currentZone = "";
unsigned long lastSOSPress = 0;
const unsigned long SOS_DEBOUNCE_MS = 3000;

// ═══════════════════════════════════════════════════════════════
// BUZZER — Passive buzzer via PWM (no DAC/speaker needed)
// ═══════════════════════════════════════════════════════════════

void setupBuzzer() {
    ledcAttach(BUZZER_PIN, 2000, 8);  // pin, initial freq, 8-bit resolution
    Serial.println("[BUZZER] Passive buzzer on GPIO 22");
}

void buzzTone(int frequency, int durationMs) {
    ledcWriteTone(BUZZER_PIN, frequency);
    delay(durationMs);
    ledcWriteTone(BUZZER_PIN, 0);
}

void buzzOff() {
    ledcWriteTone(BUZZER_PIN, 0);
}

// ═══════════════════════════════════════════════════════════════
// ALERT SOUNDS — Different patterns per crisis type
// ═══════════════════════════════════════════════════════════════

void playAlertBeeps() {
    for (int i = 0; i < 3; i++) {
        buzzTone(2000, 150);
        delay(100);
    }
    delay(200);
}

void playSOSConfirmBeep() {
    buzzTone(800, 200);
    delay(50);
    buzzTone(1200, 200);
    delay(50);
    buzzTone(1600, 400);
}

void announceAlert(String alertType, int floor, String zone) {
    Serial.printf("\n[ALERT] *** %s *** — Floor %d Zone %s\n",
                  alertType.c_str(), floor, zone.c_str());
    Serial.println("[ALERT] SOS BUTTON IS NOW ARMED\n");

    // Attention beeps
    playAlertBeeps();
    delay(300);

    if (alertType == "fire_smoke") {
        // Fire: rapid high beeps
        for (int i = 0; i < 6; i++) {
            buzzTone(2500, 100);
            delay(80);
        }
    } else if (alertType == "explosion") {
        // Explosion: long low alarm
        buzzTone(500, 800);
        delay(200);
        buzzTone(500, 800);
    } else if (alertType == "flood_water") {
        // Flood: rising siren
        for (int f = 400; f < 1200; f += 50) {
            buzzTone(f, 30);
        }
    } else if (alertType == "electrical_spark") {
        // Electrical: crackling
        for (int i = 0; i < 8; i++) {
            buzzTone(1800 + random(0, 500), 50);
            delay(30);
        }
    } else {
        // Generic alarm
        for (int i = 0; i < 3; i++) {
            buzzTone(1500, 300);
            delay(200);
        }
    }

    delay(500);
    playAlertBeeps();
    buzzOff();
}

// ═══════════════════════════════════════════════════════════════
// WiFi
// ═══════════════════════════════════════════════════════════════

void connectWiFi() {
    Serial.printf("[WIFI] Connecting to %s", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
        digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WIFI] Connected — IP: %s\n", WiFi.localIP().toString().c_str());
        digitalWrite(STATUS_LED_PIN, HIGH);
        delay(500);
        digitalWrite(STATUS_LED_PIN, LOW);
    } else {
        Serial.println("\n[WIFI] FAILED — will retry");
    }
}

// ═══════════════════════════════════════════════════════════════
// SOS — HTTP POST to RPi5
// ═══════════════════════════════════════════════════════════════

void sendSOS() {
    Serial.println("[SOS] >>> SENDING SOS TO RPi5 <<<");

    // Rapid blink
    for (int i = 0; i < 5; i++) {
        digitalWrite(STATUS_LED_PIN, HIGH);
        delay(50);
        digitalWrite(STATUS_LED_PIN, LOW);
        delay(50);
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[SOS] WiFi not connected");
        return;
    }

    HTTPClient http;
    String url = String("http://") + RPI_IP + ":" + RPI_SOS_PORT + "/sos";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String body = "{\"device_id\":\"" + String(DEVICE_ID) + "\"}";
    int code = http.POST(body);

    if (code == 200) {
        String response = http.getString();
        Serial.printf("[SOS] RPi5 says: %s\n", response.c_str());
        playSOSConfirmBeep();
    } else {
        Serial.printf("[SOS] Failed — HTTP %d\n", code);
    }

    http.end();
}

// ═══════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("=========================================");
    Serial.println("  RAPIDSHIELD EMPLOYEE DEVICE (BUZZER)");
    Serial.printf("  ID: %s\n", DEVICE_ID);
    Serial.println("=========================================");

    pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);
    pinMode(STATUS_LED_PIN, OUTPUT);
    digitalWrite(STATUS_LED_PIN, LOW);

    setupBuzzer();
    connectWiFi();

    udp.begin(UDP_PORT);
    Serial.printf("[UDP] Listening on port %d\n", UDP_PORT);

    // Boot beep
    buzzTone(1000, 200);
    delay(100);
    buzzTone(1500, 200);
    buzzOff();

    Serial.println("[READY] Waiting for alerts...\n");
}

// ═══════════════════════════════════════════════════════════════
// LOOP
// ═══════════════════════════════════════════════════════════════

void loop() {
    // 1. Check UDP from RPi5
    int packetSize = udp.parsePacket();
    if (packetSize > 0) {
        char buffer[512];
        int len = udp.read(buffer, sizeof(buffer) - 1);
        buffer[len] = '\0';

        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, buffer);

        if (!err) {
            String cmd = doc["cmd"].as<String>();

            if (cmd == "ALERT") {
                currentAlertType = doc["type"].as<String>();
                currentFloor = doc["floor"].as<int>();
                currentZone = doc["zone"].as<String>();
                alertActive = true;

                digitalWrite(STATUS_LED_PIN, HIGH);
                announceAlert(currentAlertType, currentFloor, currentZone);

            } else if (cmd == "CLEAR") {
                alertActive = false;
                currentAlertType = "";
                digitalWrite(STATUS_LED_PIN, LOW);
                Serial.println("[OK] Alert cleared — SOS disarmed");
                buzzTone(800, 300);
                buzzOff();

            } else if (cmd == "SOS_CONFIRMED") {
                Serial.println("[SOS] Help is on the way!");
                playSOSConfirmBeep();
                delay(200);
                playSOSConfirmBeep();
                buzzOff();
            }
        }
    }

    // 2. Check SOS button
    if (digitalRead(SOS_BUTTON_PIN) == LOW) {
        delay(200);
        if (digitalRead(SOS_BUTTON_PIN) == LOW) {
            unsigned long now = millis();
            if (alertActive && (now - lastSOSPress > SOS_DEBOUNCE_MS)) {
                lastSOSPress = now;
                sendSOS();
            } else if (!alertActive) {
                Serial.println("[SOS] No active alert — button ignored");
            }
        }
    }

    // 3. Reconnect WiFi if dropped
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WIFI] Lost — reconnecting...");
        connectWiFi();
        if (WiFi.status() == WL_CONNECTED) {
            udp.begin(UDP_PORT);
        }
    }

    delay(10);
}
