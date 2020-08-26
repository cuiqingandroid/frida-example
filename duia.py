import frida
import sys

device = frida.get_usb_device()
session = device.attach('com.duia.duiaapp')

jsfilename = 'duia.js'
jsstr = open(jsfilename, mode='r', encoding='utf-8').read()


def on_message(message, data):
    print(message, data)


script = session.create_script(jsstr)
script.on("message", on_message)
script.load()
sys.stdin.read()