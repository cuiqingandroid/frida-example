Process.enumerateModules({
    onMatch: function (exp) {
        // send('exp:' + exp.name);
        console.log(exp.name);
        // console.log(typeof exp.name)
        if (exp.name === 'libshield.so') {
            send('enumerateModules find');
            send(exp.name + "|" + exp.base + "|" + exp.size + "|" + exp.path);
            send(exp);
            return 'stop';
        }
    },
    onComplete: function () {
        send('enumerateModules stop');
    }
});


//通过模块名直接查找基址
// var soAddr = Module.findBaseAddress("libshield.so");
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