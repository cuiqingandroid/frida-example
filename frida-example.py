from __future__ import print_function
import frida
import sys

def on_message(message, data):
    print("[%s] => %s" % (message, data))

def main(target_process):
    session = frida.attach(target_process)

    jsfilename = 'test.js'
    jsstr = open(jsfilename, mode='r', encoding='utf-8').read()
    script = session.create_script(jsstr)
    script.on('message', on_message)
    script.load()
    print("[!] Ctrl+D on UNIX, Ctrl+Z on Windows/cmd.exe to detach from instrumented program.\n\n")
    sys.stdin.read()
    session.detach()

if __name__ == '__main__':

    target_process = 'com.shizhuang.duapp'
    main(target_process)