import frida
import sys

package = 'com.xingin.xhs'
device = frida.get_usb_device()
# session = device.attach(package)
pid = device.spawn(package)
session = device.attach(pid)


methodmap = {}


def on_message(message, data):
    # print(message, data)
    if message['type'] == 'send' and 'getmethodid' in message['payload']:
        arrs = message['payload'].split("|")
        addr = arrs[1]
        method = arrs[2]
        if addr in methodmap:
            # print('method ', addr , method, 'exists')
            pass
        else:
            methodmap[addr] = method
            print(addr, method)
    if message['type'] == 'send' and 'calljavamethod' in message['payload']:
        arrs = message['payload'].split("|")
        addr = arrs[1]
        print('calljavamethod method', methodmap[addr])



with open('xhs.js', mode='r', encoding='utf-8') as f:
    jsstr = f.read()
    script = session.create_script(jsstr)
    script.on("message", on_message)
    script.load()

device.resume(pid)
sys.stdin.read()