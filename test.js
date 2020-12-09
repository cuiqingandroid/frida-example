Process.enumerateModules({
    onMatch: function (exp) {
        // send('exp:' + exp.name);
        console.log(exp.name);
        // console.log(typeof exp.name)
        if (exp.name === 'libwd-lib.so') {
            send('enumerateModules find libwd-lib.so');
            send(exp.name + "|" + exp.base + "|" + exp.size + "|" + exp.path);
            send(exp);
            return 'stop';
        }
    },
    onComplete: function () {
        send('enumerateModules stop');
    }
});

function getFuncAddr(baseAddr, methodAddr) {
    return new NativePointer(parseInt(baseAddr, 16) + methodAddr + 1)
}

//通过模块名直接查找基址
var soAddr = Module.findBaseAddress("libwd-lib.so");
send("soAddr:" + soAddr);
//   hook导出函数 通过函数名

send("findExportByName getSalt():" + Module.findExportByName("libwd-lib.so", "_Z7getSaltv"));
send("findExportByName var salt:" + Module.findExportByName("libwd-lib.so", "salt"));
console.log(parseInt(soAddr, 16) + 0x0001A020 + 1);
console.log('data1', new NativePointer(Module.findExportByName("libwd-lib.so", "salt")).readCString(20));
console.log('data', Memory.readCString(getFuncAddr(soAddr, 0x0001A020)));
// console.log('data', new NativePointer(0xC4EB9020).readCString(20));
Interceptor.attach(Module.findExportByName("libwd-lib.so", "_Z7getSaltv"), {
    onEnter: function (args) {
        // send("AES_128_ECB_PKCS5Padding_Encrypt(" + Memory.readCString(args[0]) + "," + args[1] + ")");
        // const ptr1 = new NativePointer(args[1]);
        // console.log('AES_128_ECB_PKCS5Padding_Encrypt args1', ptr1.readCString(16));
        // args[0]=Memory.allocUtf8String("a");
        // console.log(args[0])
    },
    onLeave: function (retval) {
        // send("AES_128_ECB_PKCS5Padding_Encrypt ret(" + Memory.readCString(retval) + ")");
         console.log("intercept result", Memory.readCString(new NativePointer(retval)));
    }
});

// Interceptor.attach(getFuncAddr(soAddr, 0xC4EA682C), {
//         onEnter: function (args) {
//             console.log("intercept", args[2], args[1])
//         }, onLeave(ret) {
//             console.log("intercept result", Memory.readCString(new NativePointer(ret)))
//         }
//     });

// Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "AES128_ECB_encrypt"), {
//     onEnter: function (args) {
//         send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
//     },
//     onLeave: function (retval) {
//         send("AES128_ECB_encrypt ret(" + retval + ")");
//     }
// });
// Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "encode"), {
//     onEnter: function (args) {
//         console.log('encode cuiqing', args[0], args[1], args[2], args[3]);
//         // send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
//     },
//     onLeave: function (retval) {
//         // send("AES128_ECB_encrypt ret(" + retval + ")");
//     }
// });
// Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "getValue"), {
//     onEnter: function (args) {
//         console.log('j_getValue cuiqing', Memory.readCString(args[0]));
//         // send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
//     },
//     onLeave: function (retval) {
//         // send("AES128_ECB_encrypt ret(" + retval + ")");
//         console.log('j_getValue ret cuiqing', retval);
//     }
// });
// Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "b64_decode"), {
//     onEnter: function (args) {
//         const ptr1 = new NativePointer(args[0]);
//         console.log('b64_decode cuiqing', args[0], args[1]);
//         console.log('b64_decode cuiqing', ptr1.readCString(26));
//         // send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
//     },
//     onLeave: function (retval) {
//         // send("AES128_ECB_encrypt ret(" + retval + ")");
//         console.log('b64_decode ret cuiqing', retval);
//     }
// });