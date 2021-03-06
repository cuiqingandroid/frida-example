import frida
import sys

device = frida.get_usb_device()
# pid = device.spawn(["com.shizhuang.duapp"])
# pid = device.spawn(["com.wonderfull.nfcmanager"])
# session = device.attach(14143)
session = device.attach('com.shizhuang.duapp')
# device.resume(pid)

jsfilename = 'dewu.js'
jsstr = open(jsfilename, mode='r', encoding='utf-8').read()


def on_message(message, data):
    print(message, data)


script = session.create_script(jsstr)
script.on("message", on_message)
script.load()
sys.stdin.read()