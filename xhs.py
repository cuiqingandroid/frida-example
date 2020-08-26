import frida
import sys

device = frida.get_usb_device()
session = device.attach('com.xingin.xhs')
# session = device.attach(2395)


def on_message(message, data):
    print(message, data)


with open('xhs.js', mode='r', encoding='utf-8') as f:
    jsstr = f.read()
    script = session.create_script(jsstr)
    script.on("message", on_message)
    script.load()

sys.stdin.read()