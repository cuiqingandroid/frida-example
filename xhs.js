Process.enumerateModules({
    onMatch: function (exp) {
        // send('exp:' + exp.name);
        // console.log(exp.name);
        // console.log(typeof exp.name)
        if (exp.name === 'libshield.so') {
            send('enumerateModules find');
            send(exp.name + "|" + exp.base + "|" + exp.size + "|" + exp.path);
            send(exp);
            return 'stop';
        }
    },
    onComplete: function () {
        console.log('enumerateModules stop');
    }
});


function hook_register() {
    // libart.so 所有导出函数表
    var symbols = Module.enumerateSymbolsSync("libart.so");
    var addr_register = null;
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        var method_name = symbol.name;
        if (method_name.indexOf("art") >= 0) {

            if (method_name.indexOf("_ZN3art3JNI15RegisterNativesEP7_JNIEnvP7_jclassPK15JNINativeMethodi") >= 0) {
                addr_register = symbol.address;
            }
        }
    }

    // 开始hook
    if (addr_register) {
        Interceptor.attach(addr_register, {
            onEnter: function (args) {
                var methods = ptr(args[2]);
                var method_count = args[3];
                // console.log("[RegisterNatives] method_count:", method_count);
                for (var i = 0; i < method_count; i++) {
                    var fn_ptr = methods.add(i * Process.pointerSize * 3 + Process.pointerSize * 2).readPointer();
                    var find_module = Process.findModuleByAddress(fn_ptr);
                    var moduleName = find_module.name;
                    if (moduleName == "libshield.so") {
                        shieldBaseAddr = find_module.base;
                        console.log("module name", find_module.name);
                        console.log("module base", find_module.base);
                        console.log("\t method_name:", methods.add(i * Process.pointerSize * 3).readPointer().readCString(), "method_sign:", methods.add(i * Process.pointerSize * 3 + Process.pointerSize).readPointer().readCString(), "method_fnPtr:", fn_ptr, "method offset:", fn_ptr.sub(find_module.base));
                    }
                }
            }, onLeave(retval) {

            }
        })
    }

}

hook_register();

function getFuncAddr(baseAddr, methodAddr) {
    return new NativePointer(parseInt(baseAddr, 16) + methodAddr + 1)
}

function subaddr(addr, baseaddr) {
    return  parseInt(addr, 16)  - parseInt(baseaddr, 16)
}



var libc=Module.findExportByName(null,"dlopen");
Interceptor.attach(libc,{

        onEnter: function(args) {
            var addr = args[0];
            var str = Memory.readCString(addr);

            this.soname = str
        },
        onLeave:function(retval){
            if (this.soname.indexOf("libshield.so") > 0){
                hookShield()
            }
        }
});

//
// const NativeFunction: NativeFunctionConstructor;
//
// interface NativeFunctionConstructor {
//     new(address: NativePointerValue, retType: NativeType, argTypes: NativeType[], abiOrOptions?: NativeABI | NativeFunctionOptions): NativeFunction;
//     readonly prototype: NativeFunction;
// }
// var funcGetStringUTFChars = new NativeFunction(addrGetStringUTFChars, "pointer", ["pointer", "pointer", "pointer"]);

