import paho.mqtt.client as mqtt
from mqtt_secrets import *
import json
import threading
import random

UNIQUE_ID = "vacuum-test-ababab1"
BASE_TOPIC = f"homeassistant/vacuum/{UNIQUE_ID}"

DEVICE = {
    "configuration_url": "https://youtu.be/dQw4w9WgXcQ",
    "hw_version": "1.3.3.7",
    "sw_version": "1.3.3.7",
    "manufacturer": "Rick",
    "model": "nggyu_bot",
    "name": "WROOMWROOMba",
    "identifiers": [UNIQUE_ID]
}


SUPPORTED_FEATURES = ["start", "stop", "pause", "return_home", "battery",
                      "status", "locate", "clean_spot", "fan_speed", "send_command"]
FAN_SPEED_LIST = ["off", "min", "medium", "high", "turbo"]


STATE_TOPIC = f"{BASE_TOPIC}/state"
COMMAND_TOPIC = f"{BASE_TOPIC}/command"
AVAILABILITY_TOPIC = f"{BASE_TOPIC}/availability"
SET_FAN_SPEED_TOPIC = f"{BASE_TOPIC}/fanspeed"

device_state = {
    "battery_level": 100,
    "state": "idle",
    "fan_speed": "off"
}

client = mqtt.Client(UNIQUE_ID)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
client.will_set(AVAILABILITY_TOPIC, 'offline', retain=True)

# states
# cleaning
# docked
# paused
# idle
# returning
# error

# commands
# start
# pause
# stop
# clean_spot
# locate
# return_to_base


rettimer = None


def cancel_timer():
    global rettimer
    if rettimer != None:
        rettimer.cancel()
        rettimer = None


def on_timer():
    device_state["state"] = "docked"
    client.publish(STATE_TOPIC, json.dumps(device_state))
    cancel_timer()
    pass


def on_message(client: mqtt.Client, userdata, message: mqtt.MQTTMessage):
    topic = message.topic
    payload = message.payload.decode()
    print(f"New message from {topic}: {payload}")

    if topic == SET_FAN_SPEED_TOPIC:
        device_state["fan_speed"] = payload
    elif topic == COMMAND_TOPIC:
        if payload == "start":
            cancel_timer()
            device_state["state"] = "cleaning"
        elif payload == "pause":
            cancel_timer()
            device_state["state"] = "paused"
        elif payload == "stop":
            cancel_timer()
            device_state["state"] = "idle"
        elif payload == "clean_spot":
            cancel_timer()
            device_state["state"] = "cleaning"
        elif payload == "locate":
            print("BIP-BOOP!")
        elif payload == "return_to_base":
            device_state["state"] = "returning"
            global rettimer
            if rettimer == None:
                rettimer = threading.Timer(random.randint(10, 30), on_timer)
                rettimer.start()

    client.publish(STATE_TOPIC, json.dumps(device_state))


def on_connect(client: mqtt.Client, userdata, flags, rc):
    print("Connected as " + UNIQUE_ID)
    device_config = {
        "schema": "state",
        "device": DEVICE,
        "supported_features": SUPPORTED_FEATURES,
        "state_topic": STATE_TOPIC,
        "command_topic": COMMAND_TOPIC,
        "set_fan_speed_topic": SET_FAN_SPEED_TOPIC,
        "availability_topic": AVAILABILITY_TOPIC,
        "availability_mode": "any",
        "fan_speed_list": FAN_SPEED_LIST,
        "unique_id": UNIQUE_ID,
        "name": DEVICE["name"],
    }
    client.publish(f"{BASE_TOPIC}/config",
                   json.dumps(device_config), retain=True)
    # client.publish(STATE_TOPIC, json.dumps(None))
    client.publish(STATE_TOPIC, json.dumps(device_state))
    client.publish(AVAILABILITY_TOPIC, "online", retain=True)

    client.subscribe(COMMAND_TOPIC)
    client.subscribe(SET_FAN_SPEED_TOPIC)
    pass


def on_disconnect(client, userdata, rc):
    if rc != 0:
        print("Unexpected disconnection.")


client.on_message = on_message
client.on_connect = on_connect
client.on_disconnect = on_disconnect

client.connect(MQTT_SERVER, MQTT_PORT)

client.loop_forever()
