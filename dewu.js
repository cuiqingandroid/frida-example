Process.enumerateModules({
    onMatch: function (exp) {
        // send('exp:' + exp.name);
        console.log(exp.name);
        // console.log(typeof exp.name)
        if (exp.name === 'libJNIEncrypt.so') {
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


setImmediate(function () {
    var disableOkhttpProxy = function(){
        var restClient = Java.use("com.shizhuang.duapp.common.helper.net.RestClient");
        var clazz = Java.use("java.lang.Class");
        var reflectField = Java.cast(restClient.class, clazz).getDeclaredField("g");
        reflectField.setAccessible(true);
        send("restClient值为："+ reflectField.toString());
        // reflectField.set("java.lang.String", "frida hooking");
        var objRestClient = restClient.n.value;
        console.log(objRestClient);
        var objOkhttpClient = reflectField.get(objRestClient);
        console.log(objOkhttpClient);

        var clzOkHttpClient = Java.use("okhttp3.OkHttpClient");
        var fieldProxy = Java.cast(clzOkHttpClient.class, clazz).getDeclaredField("proxy");
        fieldProxy.setAccessible(true);
        fieldProxy.set(objOkhttpClient, null);
        console.log(fieldProxy.get(objOkhttpClient));

        // var func = clzOkHttpClient.class.getDeclaredMethod("readTimeoutMillis", null);
        // var readTimeoutMillis = func.invoke(objOkhttpClient, null);
        // console.log(readTimeoutMillis);
    };

    Java.perform(function () {
        Java.use('android.net.Proxy').setHttpProxySystemProperty(Java.use('android.net.ProxyInfo').buildDirectProxy('10.0.0.16', 8888));
        disableOkhttpProxy();

        // reflectField.
    });
});

//通过模块名直接查找基址
var soAddr = Module.findBaseAddress("libJNIEncrypt.so");
send("soAddr:" + soAddr);
//   hook导出函数 通过函数名
send("findExportByName add():" + Module.findExportByName("libJNIEncrypt.so", "Java_com_duapp_aesjni_AESEncrypt_encodeByte"));
//send("findExportByName edit():"+Module.findExportByName("libnative-lib.so", "_ZL4editP7_JNIEnvP8_jobjecti"))
Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "AES_128_ECB_PKCS5Padding_Encrypt"), {
    onEnter: function (args) {
        send("AES_128_ECB_PKCS5Padding_Encrypt(" + Memory.readCString(args[0]) + "," + args[1] + ")");
        const ptr1 = new NativePointer(args[1]);
        console.log('AES_128_ECB_PKCS5Padding_Encrypt args1', ptr1.readCString(16));
        // args[0]=Memory.allocUtf8String("a");
    },
    onLeave: function (retval) {
        send("AES_128_ECB_PKCS5Padding_Encrypt ret(" + Memory.readCString(retval) + ")");
    }
});
// Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "AES128_ECB_encrypt"), {
//     onEnter: function (args) {
//         send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
//     },
//     onLeave: function (retval) {
//         send("AES128_ECB_encrypt ret(" + retval + ")");
//     }
// });
Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "encode"), {
    onEnter: function (args) {
        console.log('encode cuiqing', args[0], args[1], args[2], args[3]);
        // send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
    },
    onLeave: function (retval) {
        // send("AES128_ECB_encrypt ret(" + retval + ")");
    }
});
Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "getValue"), {
    onEnter: function (args) {
        console.log('j_getValue cuiqing', Memory.readCString(args[0]));
        // send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
    },
    onLeave: function (retval) {
        // send("AES128_ECB_encrypt ret(" + retval + ")");
        console.log('j_getValue ret cuiqing', retval);
    }
});
Interceptor.attach(Module.findExportByName("libJNIEncrypt.so", "b64_decode"), {
    onEnter: function (args) {
        const ptr1 = new NativePointer(args[0]);
        console.log('b64_decode cuiqing', args[0], args[1]);
        console.log('b64_decode cuiqing', ptr1.readCString(26));
        // send("AES128_ECB_encrypt(" + args[0] + "," + args[1] + ","+ args[2]+")");
    },
    onLeave: function (retval) {
        // send("AES128_ECB_encrypt ret(" + retval + ")");
        console.log('b64_decode ret cuiqing', retval);
    }
});