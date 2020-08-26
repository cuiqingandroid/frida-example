import frida
import sys

# 9.0 arm 需要拦截　_ZN3art13DexFileLoader10OpenCommonEPKhjS2_jRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_NS3_10unique_ptrINS_16DexFileContainerENS3_14default_deleteISH_EEEEPNS0_12VerifyResultE
# 7.0 arm：_ZN3art7DexFile10OpenMemoryEPKhjRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPNS_6MemMapEPKNS_10OatDexFileEPS9_

# android 10: libdexfile.so /apex/com.android.runtime/lib
# #_ZN3art13DexFileLoader10OpenCommonEPKhjS2_jRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_NS3_10unique_ptrINS_16DexFileContainerENS3_14default_deleteISH_EEEEPNS0_12VerifyResultE


package = 'fm.jihua.kecheng'
device = frida.get_usb_device()
pid = device.spawn(package)
session = device.attach(pid)

jsfilename = 'dumpDex.js'
jsstr = open(jsfilename, mode='r', encoding='utf-8').read()


def on_message(message, data):
    print(message, data)

print('before script')

script = session.create_script(jsstr)
script.on("message", on_message)
script.load()
print('loaded')
# 这行代码才能唤醒app
device.resume(pid)
sys.stdin.read()