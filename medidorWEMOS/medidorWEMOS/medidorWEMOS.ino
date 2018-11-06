#include <ArduinoJson.h>
#include <EmonLib.h>
#include <SPI.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <String.h>
// Variaveis Sensor Temperatura
const int TempIn = D3;
float temperatura;
float fatorTemperatura;

// Variaveis Sensor Corrente
const int AmpIn = A0;
float corrente;
EnergyMonitor emon1;
double fatorCorrente = 7.14;

// Variaveis Sensor Tensao
const int VIn = D5;
float tensao;
double amostras = 1000;
double fatorTensao;
double tensaoMedida = 120;
char incomingByte;

// Variaveis Rele
const int rele = 4;
boolean isReleOn = false;

// Wifi & mqtt
const char* ssid = "Andrff";        //SSID da rede WIFI
const char* password =  "12345678";    //senha da rede wifi

WiFiClient espClient;
PubSubClient client(espClient);

DynamicJsonBuffer jsonBuffer;
JsonObject& data = jsonBuffer.createObject();
//   Mqtt functions
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  if (!strcmp(topic, "arduinoComand")) {
    if (!strncmp((char *)payload, "on", length)) {
      digitalWrite(BUILTIN_LED, LOW);
      digitalWrite(rele, HIGH);
      isReleOn = true;
    } else if (!strncmp((char *)payload, "off", length)) {
      digitalWrite(BUILTIN_LED, HIGH);
      digitalWrite(rele, LOW);
      isReleOn = false;
    }
  } else if (!strcmp(topic, "calibrarMedida")) {
    char message[length];
    for (int i = 0; i < length; i++) {
      message[i] = (char)payload[i];
      //Serial.print((char)payload[i]);
    }
    message[length + 1] = '\0';
    
    Serial.println(message);
    
    char medida[length];
    
    for (int i = 0; i < length ; i++) {
      medida[i] = message[i];
    }
    String medicao = medida;
    Serial.println(medicao.toFloat());
    getFatorTensao(medicao.toFloat());
  }
}

void reconnect() {

  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("arduinoClient", "ubkxcslm", "1DB2kKyuQzf5")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("arduinoConnected", "hello world");
      // ... and resubscribe
      client.subscribe("arduinoComand");
      client.subscribe("calibrarMedida");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(500);
    }
  }
}

void setup() {
  pinMode(BUILTIN_LED, OUTPUT);  //DEFINE O PINO COMO SAÍDA
  digitalWrite(BUILTIN_LED, HIGH);
  Serial.begin(115200);

  // Wi fi begin
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Conectando...");
  }
  Serial.println("Conectado!");

  // Mqtt set up
  client.setServer("m14.cloudmqtt.com", 17240);
  client.setCallback(callback);

  // Corrente setup
  pinMode(AmpIn, INPUT);
  emon1.current(AmpIn, fatorCorrente);

  // Tensao Setup
  fatorTensao = getFatorTensao(tensaoMedida);
  pinMode(VIn, INPUT);

  // Rele Setup
  pinMode(rele, OUTPUT);
}

void loop() {


  if (!client.connected()) {
    reconnect();
  }
  data["rele"] = isReleOn;
  data["tensao"] = CalcularTensao();
  data["corrente"] = CalcularCorrente();
  data["temperatura"] = 30;
  data.prettyPrintTo(Serial);
  char JSONmessageBuffer[100];
  data.printTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
  client.publish("data", JSONmessageBuffer);
  delay(1000);
  client.loop();
}


double getFatorTensao(float tensaoMedida) {
  Serial.print("FatorTensao");
  fatorTensao = ((analogRead(VIn) / 1024.0) * 5000) / tensaoMedida;
  Serial.print("Calibrando em: ");
  Serial.println(tensaoMedida);
  Serial.print("fator de tensao: ");
  Serial.println(fatorTensao);
  return fatorTensao;

}
double CalcularCorrente() {
  double v, amp, vf;
  amp = emon1.calcIrms(2960);
  //Serial.print("Corrente:");
  //Serial.println(amp);
  return amp;

}

double CalcularTensao() {
  double v;
  double vf = 0;
  int i;

  v = analogRead(VIn);
  v = (v / 1024.0) * 5000;
  v = v / fatorTensao;

  //Serial.print("Tensao:");
  //Serial.println(v);
  return v;

}

double CalcularTemperatura() {




}

