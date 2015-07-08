// 项目默认的配置
fis.config.set('project.charset', 'utf8');
fis.config.set('project.md5Length', 8);


fis.config.set('roadmap.path', [
    // 不对lib下面的开源工具进行预处理
    {
        reg: /\/common\/lib\/.*/,
        useParser: false,
        usePreprocessor: false,
        usePostprocessor: false,
        useOptimizer: false,
        useLint: false,
        useTest: false,
        useSprite: false
    },
    // 不发布less文件
    {
        reg: /\.(less|md)$/,
        release: false
    },
    // 不改变文件里面的引用路径（因为本地访问方式，改变路径会造成引用出错）
    {
        reg: /.*\.(es6|jsx?|css|less|html)$/,
        useStandard: false,
        useCache: false
    }
]);



// es6插件配置
fis.config.set('project.fileType.es6', 'es6');
fis.config.set('modules.parser.es6', 'es6-babel');
fis.config.set('roadmap.ext.es6', 'js');
// fis.config.set('modules.parser.js', 'es6-babel');



// 设置压缩插件配置
fis.config.set('settings.optimizer.uglify-js', {
    mangle: {
        except: 'exports,module,require,define'
    },
    output: {
        // beautify: true
    },
    compress: {
        // drop_console: true
    }
});


// 打包插件
fis.config.set('pack', {
    // 合并base/style下的所有css文件
    'common/base/style/pageview.css': /common\/base\/style\/.+\.css$/
});