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

});