var ishook_libart = false;
var nativeMethods = [];
function hook_libart() {
    if (ishook_libart === true) {
        return;
    }
    var symbols = Module.enumerateSymbolsSync("libart.so");
    var addrGetStringUTFChars = null;
    var addrNewStringUTF = null;
    var addrFindClass = null;
    var addrGetMethodID = null;
    var addrGetStaticMethodID = null;
    var addrGetFieldID = null;
    var addrGetStaticFieldID = null;
    var addrRegisterNatives = null;
    var addrAllocObject = null;
    var addrCallObjectMethod = null;
    var addrGetObjectClass = null;
    var addrReleaseStringUTFChars = null;
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.name == "_ZN3art3JNI17GetStringUTFCharsEP7_JNIEnvP8_jstringPh") {
            addrGetStringUTFChars = symbol.address;
            console.log("GetStringUTFChars is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI12NewStringUTFEP7_JNIEnvPKc") {
            addrNewStringUTF = symbol.address;
            console.log("NewStringUTF is at ", symbol.address, symbol.name);
            // Interceptor.attach(symbol.address, {
            //     onEnter: function (args) {
            //         // console.log("intercept", args[2], args[1])
            //     }, onLeave(ret) {
            //
            //         //jstring类型无法直接输出显示，可以类型转换到java.lang.String
            //         var String = Java.use("java.lang.String");
            //         var promt = Java.cast(ptr(ret), String);
            //         // send(prompt);
            //         console.log("NewStringUTF result", promt);
            //         // send("修改say()返回值:" + Java.cast(jstring, str));
            //     }
            // });
        } else if (symbol.name == "_ZN3art3JNI9FindClassEP7_JNIEnvPKc") {
            addrFindClass = symbol.address;
            console.log("FindClass is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI11GetMethodIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetMethodID = symbol.address;
            console.log("GetMethodID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI17GetStaticMethodIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetStaticMethodID = symbol.address;
            console.log("GetStaticMethodID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI10GetFieldIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetFieldID = symbol.address;
            console.log("GetFieldID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI16GetStaticFieldIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetStaticFieldID = symbol.address;
            console.log("GetStaticFieldID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI15RegisterNativesEP7_JNIEnvP7_jclassPK15JNINativeMethodi") {
            addrRegisterNatives = symbol.address;
            console.log("RegisterNatives is at ", symbol.address, symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI11AllocObjectEP7_JNIEnvP7_jclass") >= 0) {
            addrAllocObject = symbol.address;
            console.log("AllocObject is at ", symbol.address, symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI16CallObjectMethodEP7_JNIEnvP8_jobjectP10_jmethodIDz") >= 0) {
            addrCallObjectMethod = symbol.address;
            console.log("CallObjectMethod is at ", symbol.address, symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI14GetObjectClassEP7_JNIEnvP8_jobject") >= 0) {
            addrGetObjectClass = symbol.address;
            console.log("GetObjectClass is at ", symbol.address, symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI21ReleaseStringUTFCharsEP7_JNIEnvP8_jstringPKc") >= 0) {
            addrReleaseStringUTFChars = symbol.address;
            console.log("ReleaseStringUTFChars is at ", symbol.address, symbol.name);
        }
    }
    if (addrGetMethodID) {
        Interceptor.attach(addrGetMethodID, {
            onEnter: function (args) {
                var Class = Java.use("java.lang.Class");
                var clz = Java.cast(ptr(args[1]), Class);
                // console.log("GetMethodID clz",clz, Memory.readCString(ptr(args[2])), Memory.readCString(ptr(args[3])));
                this.methodName = clz.toString() +":"+Memory.readCString(ptr(args[2]))
            }, onLeave(ret) {
                // console.log("GetMethodID ret", ret, this.methodName);
                send("getmethodid|"+ret+"|"+ this.methodName)
                // var meth = nativeMethods.get(ret.toString());
                // if (meth) {
                //     console.log("method ", meth, "  exists")
                // } else {
                //     console.log("set method");
                //     nativeMethods.set(ret.toString(), this.methodName);
                // }
            }
        });
    }
    //
    // if (addrRegisterNatives != null) {
    //     Interceptor.attach(addrRegisterNatives, {
    //         onEnter: function (args) {
    //             console.log("[RegisterNatives] method_count:", args[3]);
    //             var env = args[0];
    //             var java_class = args[1];
    //
    //             var funcAllocObject = new NativeFunction(addrAllocObject, "pointer", ["pointer", "pointer"]);
    //             var funcGetMethodID = new NativeFunction(addrGetMethodID, "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    //             var funcCallObjectMethod = new NativeFunction(addrCallObjectMethod, "pointer", ["pointer", "pointer", "pointer"]);
    //             var funcGetObjectClass = new NativeFunction(addrGetObjectClass, "pointer", ["pointer", "pointer"]);
    //             var funcGetStringUTFChars = new NativeFunction(addrGetStringUTFChars, "pointer", ["pointer", "pointer", "pointer"]);
    //             var funcReleaseStringUTFChars = new NativeFunction(addrReleaseStringUTFChars, "void", ["pointer", "pointer", "pointer"]);
    //
    //             var clz_obj = funcAllocObject(env, java_class);
    //             var mid_getClass = funcGetMethodID(env, java_class, Memory.allocUtf8String("getClass"), Memory.allocUtf8String("()Ljava/lang/Class;"));
    //             var clz_obj2 = funcCallObjectMethod(env, clz_obj, mid_getClass);
    //             var cls = funcGetObjectClass(env, clz_obj2);
    //             var mid_getName = funcGetMethodID(env, cls, Memory.allocUtf8String("getName"), Memory.allocUtf8String("()Ljava/lang/String;"));
    //             var name_jstring = funcCallObjectMethod(env, clz_obj2, mid_getName);
    //             var name_pchar = funcGetStringUTFChars(env, name_jstring, ptr(0));
    //             var class_name = ptr(name_pchar).readCString();
    //             funcReleaseStringUTFChars(env, name_jstring, name_pchar);
    //
    //             //console.log(class_name);
    //
    //             var methods_ptr = ptr(args[2]);
    //
    //             var method_count = parseInt(args[3]);
    //             for (var i = 0; i < method_count; i++) {
    //                 var name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
    //                 var sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
    //                 var fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));
    //
    //                 var name = Memory.readCString(name_ptr);
    //                 var sig = Memory.readCString(sig_ptr);
    //                 var find_module = Process.findModuleByAddress(fnPtr_ptr);
    //                 console.log("[RegisterNatives] java_class:", class_name, "name:", name, "sig:", sig, "fnPtr:", fnPtr_ptr, "module_name:", find_module.name, "module_base:", find_module.base, "offset:", ptr(fnPtr_ptr).sub(find_module.base));
    //
    //             }
    //         },
    //         onLeave: function (retval) {
    //         }
    //     });
    // }

    ishook_libart = true;
}

hook_libart();



function hookShield() {
    var shieldBaseAddr = Module.findBaseAddress("libshield.so");
    console.log("hookShield shieldBaseAddr" + shieldBaseAddr);

    Interceptor.attach(getFuncAddr(shieldBaseAddr, 0x00073B78), {
        onEnter: function (args) {
            console.log("intercept", args[2], args[1])
        }, onLeave(ret) {
            // console.log("intercept result", Memory.readCString(new NativePointer(ret)))
        }
    });
    Interceptor.attach(getFuncAddr(shieldBaseAddr, 0x9858), {
        onEnter: function (args) {
            // console.log("call java method", typeof args[0], typeof args[1], typeof args[2], typeof args[3]);
            // console.log("call java method jclass ", args[0], args[1].toString(), args[2].toString(), args[3]);

            var Object = Java.use("java.lang.Object");
            var promt = Java.cast(ptr(args[1]), Object);
            // send(prompt);
            console.log("call java method jobject", promt.$className, "  args",ptr(ptr(args[3])));
            send("calljavamethod|"+args[2])

            // var env = Java.vm.getEnv();
            //         var cla = env.findClass("com/example/goal/DiyClass");
            //         send("clazz:" + cla);
            //         var initid = env.getMethodId(cla, "<init>", "(I)V");

        }, onLeave(ret) {
            // console.log("intercept result", Memory.readCString(new NativePointer(ret)))
        }
    });

    Interceptor.attach(getFuncAddr(shieldBaseAddr, 0x617CC), {
        onEnter: function (args) {
            console.log("xy-common", args[0], Memory.readUtf8String(args[1]), Memory.readUtf8String(new NativePointer(args[2])))
        }, onLeave(ret) {
            console.log(Memory.readCString(new NativePointer(ret)))
        }
    });
}
//通过模块名直接查找基址
// var soAddr = Module.findBaseAddress("libshield.so");
// console.log("so addr ", soAddr);
// console.log(Module.findExportByName("libshield.so", "intercept"));
// send("soAddr:" + soAddr);
// //   hook导出函数 通过函数名
// send("findExportByName add():" + Module.findExportByName("libshield.so", "Java_com_duapp_aesjni_AESEncrypt_encodeByte"));
// //send("findExportByName edit():"+Module.findExportByName("libnative-lib.so", "_ZL4editP7_JNIEnvP8_jobjecti"))
// Interceptor.attach(Module.findExportByName("libshield.so", "AES_128_ECB_PKCS5Padding_Encrypt"), {
//     onEnter: function (args) {
//         send("AES_128_ECB_PKCS5Padding_Encrypt(" + Memory.readCString(args[0]) + "," + args[1] + ")");
//         const ptr1 = new NativePointer(args[1]);
//         console.log('AES_128_ECB_PKCS5Padding_Encrypt args1',ptr1.readCString(16));
//         // args[0]=Memory.allocUtf8String("a");
//     },
//     onLeave: function (retval) {
//         send("AES_128_ECB_PKCS5Padding_Encrypt ret(" + Memory.readCString(retval) + ")");
//     }
// });

