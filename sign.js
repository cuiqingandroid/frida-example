Process.enumerateModules({
    onMatch: function (exp) {
        // send('exp:' + exp.name);
        console.log(exp.name);
    },
    onComplete: function () {
        send('enumerateModules stop');
    }
});


setImmediate(function () {

    Java.perform(function(){
        var MD5 = Java.use("com.duia.signature.MD5");
        MD5.GetMD5Code.implementation=function(str){
            console.log(str);

            var result = this.GetMD5Code(str);
            console.log('result: '+ result);

            // 为了让程序正常运行，需要调用原方法将结果返回。若想修改参数值，可以在调用时直接将参数替换，
            return result;
        }
    });


    // var disableOkhttpProxy = function(){
    //     var restClient = Java.use("com.shizhuang.duapp.common.helper.net.RestClient");
    //     var clazz = Java.use("java.lang.Class");
    //     var reflectField = Java.cast(restClient.class, clazz).getDeclaredField("g");
    //     reflectField.setAccessible(true);
    //     send("restClient值为："+ reflectField.toString());
    //     // reflectField.set("java.lang.String", "frida hooking");
    //     var objRestClient = restClient.n.value;
    //     console.log(objRestClient);
    //     var objOkhttpClient = reflectField.get(objRestClient);
    //     console.log(objOkhttpClient);
    //
    //     var clzOkHttpClient = Java.use("okhttp3.OkHttpClient");
    //     var fieldProxy = Java.cast(clzOkHttpClient.class, clazz).getDeclaredField("proxy");
    //     fieldProxy.setAccessible(true);
    //     fieldProxy.set(objOkhttpClient, null);
    //     console.log(fieldProxy.get(objOkhttpClient));
    //
    //     // var func = clzOkHttpClient.class.getDeclaredMethod("readTimeoutMillis", null);
    //     // var readTimeoutMillis = func.invoke(objOkhttpClient, null);
    //     // console.log(readTimeoutMillis);
    // };
    //
    // Java.perform(function () {
    //     Java.use('android.net.Proxy').setHttpProxySystemProperty(Java.use('android.net.ProxyInfo').buildDirectProxy('10.0.0.16', 8888));
    //     disableOkhttpProxy();
    //
    //     // reflectField.
    // });
});
