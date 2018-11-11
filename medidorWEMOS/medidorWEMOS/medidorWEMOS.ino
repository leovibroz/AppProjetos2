#include <ArduinoJson.h>
#include <EmonLib.h>
#include <SPI.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <String.h>



// Variaveis MUX
const int S0 = 14;
const int S1 = 12;
const int S2 = 13;
const int S3 = 15;

// Variaveis Sensor Corrente
const int portAmpIn = 0;
EnergyMonitor emon1;
double fatorCorrente = 7.14;


// Variavel Leitura Analogica
const int analogIn = A0;
const int VRef = emon1.readVcc();
const int delayBetween = 300;


// Variaveis Sensor Tensao
const int portVIn = 1;
double fatorTensao;
double tensaoMedida = 120;
char incomingByte;

// Variaveis Rele
const int rele = 4;
boolean isReleOn = false;

// Variaveis Sensor Temperatura
const int portTempIn = 2;
float fatorTemperatura = 10;


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
  delay(1000);
  pinMode(BUILTIN_LED, OUTPUT);  //DEFINE O PINO COMO SAÍDA
  digitalWrite(BUILTIN_LED, LOW);
  Serial.begin(115200);

  // Rele Setup
  pinMode(rele, OUTPUT);

  // MUX Setup
  pinMode(S0, OUTPUT);
  pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT);
  pinMode(S3, OUTPUT);

  // Analog Setup
  pinMode(analogIn, INPUT);

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
  emon1.current(analogIn, fatorCorrente);

  // Tensao Setup
  fatorTensao = getFatorTensao(tensaoMedida);
}

void loop() {


  if (!client.connected()) {
    reconnect();
  }
  data["rele"] = isReleOn;
  data["tensao"] = CalcularTensao();
  data["corrente"] = CalcularCorrente();
  data["temperatura"] = CalcularTemp();
  data.prettyPrintTo(Serial);
  char JSONmessageBuffer[100];
  data.printTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
  client.publish("data", JSONmessageBuffer);
  delay(1000);



  client.loop();
}


double getFatorTensao(float tensaoMedida) {
  Serial.print("FatorTensao");
  setPortaMux(1);
  delay(delayBetween);
  fatorTensao = ((analogRead(analogIn) / 1024.0) * VRef) / tensaoMedida;
  Serial.print("Calibrando em: ");
  Serial.println(tensaoMedida);
  Serial.print("fator de tensao: ");
  Serial.println(fatorTensao);
  return fatorTensao;

}
double CalcularCorrente() {
  double amp;
  setPortaMux(portAmpIn);
  delay(delayBetween);
  amp = emon1.calcIrms(2960);
  //Serial.print("Corrente:");
  //Serial.println(amp);
  return amp;
}

double CalcularTensao() {
  double v;
  double vf = 0;
  int i;

  setPortaMux(portVIn);
  delay(delayBetween);
  v = analogRead(analogIn);
  v = (v / 1024.0) * VRef;
  v = v / fatorTensao;

  //Serial.print("Tensao:");
  //Serial.println(v);
  return v;
}

double CalcularTemp() {
  double temp;
  double tempf;

  setPortaMux(2);
  delay(delayBetween);
  
  temp = analogRead(analogIn);
  Serial.println(temp);
  temp = (temp/1024.0)*(VRef-350);
  tempf = temp/fatorTemperatura;
  return tempf;

}

void setPortaMux(int num) {
  switch (num) {
    case 0:
      digitalWrite(S0, LOW);
      digitalWrite(S1, LOW);
      digitalWrite(S2, LOW);
      digitalWrite(S3, LOW);
      break;
    case 1:
      digitalWrite(S0, HIGH);
      digitalWrite(S1, LOW);
      digitalWrite(S2, LOW);
      digitalWrite(S3, LOW);
      break;
    case 2:
      digitalWrite(S0, LOW);
      digitalWrite(S1, HIGH);
      digitalWrite(S2, LOW);
      digitalWrite(S3, LOW);
      break;
    default:
      digitalWrite(S0, LOW);
      digitalWrite(S1, LOW);
      digitalWrite(S2, LOW);
      digitalWrite(S3, LOW);
      break;
  }

}


